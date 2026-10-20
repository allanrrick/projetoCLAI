import { useCallback, useEffect, useState } from 'react'
import { CalendarDays, Clock3, FileText, Plus, Search } from 'lucide-react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { formatDate, initials, safeDocumentUrl } from '../lib/format'
import { useResource } from '../hooks/useResource'
import { useAuth } from '../context'
import { Empty, Loading, Notice, PageTitle } from '../components/common'
import type { Aluno, Atendimento } from '../types'

export function Historico() {
  const [params, setParams] = useSearchParams()
  const { can } = useAuth()
  const { data: alunos, loading, error, retry } = useResource(api.alunos)
  const aluno = alunos?.find(
    (item) => item.idAluno === Number(params.get('aluno')),
  )
  return (
    <>
      <PageTitle
        eyebrow="ACOMPANHAMENTO"
        title="Histórico de atendimentos"
        description="Um registro de cada encontro. Uma visão de toda a trajetória."
        action={
          can('atendimentos:cadastrar') && (
            <Link
              to={`/atendimentos/novo${aluno ? `?aluno=${aluno.idAluno}` : ''}`}
              className="button primary"
            >
              <Plus size={19} />
              Novo atendimento
            </Link>
          )
        }
      />
      {loading ? (
        <Loading />
      ) : error ? (
        <>
          <Notice>{error}</Notice>
          <button className="button secondary" onClick={retry}>
            Tentar novamente
          </button>
        </>
      ) : (
        <>
          <section className="panel student-picker">
            <label htmlFor="aluno-historico">Selecione um aluno</label>
            <select
              id="aluno-historico"
              value={aluno?.idAluno || ''}
              onChange={(event) =>
                setParams(
                  event.target.value ? { aluno: event.target.value } : {},
                  { state: null },
                )
              }
            >
              <option value="">Selecione para consultar o histórico</option>
              {alunos?.map((item) => (
                <option key={item.idAluno} value={item.idAluno}>
                  {item.nome} · {item.matricula}
                </option>
              ))}
            </select>
          </section>
          {aluno ? (
            <StudentHistory key={aluno.idAluno} aluno={aluno} />
          ) : (
            <section className="panel">
              <Empty
                title={
                  params.get('aluno')
                    ? 'Aluno não encontrado'
                    : 'Cada trajetória tem uma história'
                }
              >
                Selecione um aluno para consultar seus atendimentos.
              </Empty>
            </section>
          )}
        </>
      )}
    </>
  )
}
function StudentHistory({ aluno }: { aluno: Aluno }) {
  const location = useLocation()
  const [sort, setSort] = useState<'asc' | 'desc'>('desc')
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const invalidDates = Boolean(start && end && start > end)
  useEffect(() => {
    const timeout = window.setTimeout(
      () => setDebouncedQuery(query.trim()),
      300,
    )
    return () => window.clearTimeout(timeout)
  }, [query])
  const load = useCallback(
    (signal: AbortSignal) =>
      invalidDates
        ? Promise.resolve<Atendimento[]>([])
        : api.atendimentos(
            aluno.idAluno,
            aluno.matricula,
            { q: debouncedQuery, inicio: start, fim: end, ordem: sort },
            signal,
          ),
    [
      aluno.idAluno,
      aluno.matricula,
      debouncedQuery,
      start,
      end,
      sort,
      invalidDates,
    ],
  )
  const { data, loading, error, retry } = useResource(load)
  const [success, setSuccess] = useState(
    location.state?.success as string | undefined,
  )
  const atendimentos = data || []
  const historyLoading = loading || query.trim() !== debouncedQuery
  const hasFilters = Boolean(debouncedQuery || start || end)
  function reset() {
    setQuery('')
    setDebouncedQuery('')
    setStart('')
    setEnd('')
    setSort('desc')
  }
  return (
    <>
      {success && (
        <div className="dismissible">
          <Notice success>{success}</Notice>
          <button className="text-button" onClick={() => setSuccess(undefined)}>
            Fechar
          </button>
        </div>
      )}
      <section className="panel">
        <div className="student-summary">
          <span className="avatar large">{initials(aluno.nome)}</span>
          <div>
            <h2>{aluno.nome}</h2>
            <p>
              {aluno.matricula} <span>·</span> {aluno.curso}
            </p>
          </div>
          <span
            className={`status-pill ${aluno.ativo ? 'active' : 'inactive'}`}
          >
            <span />
            {aluno.ativo ? 'Ativo' : 'Inativo'}
          </span>
        </div>
        <div className="history-filters">
          <div className="search-field">
            <label htmlFor="busca-historico" className="sr-only">
              Buscar no histórico
            </label>
            <Search size={18} aria-hidden="true" />
            <input
              id="busca-historico"
              value={query}
              placeholder="Buscar nas observações, profissional ou anexos"
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="date-filters">
            <div className="field">
              <label htmlFor="inicio">De</label>
              <input
                id="inicio"
                type="date"
                value={start}
                aria-invalid={invalidDates || undefined}
                aria-describedby={
                  invalidDates ? 'historico-periodo-erro' : undefined
                }
                onChange={(event) => setStart(event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="fim">Até</label>
              <input
                id="fim"
                type="date"
                value={end}
                min={start || undefined}
                aria-invalid={invalidDates || undefined}
                aria-describedby={
                  invalidDates ? 'historico-periodo-erro' : undefined
                }
                onChange={(event) => setEnd(event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="ordem">Ordenação</label>
              <select
                id="ordem"
                value={sort}
                onChange={(event) =>
                  setSort(event.target.value === 'asc' ? 'asc' : 'desc')
                }
              >
                <option value="desc">Mais recentes primeiro</option>
                <option value="asc">Mais antigos primeiro</option>
              </select>
            </div>
            {(query || start || end || sort !== 'desc') && (
              <button className="text-button" onClick={reset}>
                Limpar filtros
              </button>
            )}
          </div>
        </div>
        {invalidDates && (
          <Notice>
            <span id="historico-periodo-erro">
              A data final deve ser igual ou posterior à data inicial.
            </span>
          </Notice>
        )}
        <p className="result-count" aria-live="polite" aria-atomic="true">
          {!historyLoading && !error && !invalidDates && (
            <>
              {atendimentos.length}{' '}
              {atendimentos.length === 1
                ? 'atendimento encontrado'
                : 'atendimentos encontrados'}
            </>
          )}
        </p>
        {invalidDates ? null : historyLoading ? (
          <Loading />
        ) : error ? (
          <div className="panel-body">
            <Notice>{error}</Notice>
            <button className="button secondary" onClick={retry}>
              Tentar novamente
            </button>
          </div>
        ) : atendimentos.length === 0 ? (
          <Empty
            title={
              hasFilters
                ? 'Nenhum atendimento encontrado'
                : 'Ainda não há atendimentos para este aluno'
            }
          >
            {hasFilters
              ? 'Ajuste a busca ou o período selecionado.'
              : 'Os atendimentos registrados aparecerão aqui.'}
          </Empty>
        ) : (
          <>
            <ol className="timeline">
              {atendimentos.map((item) => (
                <li key={item.idAtendimento}>
                  <span className="timeline-dot">
                    <CalendarDays size={17} />
                  </span>
                  <article>
                    <div className="timeline-header">
                      <h3>{formatDate(item.data)}</h3>
                      <span>
                        <Clock3 size={14} />
                        {item.hora.slice(0, 5)}
                      </span>
                    </div>
                    <p className="professional">
                      Registrado por {item.profissional}
                    </p>
                    <p className="observations">{item.observacoes}</p>
                    {item.documentos.length > 0 && (
                      <ul className="attachments">
                        {item.documentos.map((doc) => {
                          const href = safeDocumentUrl(doc.url)
                          return (
                            <li key={doc.id}>
                              <FileText size={16} />
                              {href ? (
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {doc.nome}
                                </a>
                              ) : (
                                <span>{doc.nome}</span>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </article>
                </li>
              ))}
            </ol>
          </>
        )}
      </section>
    </>
  )
}
