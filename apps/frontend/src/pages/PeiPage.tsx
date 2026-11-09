import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { BookOpenCheck, Plus, Trash2 } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { formatDate } from '../lib/format'
import { useResource } from '../hooks/useResource'
import { Empty, Loading, Notice, PageTitle } from '../components/common'
import type { Pei } from '../types'

export function PeiPage() {
  const [params] = useSearchParams()
  const {
    data: alunos,
    error: loadError,
    loading,
    retry,
  } = useResource(api.alunos)
  const [matriculaSelecionada, setMatriculaSelecionada] = useState(
    params.get('matricula') || '',
  )
  const [afinidades, setAfinidades] = useState<string[]>([''])
  const [peis, setPeis] = useState<Pei[]>([])
  const [loadingPeis, setLoadingPeis] = useState(false)
  const [reloadCount, setReloadCount] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pending, setPending] = useState(false)

  const matriculaAtiva = matriculaSelecionada || alunos?.[0]?.matricula || ''

  useEffect(() => {
    if (!matriculaAtiva) return
    let active = true
    api
      .peis(matriculaAtiva)
      .then((items) => {
        if (active) setPeis(items)
      })
      .catch(() => {
        if (active) setPeis([])
      })
      .finally(() => {
        if (active) setLoadingPeis(false)
      })
    return () => {
      active = false
    }
  }, [matriculaAtiva, reloadCount])

  function updateAfinidade(index: number, value: string) {
    setAfinidades((prev) => prev.map((item, i) => (i === index ? value : item)))
  }

  function addAfinidade() {
    setAfinidades((prev) => [...prev, ''])
  }

  function removeAfinidade(index: number) {
    setAfinidades((prev) => prev.filter((_, i) => i !== index))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    const form = event.currentTarget
    const values = new FormData(form)
    const alunoMatricula = String(values.get('alunoMatricula') || '').trim()
    const periodoLetivo = String(values.get('periodoLetivo') || '').trim()
    const historico = String(values.get('historico') || '').trim()
    const necessidades = String(values.get('necessidades') || '').trim()
    const dificuldades = String(values.get('dificuldades') || '').trim()
    const propostas = String(values.get('propostas') || '').trim()
    const afinidadesValidas = afinidades
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .map((afinidade) => ({ afinidade }))

    if (
      !alunoMatricula ||
      !periodoLetivo ||
      !historico ||
      !necessidades ||
      !dificuldades ||
      !propostas ||
      afinidadesValidas.length === 0
    ) {
      setError(
        'Preencha todos os campos obrigatórios do PEI (aluno, período letivo, histórico, necessidades específicas, dificuldades, propostas de adaptação e ao menos uma afinidade).',
      )
      return
    }

    setError('')
    setSuccess('')
    setPending(true)
    try {
      await api.cadastrarPei({
        alunoMatricula,
        periodoLetivo,
        historico,
        necessidades,
        afinidades: afinidadesValidas,
        dificuldades,
        propostas,
      })
      form.reset()
      setMatriculaSelecionada(alunoMatricula)
      setAfinidades([''])
      setLoadingPeis(true)
      setReloadCount((count) => count + 1)
      setSuccess(
        'Plano Educacional Individualizado (PEI) registrado com sucesso.',
      )
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'Não foi possível registrar o PEI.',
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <PageTitle
        eyebrow="INCLUSÃO PEDAGÓGICA"
        title="Plano Educacional Individualizado (PEI)"
        description="Registre e consulte o histórico, as necessidades específicas, afinidades, dificuldades e propostas de adaptação do estudante."
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
                <BookOpenCheck size={22} />
              </span>
              <div>
                <h2>Registrar PEI</h2>
                <p>Os campos marcados com * são obrigatórios.</p>
              </div>
            </div>
            {error && <Notice>{error}</Notice>}
            {success && <Notice success>{success}</Notice>}
            <form onSubmit={submit} noValidate>
              <fieldset disabled={pending}>
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="pei-aluno">Aluno *</label>
                    <select
                      id="pei-aluno"
                      name="alunoMatricula"
                      value={matriculaAtiva}
                      onChange={(event) => {
                        setLoadingPeis(true)
                        setMatriculaSelecionada(event.target.value)
                      }}
                      required
                    >
                      <option value="">Selecione o aluno</option>
                      {alunos?.map((aluno) => (
                        <option key={aluno.idAluno} value={aluno.matricula}>
                          {aluno.nome} · {aluno.matricula} ({aluno.curso})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="pei-periodo">Período letivo *</label>
                    <input
                      id="pei-periodo"
                      name="periodoLetivo"
                      placeholder="Ex.: 2026.2"
                      maxLength={50}
                      required
                    />
                  </div>
                  <div className="field full">
                    <label htmlFor="pei-historico">Histórico do aluno *</label>
                    <textarea
                      id="pei-historico"
                      name="historico"
                      rows={3}
                      placeholder="Descreva a trajetória acadêmica e de acompanhamento do estudante…"
                      required
                    />
                  </div>
                  <div className="field full">
                    <label htmlFor="pei-necessidades">
                      Necessidades educacionais específicas *
                    </label>
                    <textarea
                      id="pei-necessidades"
                      name="necessidades"
                      rows={3}
                      placeholder="Informe as condições, recursos e apoios específicos necessários…"
                      required
                    />
                  </div>
                  <div className="field full">
                    <div className="subform-header">
                      <span className="field-group-title">
                        Afinidades e potencialidades *
                      </span>
                      <button
                        type="button"
                        className="button secondary"
                        onClick={addAfinidade}
                      >
                        <Plus size={16} />
                        Adicionar afinidade
                      </button>
                    </div>
                    <div className="dynamic-list">
                      {afinidades.map((afinidade, index) => (
                        <div className="inline-input-row" key={index}>
                          <input
                            id={`afinidade-${index}`}
                            aria-label={`Afinidade ${index + 1}`}
                            placeholder="Ex.: Projetos práticos, recursos visuais, trabalho colaborativo…"
                            value={afinidade}
                            onChange={(event) =>
                              updateAfinidade(index, event.target.value)
                            }
                          />
                          {afinidades.length > 1 && (
                            <button
                              type="button"
                              className="icon-button"
                              aria-label={`Remover afinidade ${index + 1}`}
                              onClick={() => removeAfinidade(index)}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="field full">
                    <label htmlFor="pei-dificuldades">
                      Dificuldades identificadas *
                    </label>
                    <textarea
                      id="pei-dificuldades"
                      name="dificuldades"
                      rows={3}
                      placeholder="Descreva as barreiras ou dificuldades pedagógicas observadas…"
                      required
                    />
                  </div>
                  <div className="field full">
                    <label htmlFor="pei-propostas">
                      Propostas de adaptação *
                    </label>
                    <textarea
                      id="pei-propostas"
                      name="propostas"
                      rows={3}
                      placeholder="Estratégias pedagógicas, adaptações curriculares e avaliativas recomendadas…"
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
                  {pending ? 'Salvando…' : 'Registrar PEI'}
                </button>
              </div>
            </form>
          </section>

          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>
                  PEIs do aluno{' '}
                  <span className="count-badge">{peis.length}</span>
                </h2>
                <p>
                  Consulte os Planos Educacionais Individualizados vinculados ao
                  estudante selecionado.
                </p>
              </div>
            </div>
            {loadingPeis ? (
              <Loading />
            ) : peis.length === 0 ? (
              <Empty title="Nenhum PEI registrado para este aluno">
                Preencha o formulário acima para cadastrar o Plano Educacional
                Individualizado.
              </Empty>
            ) : (
              <ul className="timeline">
                {peis.map((item) => (
                  <li key={item.id}>
                    <span className="timeline-dot">
                      <BookOpenCheck size={16} />
                    </span>
                    <article>
                      <div className="timeline-header">
                        <h3>Período letivo {item.periodoLetivo}</h3>
                        <span>{formatDate(item.dataCriacao)}</span>
                      </div>
                      <p className="professional">
                        Necessidades: {item.necessidadesEspecificas}
                      </p>
                      <p className="observations">
                        <strong>Histórico:</strong> {item.historico}
                        {'\n'}
                        <strong>Dificuldades:</strong> {item.dificuldades}
                        {'\n'}
                        <strong>Propostas de adaptação:</strong>{' '}
                        {item.propostasAdaptacao}
                      </p>
                      {item.afinidades?.length > 0 && (
                        <ul className="attachments">
                          {item.afinidades.map((af, idx) => (
                            <li key={af.id || idx}>{af.afinidade}</li>
                          ))}
                        </ul>
                      )}
                    </article>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </>
  )
}
