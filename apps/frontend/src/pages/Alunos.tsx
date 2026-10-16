import { useState } from 'react'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Plus,
  Search,
  UserCheck,
  Users,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context'
import { api } from '../lib/api'
import { formatDate, initials, normalize } from '../lib/format'
import { useResource } from '../hooks/useResource'
import { Empty, Loading, Notice, PageTitle } from '../components/common'

export function Alunos() {
  const { can } = useAuth()
  const { data, error, loading, retry } = useResource(api.alunos)
  const location = useLocation()
  const [query, setQuery] = useState('')
  const [curso, setCurso] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [success, setSuccess] = useState(
    location.state?.success as string | undefined,
  )
  const alunos = data || []
  const cursos = [...new Set(alunos.map((aluno) => aluno.curso))].sort((a, b) =>
    a.localeCompare(b, 'pt-BR'),
  )
  const filtered = alunos.filter(
    (aluno) =>
      normalize(
        `${aluno.nome} ${aluno.matricula} ${aluno.email || ''}`,
      ).includes(normalize(query.trim())) &&
      (!curso || aluno.curso === curso) &&
      (!status || (status === 'ativo') === aluno.ativo),
  )
  const pages = Math.max(1, Math.ceil(filtered.length / 8))
  const currentPage = Math.min(page, pages)
  const items = filtered.slice((currentPage - 1) * 8, currentPage * 8)
  function reset() {
    setQuery('')
    setCurso('')
    setStatus('')
    setPage(1)
  }
  return (
    <>
      <PageTitle
        eyebrow="ACOMPANHAMENTO INTEGRADO"
        title="Alunos"
        description="Conheça cada trajetória. Acompanhe de perto."
        action={
          can('alunos:cadastrar') && (
            <Link to="/alunos/novo" className="button primary">
              <Plus size={19} />
              Cadastrar aluno
            </Link>
          )
        }
      />
      {success && (
        <div className="dismissible">
          <Notice success>{success}</Notice>
          <button
            className="text-button"
            aria-label="Fechar mensagem de sucesso"
            onClick={() => setSuccess(undefined)}
          >
            Fechar
          </button>
        </div>
      )}
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
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-icon green">
                <Users size={22} />
              </span>
              <div>
                <span>Alunos cadastrados</span>
                <strong>{alunos.length.toString().padStart(2, '0')}</strong>
              </div>
              <small>Total de perfis na CLAI</small>
            </div>
            <div className="stat-card">
              <span className="stat-icon blue">
                <UserCheck size={22} />
              </span>
              <div>
                <span>Alunos ativos</span>
                <strong>
                  {alunos
                    .filter((aluno) => aluno.ativo)
                    .length.toString()
                    .padStart(2, '0')}
                </strong>
              </div>
              <small>Com cadastro ativo</small>
            </div>
            <div className="stat-card">
              <span className="stat-icon amber">
                <GraduationCap size={22} />
              </span>
              <div>
                <span>Cursos representados</span>
                <strong>{cursos.length.toString().padStart(2, '0')}</strong>
              </div>
              <small>Diferentes caminhos, o mesmo cuidado</small>
            </div>
          </div>
          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>
                  Todos os alunos{' '}
                  <span className="count-badge">{alunos.length}</span>
                </h2>
                <p>
                  Informações organizadas para um acompanhamento mais próximo.
                </p>
              </div>
            </div>
            <div className="filter-bar">
              <div className="search-field">
                <Search size={18} />
                <input
                  aria-label="Buscar alunos"
                  placeholder="Buscar por nome, matrícula ou e-mail"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value)
                    setPage(1)
                  }}
                />
              </div>
              <select
                aria-label="Filtrar por curso"
                value={curso}
                onChange={(event) => {
                  setCurso(event.target.value)
                  setPage(1)
                }}
              >
                <option value="">Todos os cursos</option>
                {cursos.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              <select
                aria-label="Filtrar por situação"
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value)
                  setPage(1)
                }}
              >
                <option value="">Todas as situações</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
              {(query || curso || status) && (
                <button className="text-button" onClick={reset}>
                  Limpar
                </button>
              )}
            </div>
            {items.length === 0 ? (
              <Empty
                title={
                  alunos.length
                    ? 'Nenhum aluno encontrado'
                    : 'O cuidado começa com o primeiro cadastro'
                }
              >
                {alunos.length
                  ? 'Tente outro termo ou limpe os filtros.'
                  : 'Cadastre um aluno para começar o acompanhamento.'}
              </Empty>
            ) : (
              <div
                className="table-scroll"
                role="region"
                aria-label="Lista de alunos"
                tabIndex={0}
              >
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Aluno</th>
                      <th scope="col">Matrícula</th>
                      <th scope="col">Curso</th>
                      <th scope="col">Situação</th>
                      <th scope="col">Cadastro</th>
                      {can('atendimentos:consultar') && (
                        <th scope="col">
                          <span className="sr-only">Ações</span>
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((aluno, index) => (
                      <tr key={aluno.idAluno}>
                        <td>
                          <div className="student-identity">
                            <span
                              className={`avatar student color-${index % 4}`}
                            >
                              {initials(aluno.nome)}
                            </span>
                            <div>
                              <strong>{aluno.nome}</strong>
                              <small>
                                {aluno.email || 'E-mail não informado'}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="enrollment">{aluno.matricula}</span>
                        </td>
                        <td className="course-cell">{aluno.curso}</td>
                        <td>
                          <span
                            className={`status-pill ${aluno.ativo ? 'active' : 'inactive'}`}
                          >
                            <span />
                            {aluno.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="date-cell">
                          {formatDate(aluno.dataCadastro)}
                        </td>
                        {can('atendimentos:consultar') && (
                          <td>
                            <Link
                              to={`/historico?aluno=${aluno.idAluno}`}
                              className="row-action"
                              aria-label={`Ver histórico de ${aluno.nome}`}
                            >
                              <ArrowRight size={18} />
                            </Link>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="table-footer">
              <span aria-live="polite">
                {filtered.length === 0
                  ? '0 alunos'
                  : `Exibindo ${(currentPage - 1) * 8 + 1}–${Math.min(currentPage * 8, filtered.length)} de ${filtered.length} alunos`}
              </span>
              <div className="pagination">
                <button
                  aria-label="Página anterior"
                  disabled={currentPage === 1}
                  onClick={() => setPage(currentPage - 1)}
                >
                  <ChevronLeft size={16} />
                </button>
                <span>
                  {currentPage} de {pages}
                </span>
                <button
                  aria-label="Próxima página"
                  disabled={currentPage === pages}
                  onClick={() => setPage(currentPage + 1)}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </section>
          <div className="info-strip">
            <span>
              <UserCheck size={18} />
              Um espaço de acolhimento e confiança
            </span>
            <p>
              As informações dos alunos devem ser tratadas com cuidado e
              confidencialidade.
            </p>
          </div>
        </>
      )}
    </>
  )
}
