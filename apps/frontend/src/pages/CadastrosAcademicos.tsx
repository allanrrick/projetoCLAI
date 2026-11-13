import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../context'
import { useResource } from '../hooks/useResource'
import { api } from '../lib/api'
import { Empty, Loading, Notice, PageTitle } from '../components/common'

function SecaoAcademica({ tipo }: { tipo: 'curso' | 'disciplina' }) {
  const { can } = useAuth()
  const isCurso = tipo === 'curso'
  const { data, error, loading, retry } = useResource<{ nome: string }[]>(
    isCurso ? api.cursos : api.disciplinas,
  )
  const [pending, setPending] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    const form = event.currentTarget
    const nome = String(new FormData(form).get('nome') || '')
      .trim()
      .replace(/\s+/g, ' ')
    setSuccess('')
    if (!nome) {
      setSubmitError(
        'Informe um nome. Campos com apenas espaços não são válidos.',
      )
      return
    }
    setPending(true)
    setSubmitError('')
    try {
      await (isCurso ? api.cadastrarCurso(nome) : api.cadastrarDisciplina(nome))
      form.reset()
      setSuccess(
        isCurso
          ? 'Curso cadastrado com sucesso.'
          : 'Disciplina cadastrada com sucesso.',
      )
      retry()
    } catch (reason) {
      setSubmitError(
        reason instanceof Error
          ? reason.message
          : 'Não foi possível cadastrar.',
      )
    } finally {
      setPending(false)
    }
  }
  return (
    <section className="panel form-panel" aria-labelledby={`${tipo}-titulo`}>
      <div className="panel-heading">
        <h2 id={`${tipo}-titulo`}>{isCurso ? 'Cursos' : 'Disciplinas'}</h2>
      </div>
      {success && <Notice success>{success}</Notice>}
      {submitError && <Notice>{submitError}</Notice>}
      {loading ? (
        <Loading />
      ) : error ? (
        <>
          <Notice>{error}</Notice>
          <div className="form-actions">
            <button className="button secondary" onClick={retry}>
              Tentar novamente
            </button>
          </div>
        </>
      ) : (
        <>
          {can('alunos:cadastrar') && (
            <form onSubmit={submit}>
              <fieldset disabled={pending}>
                <div className="form-grid">
                  <div className="field full">
                    <label htmlFor={`${tipo}-nome`}>
                      {isCurso ? 'Nome do curso *' : 'Nome da disciplina *'}
                    </label>
                    <input
                      id={`${tipo}-nome`}
                      name="nome"
                      maxLength={isCurso ? 100 : 150}
                      required
                    />
                  </div>
                </div>
              </fieldset>
              <div className="form-actions">
                <button
                  className="button primary"
                  type="submit"
                  disabled={pending}
                >
                  {pending
                    ? 'Salvando…'
                    : isCurso
                      ? 'Cadastrar curso'
                      : 'Cadastrar disciplina'}
                </button>
              </div>
            </form>
          )}
          {!data?.length ? (
            <Empty
              title={
                isCurso
                  ? 'Nenhum curso cadastrado'
                  : 'Nenhuma disciplina cadastrada'
              }
            />
          ) : (
            <div className="table-scroll">
              <table
                aria-label={
                  isCurso ? 'Cursos cadastrados' : 'Disciplinas cadastradas'
                }
              >
                <thead>
                  <tr>
                    <th scope="col">Nome</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => (
                    <tr key={item.nome}>
                      <td>{item.nome}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  )
}

export function CadastrosAcademicos() {
  return (
    <>
      <PageTitle
        eyebrow="ACADÊMICO"
        title="Cadastros acadêmicos"
        description="Cadastre e consulte cursos e disciplinas."
      />
      <div className="form-layout">
        <SecaoAcademica tipo="curso" />
        <SecaoAcademica tipo="disciplina" />
      </div>
    </>
  )
}
