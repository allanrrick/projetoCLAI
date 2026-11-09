import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { FileCheck2, Plus, Trash2 } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { formatDate } from '../lib/format'
import { useResource } from '../hooks/useResource'
import { Empty, Loading, Notice, PageTitle } from '../components/common'
import type {
  GrupoAspecto,
  NivelAprendizado,
  RelatorioAcompanhamento,
  RelatorioAspecto,
} from '../types'

const OPCOES_ASPECTOS: { grupo: GrupoAspecto; titulo: string; opcoes: string[] }[] = [
  {
    grupo: 'RELACIONAMENTO',
    titulo: 'Aspectos de relacionamento',
    opcoes: [
      'Interage bem com colegas e docentes',
      'Participa de atividades em grupo',
      'Solicita auxílio quando necessário',
      'Comunica-se de forma assertiva',
    ],
  },
  {
    grupo: 'COGNITIVO',
    titulo: 'Aspectos cognitivos',
    opcoes: [
      'Compreende os conceitos trabalhados',
      'Realiza as atividades no tempo proposto',
      'Utiliza recursos de tecnologia assistiva',
      'Demonstra autonomia nos estudos',
    ],
  },
  {
    grupo: 'SOCIOEMOCIONAL',
    titulo: 'Aspectos socioemocionais',
    opcoes: [
      'Demonstra motivação e interesse',
      'Adapta-se bem à rotina acadêmica',
      'Apresenta pontualidade e assiduidade',
      'Lida bem com avaliações e prazos',
    ],
  },
]

const NIVEIS_LABELS: Record<NivelAprendizado, string> = {
  SATISFATORIO: 'Satisfatório',
  BOM: 'Bom',
  OTIMO: 'Ótimo',
}

function localDate() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

type HabilidadeDraft = {
  habilidadeDesenvolvida: string
  nivelAprendizado: NivelAprendizado
  observacoes: string
}

export function Relatorios() {
  const [params] = useSearchParams()
  const {
    data: alunos,
    error: loadError,
    loading,
    retry,
  } = useResource(api.alunos)
  const [relatorios, setRelatorios] = useState<RelatorioAcompanhamento[]>([])
  const [loadingRelatorios, setLoadingRelatorios] = useState(true)
  const [alunoId, setAlunoId] = useState(params.get('aluno') || '')
  const [aspectosSelecionados, setAspectosSelecionados] = useState<
    RelatorioAspecto[]
  >([])
  const [habilidades, setHabilidades] = useState<HabilidadeDraft[]>([
    {
      habilidadeDesenvolvida: '',
      nivelAprendizado: 'BOM',
      observacoes: '',
    },
  ])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    let active = true
    setLoadingRelatorios(true)
    api
      .relatorios()
      .then((items) => {
        if (active) setRelatorios(items)
      })
      .catch(() => {
        if (active) setRelatorios([])
      })
      .finally(() => {
        if (active) setLoadingRelatorios(false)
      })
    return () => {
      active = false
    }
  }, [])

  function toggleAspecto(grupo: GrupoAspecto, opcao: string) {
    setAspectosSelecionados((prev) => {
      const exists = prev.some(
        (item) => item.grupo === grupo && item.opcao === opcao,
      )
      return exists
        ? prev.filter(
            (item) => !(item.grupo === grupo && item.opcao === opcao),
          )
        : [...prev, { grupo, opcao }]
    })
  }

  function updateHabilidade(
    index: number,
    patch: Partial<HabilidadeDraft>,
  ) {
    setHabilidades((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    )
  }

  function addHabilidade() {
    if (habilidades.length >= 7) return
    setHabilidades((prev) => [
      ...prev,
      {
        habilidadeDesenvolvida: '',
        nivelAprendizado: 'BOM',
        observacoes: '',
      },
    ])
  }

  function removeHabilidade(index: number) {
    setHabilidades((prev) => prev.filter((_, i) => i !== index))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    const form = event.currentTarget
    const values = new FormData(form)
    const selectedId = Number(values.get('alunoId'))
    const periodoLetivo = String(values.get('periodoLetivo') || '').trim()
    const componenteCurricular = String(
      values.get('componenteCurricular') || '',
    ).trim()
    const docente = String(values.get('docente') || '').trim()
    const dataRelatorio = String(values.get('dataRelatorio') || '').trim()
    const comentarioRelacionamento = String(
      values.get('comentarioRelacionamento') || '',
    ).trim()
    const comentarioCognitivo = String(
      values.get('comentarioCognitivo') || '',
    ).trim()
    const comentarioSocioemocional = String(
      values.get('comentarioSocioemocional') || '',
    ).trim()
    const avancosGerais = String(values.get('avancosGerais') || '').trim()
    const relatoDificuldades = String(
      values.get('relatoDificuldades') || '',
    ).trim()
    const fatoresExternos = String(values.get('fatoresExternos') || '').trim()
    const parecer = String(values.get('parecer') || '').trim()

    if (
      !selectedId ||
      !periodoLetivo ||
      !componenteCurricular ||
      !docente ||
      !dataRelatorio ||
      !parecer
    ) {
      setError(
        'Preencha aluno, período letivo, componente curricular, docente, data do relatório e parecer conclusivo.',
      )
      return
    }

    const habilidadesValidas = habilidades
      .map((item) => ({
        habilidadeDesenvolvida: item.habilidadeDesenvolvida.trim(),
        nivelAprendizado: item.nivelAprendizado,
        observacoes: item.observacoes.trim() || null,
      }))
      .filter((item) => item.habilidadeDesenvolvida.length > 0)
      .map((item, idx) => ({
        ...item,
        ordem: idx + 1,
      }))

    setError('')
    setSuccess('')
    setPending(true)
    try {
      const criado = await api.cadastrarRelatorio({
        alunoId: selectedId,
        periodoLetivo,
        componenteCurricular,
        docente,
        dataRelatorio,
        comentarioRelacionamento: comentarioRelacionamento || null,
        comentarioCognitivo: comentarioCognitivo || null,
        comentarioSocioemocional: comentarioSocioemocional || null,
        avancosGerais: avancosGerais || null,
        relatoDificuldades: relatoDificuldades || null,
        fatoresExternos: fatoresExternos || null,
        aspectos: aspectosSelecionados,
        habilidades: habilidadesValidas,
        parecer,
      })
      setRelatorios((prev) => [
        { ...criado, alunoId: criado.alunoId || selectedId },
        ...prev,
      ])
      form.reset()
      setAlunoId(String(selectedId))
      setAspectosSelecionados([])
      setHabilidades([
        {
          habilidadeDesenvolvida: '',
          nivelAprendizado: 'BOM',
          observacoes: '',
        },
      ])
      setSuccess('Relatório de acompanhamento registrado com sucesso.')
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'Não foi possível registrar o relatório de acompanhamento.',
      )
    } finally {
      setPending(false)
    }
  }

  const relatoriosVisiveis = alunoId
    ? relatorios.filter((item) => item.alunoId === Number(alunoId))
    : relatorios

  return (
    <>
      <PageTitle
        eyebrow="ACOMPANHAMENTO INDIVIDUALIZADO"
        title="Relatório de acompanhamento"
        description="Registre e consulte o desenvolvimento acadêmico, cognitivo e socioemocional do estudante."
      />
      {loading ? (
        <Loading />
      ) : loadError ? (
        <>
          <Notice>{loadError}</Notice>
          <button className="button secondary" onClick={retry}>
            Tentar novamente
          </button>
        </>
      ) : (
        <div className="form-layout">
          <section className="panel form-panel">
            <div className="panel-heading">
              <span className="section-icon">
                <FileCheck2 size={22} />
              </span>
              <div>
                <h2>Preencher relatório de acompanhamento</h2>
                <p>Os campos marcados com * são obrigatórios.</p>
              </div>
            </div>
            {error && <Notice>{error}</Notice>}
            {success && <Notice success>{success}</Notice>}
            <form onSubmit={submit} noValidate>
              <fieldset disabled={pending}>
                <div className="form-grid">
                  <div className="field full">
                    <label htmlFor="relatorio-aluno">Aluno *</label>
                    <select
                      id="relatorio-aluno"
                      name="alunoId"
                      value={alunoId}
                      onChange={(event) => setAlunoId(event.target.value)}
                      required
                    >
                      <option value="">Selecione o aluno</option>
                      {alunos?.map((aluno) => (
                        <option key={aluno.idAluno} value={aluno.idAluno}>
                          {aluno.nome} · {aluno.matricula} ({aluno.curso})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="periodoLetivo">Período letivo *</label>
                    <input
                      id="periodoLetivo"
                      name="periodoLetivo"
                      placeholder="Ex.: 2026.2"
                      maxLength={50}
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="dataRelatorio">Data do relatório *</label>
                    <input
                      id="dataRelatorio"
                      name="dataRelatorio"
                      type="date"
                      defaultValue={localDate()}
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="componenteCurricular">
                      Componente curricular *
                    </label>
                    <input
                      id="componenteCurricular"
                      name="componenteCurricular"
                      placeholder="Disciplina ou atividade"
                      maxLength={150}
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="docente">Docente *</label>
                    <input
                      id="docente"
                      name="docente"
                      placeholder="Nome do docente responsável"
                      maxLength={150}
                      required
                    />
                  </div>

                  {OPCOES_ASPECTOS.map(({ grupo, titulo, opcoes }) => (
                    <div className="field full" key={grupo}>
                      <span className="field-group-title">{titulo}</span>
                      <div className="checkbox-grid">
                        {opcoes.map((opcao) => {
                          const checked = aspectosSelecionados.some(
                            (item) =>
                              item.grupo === grupo && item.opcao === opcao,
                          )
                          return (
                            <label key={opcao} className="checkbox-option">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleAspecto(grupo, opcao)}
                              />
                              <span>{opcao}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  ))}

                  <div className="field full">
                    <label htmlFor="comentarioRelacionamento">
                      Comentário sobre relacionamento
                    </label>
                    <textarea
                      id="comentarioRelacionamento"
                      name="comentarioRelacionamento"
                      rows={2}
                      placeholder="Observações sobre interação e convivência…"
                    />
                  </div>
                  <div className="field full">
                    <label htmlFor="comentarioCognitivo">
                      Comentário cognitivo
                    </label>
                    <textarea
                      id="comentarioCognitivo"
                      name="comentarioCognitivo"
                      rows={2}
                      placeholder="Observações sobre compreensão e aprendizagem…"
                    />
                  </div>
                  <div className="field full">
                    <label htmlFor="comentarioSocioemocional">
                      Comentário socioemocional
                    </label>
                    <textarea
                      id="comentarioSocioemocional"
                      name="comentarioSocioemocional"
                      rows={2}
                      placeholder="Observações sobre autonomia, motivação e adaptação…"
                    />
                  </div>

                  <div className="field full">
                    <div className="subform-header">
                      <span className="field-group-title">
                        Habilidades desenvolvidas (até 7)
                      </span>
                      {habilidades.length < 7 && (
                        <button
                          type="button"
                          className="button secondary"
                          onClick={addHabilidade}
                        >
                          <Plus size={16} />
                          Adicionar habilidade
                        </button>
                      )}
                    </div>
                    <div className="dynamic-list">
                      {habilidades.map((item, index) => (
                        <div className="dynamic-row" key={index}>
                          <div className="field">
                            <label htmlFor={`habilidade-${index}`}>
                              Habilidade {index + 1}
                            </label>
                            <input
                              id={`habilidade-${index}`}
                              placeholder="Descreva a habilidade trabalhada"
                              value={item.habilidadeDesenvolvida}
                              onChange={(event) =>
                                updateHabilidade(index, {
                                  habilidadeDesenvolvida: event.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="field">
                            <label htmlFor={`nivel-${index}`}>
                              Nível de aprendizado {index + 1}
                            </label>
                            <select
                              id={`nivel-${index}`}
                              value={item.nivelAprendizado}
                              onChange={(event) =>
                                updateHabilidade(index, {
                                  nivelAprendizado: event.target
                                    .value as NivelAprendizado,
                                })
                              }
                            >
                              <option value="SATISFATORIO">Satisfatório</option>
                              <option value="BOM">Bom</option>
                              <option value="OTIMO">Ótimo</option>
                            </select>
                          </div>
                          <div className="field full">
                            <label htmlFor={`obs-habilidade-${index}`}>
                              Observações da habilidade {index + 1}
                            </label>
                            <div className="inline-input-row">
                              <input
                                id={`obs-habilidade-${index}`}
                                placeholder="Observações complementares (opcional)"
                                value={item.observacoes}
                                onChange={(event) =>
                                  updateHabilidade(index, {
                                    observacoes: event.target.value,
                                  })
                                }
                              />
                              {habilidades.length > 1 && (
                                <button
                                  type="button"
                                  className="icon-button"
                                  aria-label={`Remover habilidade ${index + 1}`}
                                  onClick={() => removeHabilidade(index)}
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="field full">
                    <label htmlFor="avancosGerais">Avanços gerais</label>
                    <textarea
                      id="avancosGerais"
                      name="avancosGerais"
                      rows={2}
                      placeholder="Principais avanços percebidos no período…"
                    />
                  </div>
                  <div className="field full">
                    <label htmlFor="relatoDificuldades">
                      Relato de dificuldades
                    </label>
                    <textarea
                      id="relatoDificuldades"
                      name="relatoDificuldades"
                      rows={2}
                      placeholder="Principais dificuldades identificadas…"
                    />
                  </div>
                  <div className="field full">
                    <label htmlFor="fatoresExternos">Fatores externos</label>
                    <textarea
                      id="fatoresExternos"
                      name="fatoresExternos"
                      rows={2}
                      placeholder="Fatores externos relevantes ao acompanhamento…"
                    />
                  </div>
                  <div className="field full">
                    <label htmlFor="parecer">Parecer conclusivo *</label>
                    <textarea
                      id="parecer"
                      name="parecer"
                      rows={3}
                      placeholder="Síntese e encaminhamentos do relatório…"
                      required
                    />
                  </div>
                </div>
              </fieldset>
              <div className="form-actions">
                <button
                  type="submit"
                  className="button primary"
                  disabled={pending}
                >
                  {pending ? 'Salvando…' : 'Salvar relatório'}
                </button>
              </div>
            </form>
          </section>

          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>
                  Relatórios registrados{' '}
                  <span className="count-badge">
                    {relatoriosVisiveis.length}
                  </span>
                </h2>
                <p>
                  Consulte os relatórios de acompanhamento emitidos para os
                  estudantes.
                </p>
              </div>
            </div>
            {loadingRelatorios ? (
              <Loading />
            ) : relatoriosVisiveis.length === 0 ? (
              <Empty title="Nenhum relatório registrado">
                Preencha o formulário acima para registrar o primeiro relatório
                de acompanhamento.
              </Empty>
            ) : (
              <ul className="timeline">
                {relatoriosVisiveis.map((item) => {
                  const estudante = alunos?.find(
                    (aluno) => aluno.idAluno === item.alunoId,
                  )
                  return (
                    <li key={item.id}>
                      <span className="timeline-dot">
                        <FileCheck2 size={16} />
                      </span>
                      <article>
                        <div className="timeline-header">
                          <h3>
                            {item.componenteCurricular} · {item.periodoLetivo}
                          </h3>
                          <span>{formatDate(item.dataRelatorio)}</span>
                        </div>
                        <p className="professional">
                          {estudante
                            ? `${estudante.nome} (${estudante.matricula}) · `
                            : ''}
                          Docente: {item.docente}
                        </p>
                        <p className="observations">{item.parecer}</p>
                        {item.aspectos?.length > 0 && (
                          <ul className="attachments">
                            {item.aspectos.map((aspecto, idx) => (
                              <li key={`${aspecto.grupo}-${aspecto.opcao}-${idx}`}>
                                {aspecto.opcao}
                              </li>
                            ))}
                          </ul>
                        )}
                        {item.habilidades?.length > 0 && (
                          <ul className="attachments">
                            {item.habilidades.map((hab, idx) => (
                              <li key={`${hab.ordem}-${idx}`}>
                                {hab.habilidadeDesenvolvida} (
                                {NIVEIS_LABELS[hab.nivelAprendizado] ||
                                  hab.nivelAprendizado}
                                )
                              </li>
                            ))}
                          </ul>
                        )}
                      </article>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>
      )}
    </>
  )
}
