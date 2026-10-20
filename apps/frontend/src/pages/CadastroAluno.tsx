import { useState } from 'react'
import type { FormEvent } from 'react'
import { UserPlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { BackLink, FormActions, Notice, PageTitle } from '../components/common'

export function CadastroAluno() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    const values = new FormData(event.currentTarget)
    const matricula = String(values.get('matricula')).trim()
    const nome = String(values.get('nome')).trim()
    const curso = String(values.get('curso')).trim()
    const email = String(values.get('email')).trim()
    if (!matricula || !nome || !curso) {
      setError(
        'Preencha matrícula, nome e curso. Campos com apenas espaços não são válidos.',
      )
      return
    }
    setPending(true)
    setError('')
    try {
      await api.cadastrarAluno({ matricula, nome, curso, email: email || null })
      navigate('/alunos', {
        state: { success: 'Aluno cadastrado com sucesso.' },
        replace: true,
      })
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'Não foi possível cadastrar o aluno.',
      )
    } finally {
      setPending(false)
    }
  }
  return (
    <>
      <BackLink />
      <PageTitle
        eyebrow="ALUNOS"
        title="Cadastrar aluno"
        description="O primeiro passo para um acompanhamento mais próximo."
      />
      <div className="form-layout">
        <section className="panel form-panel">
          <div className="panel-heading">
            <span className="section-icon">
              <UserPlus size={22} />
            </span>
            <div>
              <h2>Informações do aluno</h2>
              <p>Os campos marcados com * são obrigatórios.</p>
            </div>
          </div>
          {error && <Notice>{error}</Notice>}
          <form onSubmit={submit}>
            <fieldset disabled={pending}>
              <div className="form-grid">
                <div className="field full">
                  <label htmlFor="nome">Nome completo *</label>
                  <input
                    id="nome"
                    name="nome"
                    autoComplete="name"
                    placeholder="Nome completo do aluno"
                    maxLength={150}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="matricula">Matrícula *</label>
                  <input
                    id="matricula"
                    name="matricula"
                    placeholder="Informe a matrícula"
                    maxLength={20}
                    required
                  />
                  <small>Use a matrícula institucional do aluno.</small>
                </div>
                <div className="field">
                  <label htmlFor="email-aluno">E-mail</label>
                  <input
                    id="email-aluno"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="aluno@exemplo.com"
                    maxLength={150}
                  />
                  <small>Opcional. Usado para contato com o aluno.</small>
                </div>
                <div className="field full">
                  <label htmlFor="curso">Curso *</label>
                  <input
                    id="curso"
                    name="curso"
                    placeholder="Nome do curso"
                    maxLength={100}
                    required
                  />
                </div>
              </div>
            </fieldset>
            <FormActions
              pending={pending}
              to="/alunos"
              label="Cadastrar aluno"
            />
          </form>
        </section>
        <aside className="form-aside">
          <span className="eyebrow">UM CADASTRO, UMA TRAJETÓRIA</span>
          <h2>
            Conhecer para
            <br />
            acompanhar melhor.
          </h2>
          <p>
            Confira os dados antes de salvar. Eles ajudam a identificar o aluno
            e a manter seu acompanhamento organizado.
          </p>
          <div className="aside-note">
            <strong>Evite cadastros duplicados</strong>
            <p>
              Cada aluno deve ter um único perfil. Se já houver cadastro,
              consulte a lista de alunos.
            </p>
          </div>
        </aside>
      </div>
    </>
  )
}
