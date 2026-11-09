import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { ClipboardCheck } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context'
import { api } from '../lib/api'
import { formatDate, initials } from '../lib/format'
import { useResource } from '../hooks/useResource'
import { Empty, Loading, Notice, PageTitle } from '../components/common'
import type { PlanoAcao } from '../types'

function localDate() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export function PlanosAcaoPage() {
  const [params, setParams] = useSearchParams()
  const { session, can } = useAuth()
  const {
    data: alunos,
    error: loadError,
    loading,
    retry,
  } = useResource(api.alunos)

  const selectedParam = Number(params.get('aluno'))
  const alunoSelecionado =
    alunos?.find((item) => item.idAluno === selectedParam) || alunos?.[0]
  const idAlunoAtivo = alunoSelecionado?.idAluno || 0

  const [possuiComorbidades, setPossuiComorbidades] = useState(false)
  const [usoMedicacaoContinua, setUsoMedicacaoContinua] = useState(false)
  const [planos, setPlanos] = useState<PlanoAcao[]>([])
  const [loadingPlanos, setLoadingPlanos] = useState(false)
  const [planosError, setPlanosError] = useState('')
  const [reloadCount, setReloadCount] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!idAlunoAtivo) return
    const controller = new AbortController()
    let active = true
    api
      .planosAcao(idAlunoAtivo, controller.signal)
      .then((items) => {
        if (!active) return
        setPlanos(items)
        setPlanosError('')
      })
      .catch((reason: unknown) => {
        if (!active || controller.signal.aborted) return
        setPlanos([])
        setPlanosError(
          reason instanceof Error
            ? reason.message
            : 'Não foi possível carregar os planos de ação.',
        )
      })
      .finally(() => {
        if (active && !controller.signal.aborted) setLoadingPlanos(false)
      })
    return () => {
      active = false
      controller.abort()
    }
  }, [idAlunoAtivo, reloadCount])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending || !alunoSelecionado) return
    const form = event.currentTarget
    const values = new FormData(form)

    const responsavelNome = String(values.get('responsavelNome') || '').trim()
    const responsavelParentesco = String(
      values.get('responsavelParentesco') || '',
    ).trim()
    const responsavelContato = String(
      values.get('responsavelContato') || '',
    ).trim()
    const comorbidades = String(values.get('comorbidades') || '').trim()
    const medicacaoContinua = String(
      values.get('medicacaoContinua') || '',
    ).trim()
    const servicosApoio = String(values.get('servicosApoio') || '').trim()
    const documentosComprobatorios = String(
      values.get('documentosComprobatorios') || '',
    ).trim()
    const necessidadesEspecificas = String(
      values.get('necessidadesEspecificas') || '',
    ).trim()
    const percursoEducacional = String(
      values.get('percursoEducacional') || '',
    ).trim()
    const principaisDemandas = String(
      values.get('principaisDemandas') || '',
    ).trim()
    const propostasIntervencao = String(
      values.get('propostasIntervencao') || '',
    ).trim()
    const assinaturaCoordenador = String(
      values.get('assinaturaCoordenador') || '',
    ).trim()
    const dataDocumento = String(values.get('dataDocumento') || '').trim()

    if (
      !necessidadesEspecificas ||
      !percursoEducacional ||
      !principaisDemandas ||
      !propostasIntervencao ||
      !assinaturaCoordenador ||
      !dataDocumento
    ) {
      setError(
        'Preencha todas as seções obrigatórias do plano de ação, a assinatura da coordenação e a data do documento. Campos com apenas espaços não são válidos.',
      )
      return
    }
    if (possuiComorbidades && !comorbidades) {
      setError(
        'Descreva as comorbidades quando marcado que o aluno possui comorbidades.',
      )
      return
    }
    if (usoMedicacaoContinua && !medicacaoContinua) {
      setError(
        'Descreva a medicação de uso contínuo quando marcado que o aluno faz uso.',
      )
      return
    }

    setError('')
    setSuccess('')
    setPending(true)
    try {
      const criado = await api.cadastrarPlanoAcao({
        idAluno: alunoSelecionado.idAluno,
        responsavelNome: responsavelNome || null,
        responsavelParentesco: responsavelParentesco || null,
        responsavelContato: responsavelContato || null,
        possuiComorbidades,
        comorbidades: possuiComorbidades ? comorbidades : null,
        usoMedicacaoContinua,
        medicacaoContinua: usoMedicacaoContinua ? medicacaoContinua : null,
        servicosApoio: servicosApoio || null,
        documentosComprobatorios: documentosComprobatorios || null,
        necessidadesEspecificas,
        percursoEducacional,
        principaisDemandas,
        propostasIntervencao,
        assinaturaCoordenador,
        dataDocumento,
      })
      setPlanos((prev) => [criado, ...prev])
      form.reset()
      setPossuiComorbidades(false)
      setUsoMedicacaoContinua(false)
      setSuccess('Plano de ação registrado com sucesso.')
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'Não foi possível registrar o plano de ação.',
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <PageTitle
        eyebrow="ANEXO II · MODELO INSTITUCIONAL"
        title="Planos de ação da CLAI"
        description="Registre e consulte o plano de ação individualizado vinculado ao estudante."
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
      ) : !alunos?.length ? (
        <Empty title="Cadastre um aluno para registrar planos de ação">
          Os planos de ação são vinculados aos estudantes cadastrados na CLAI.
        </Empty>
      ) : (
        <>
          <section className="panel student-picker">
            <label htmlFor="plano-aluno-select">Selecione um aluno</label>
            <select
              id="plano-aluno-select"
              value={alunoSelecionado?.idAluno || ''}
              onChange={(event) => {
                setError('')
                setSuccess('')
                setPlanosError('')
                setLoadingPlanos(true)
                setParams({ aluno: event.target.value })
              }}
            >
              {alunos.map((aluno) => (
                <option key={aluno.idAluno} value={aluno.idAluno}>
                  {aluno.nome} · {aluno.matricula} ({aluno.curso})
                </option>
              ))}
            </select>
          </section>

          {alunoSelecionado && (
            <div className="form-layout">
              {can('planos:cadastrar') && (
                <section className="panel form-panel">
                  <div className="student-summary">
                    <span className="avatar large">
                      {initials(alunoSelecionado.nome)}
                    </span>
                    <div>
                      <h2>{alunoSelecionado.nome}</h2>
                      <p>
                        Matrícula {alunoSelecionado.matricula}
                        <span>•</span>
                        {alunoSelecionado.curso}
                        <span>•</span>
                        {alunoSelecionado.email || 'E-mail não informado'}
                      </p>
                    </div>
                  </div>
                  <div className="panel-heading">
                    <span className="section-icon">
                      <ClipboardCheck size={22} />
                    </span>
                    <div>
                      <h2>Novo plano de ação</h2>
                      <p>Os campos marcados com * são obrigatórios.</p>
                    </div>
                  </div>
                  {error && <Notice>{error}</Notice>}
                  {success && <Notice success>{success}</Notice>}
                  <form onSubmit={submit} noValidate>
                    <fieldset disabled={pending}>
                      <div className="form-grid">
                        <div className="field">
                          <label htmlFor="responsavelNome">
                            Nome do responsável
                          </label>
                          <input
                            id="responsavelNome"
                            name="responsavelNome"
                            placeholder="Familiar ou contato de referência"
                            maxLength={150}
                          />
                        </div>
                        <div className="field">
                          <label htmlFor="responsavelParentesco">
                            Parentesco / vínculo
                          </label>
                          <input
                            id="responsavelParentesco"
                            name="responsavelParentesco"
                            placeholder="Ex.: Mãe, Pai, Responsável legal"
                            maxLength={80}
                          />
                        </div>
                        <div className="field full">
                          <label htmlFor="responsavelContato">
                            Contato do responsável
                          </label>
                          <input
                            id="responsavelContato"
                            name="responsavelContato"
                            placeholder="Telefone ou e-mail do responsável"
                            maxLength={100}
                          />
                        </div>

                        <div className="field full">
                          <label className="checkbox-option">
                            <input
                              type="checkbox"
                              checked={possuiComorbidades}
                              onChange={(event) =>
                                setPossuiComorbidades(event.target.checked)
                              }
                            />
                            <span>O aluno possui comorbidades?</span>
                          </label>
                        </div>
                        {possuiComorbidades && (
                          <div className="field full">
                            <label htmlFor="comorbidades">
                              Descrição das comorbidades *
                            </label>
                            <textarea
                              id="comorbidades"
                              name="comorbidades"
                              rows={2}
                              placeholder="Descreva as comorbidades associadas…"
                              required
                            />
                          </div>
                        )}

                        <div className="field full">
                          <label className="checkbox-option">
                            <input
                              type="checkbox"
                              checked={usoMedicacaoContinua}
                              onChange={(event) =>
                                setUsoMedicacaoContinua(event.target.checked)
                              }
                            />
                            <span>Faz uso de medicação contínua?</span>
                          </label>
                        </div>
                        {usoMedicacaoContinua && (
                          <div className="field full">
                            <label htmlFor="medicacaoContinua">
                              Descrição da medicação contínua *
                            </label>
                            <textarea
                              id="medicacaoContinua"
                              name="medicacaoContinua"
                              rows={2}
                              placeholder="Informe os medicamentos de uso contínuo e observações…"
                              required
                            />
                          </div>
                        )}

                        <div className="field full">
                          <label htmlFor="servicosApoio">
                            Serviços de apoio utilizados ou necessários
                          </label>
                          <textarea
                            id="servicosApoio"
                            name="servicosApoio"
                            rows={2}
                            placeholder="Intérprete, ledor, atendimento educacional especializado, psicopedagogia…"
                          />
                        </div>
                        <div className="field full">
                          <label htmlFor="documentosComprobatorios">
                            Documentos comprobatórios apresentados
                          </label>
                          <textarea
                            id="documentosComprobatorios"
                            name="documentosComprobatorios"
                            rows={2}
                            placeholder="Laudos médicos, pareceres pedagógicos ou relatórios entregues…"
                          />
                        </div>

                        <div className="field full">
                          <label htmlFor="necessidadesEspecificas">
                            Necessidades específicas *
                          </label>
                          <textarea
                            id="necessidadesEspecificas"
                            name="necessidadesEspecificas"
                            rows={3}
                            placeholder="Descreva as necessidades educacionais específicas do estudante…"
                            required
                          />
                        </div>
                        <div className="field full">
                          <label htmlFor="percursoEducacional">
                            Avanços, dificuldades e potencialidades no percurso
                            educacional *
                          </label>
                          <textarea
                            id="percursoEducacional"
                            name="percursoEducacional"
                            rows={3}
                            placeholder="Relate o percurso educacional, avanços, dificuldades e potencialidades…"
                            required
                          />
                        </div>
                        <div className="field full">
                          <label htmlFor="principaisDemandas">
                            Principais demandas *
                          </label>
                          <textarea
                            id="principaisDemandas"
                            name="principaisDemandas"
                            rows={3}
                            placeholder="Identifique as principais demandas acadêmicas e de inclusão…"
                            required
                          />
                        </div>
                        <div className="field full">
                          <label htmlFor="propostasIntervencao">
                            Propostas iniciais de intervenção *
                          </label>
                          <textarea
                            id="propostasIntervencao"
                            name="propostasIntervencao"
                            rows={3}
                            placeholder="Defina as propostas e encaminhamentos iniciais da CLAI…"
                            required
                          />
                        </div>

                        <div className="field">
                          <label htmlFor="assinaturaCoordenador">
                            Assinatura / identificação da coordenação *
                          </label>
                          <input
                            id="assinaturaCoordenador"
                            name="assinaturaCoordenador"
                            defaultValue={session.nome}
                            placeholder="Nome e cargo do responsável pela assinatura"
                            maxLength={150}
                            required
                          />
                        </div>
                        <div className="field">
                          <label htmlFor="dataDocumento">
                            Data do documento *
                          </label>
                          <input
                            id="dataDocumento"
                            name="dataDocumento"
                            type="date"
                            defaultValue={localDate()}
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
                        {pending ? 'Salvando…' : 'Registrar plano de ação'}
                      </button>
                    </div>
                  </form>
                </section>
              )}

              <section className="panel">
                <div className="panel-heading">
                  <div>
                    <h2>
                      Planos registrados de {alunoSelecionado.nome}{' '}
                      <span className="count-badge">{planos.length}</span>
                    </h2>
                    <p>
                      Histórico de planos de ação vinculados a{' '}
                      {alunoSelecionado.matricula}.
                    </p>
                  </div>
                </div>
                {loadingPlanos ? (
                  <Loading />
                ) : planosError ? (
                  <div className="panel-body">
                    <Notice>{planosError}</Notice>
                    <button
                      type="button"
                      className="button secondary"
                      onClick={() => {
                        setLoadingPlanos(true)
                        setReloadCount((count) => count + 1)
                      }}
                    >
                      Tentar novamente
                    </button>
                  </div>
                ) : planos.length === 0 ? (
                  <Empty title="Ainda não há planos de ação para este aluno">
                    Registre um plano de ação para documentar as demandas e
                    intervenções da CLAI.
                  </Empty>
                ) : (
                  <ul className="timeline">
                    {planos.map((plano) => (
                      <li key={plano.idPlano}>
                        <span className="timeline-dot">
                          <ClipboardCheck size={16} />
                        </span>
                        <article>
                          <div className="timeline-header">
                            <h3>
                              Plano de ação · {formatDate(plano.dataDocumento)}
                            </h3>
                            <span>Assinado por {plano.assinaturaCoordenador}</span>
                          </div>
                          <p className="professional">
                            Registrado por {plano.autor}
                            {plano.responsavelNome
                              ? ` · Responsável: ${plano.responsavelNome}${plano.responsavelParentesco ? ` (${plano.responsavelParentesco})` : ''}`
                              : ''}
                          </p>
                          <p className="observations">
                            <strong>Necessidades específicas:</strong>{' '}
                            {plano.necessidadesEspecificas}
                            {'\n'}
                            <strong>Percurso educacional:</strong>{' '}
                            {plano.percursoEducacional}
                            {'\n'}
                            <strong>Principais demandas:</strong>{' '}
                            {plano.principaisDemandas}
                            {'\n'}
                            <strong>Propostas de intervenção:</strong>{' '}
                            {plano.propostasIntervencao}
                            {plano.possuiComorbidades && plano.comorbidades
                              ? `\nComorbidades: ${plano.comorbidades}`
                              : ''}
                            {plano.usoMedicacaoContinua &&
                            plano.medicacaoContinua
                              ? `\nMedicação contínua: ${plano.medicacaoContinua}`
                              : ''}
                            {plano.servicosApoio
                              ? `\nServiços de apoio: ${plano.servicosApoio}`
                              : ''}
                            {plano.documentosComprobatorios
                              ? `\nDocumentos comprobatórios: ${plano.documentosComprobatorios}`
                              : ''}
                          </p>
                        </article>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          )}
        </>
      )}
    </>
  )
}
