import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { FileSpreadsheet, Search } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { formatDate } from '../lib/format'
import { useResource } from '../hooks/useResource'
import { Empty, Loading, Notice, PageTitle } from '../components/common'
import type { Pea } from '../types'

export function PeaPage() {
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
  const [filtroDisciplina, setFiltroDisciplina] = useState('')
  const [peas, setPeas] = useState<Pea[]>([])
  const [loadingPeas, setLoadingPeas] = useState(false)
  const [reloadCount, setReloadCount] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pending, setPending] = useState(false)

  const matriculaAtiva = matriculaSelecionada || alunos?.[0]?.matricula || ''

  useEffect(() => {
    if (!matriculaAtiva) return
    let active = true
    api
      .peas(matriculaAtiva, filtroDisciplina)
      .then((items) => {
        if (active) setPeas(items)
      })
      .catch(() => {
        if (active) setPeas([])
      })
      .finally(() => {
        if (active) setLoadingPeas(false)
      })
    return () => {
      active = false
    }
  }, [matriculaAtiva, filtroDisciplina, reloadCount])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    const form = event.currentTarget
    const values = new FormData(form)
    const alunoMatricula = String(values.get('alunoMatricula') || '').trim()
    const disciplina = String(values.get('disciplina') || '').trim()
    const periodoLetivo = String(values.get('periodoLetivo') || '').trim()
    const docente = String(values.get('docente') || '').trim()
    const objetivos = String(values.get('objetivos') || '').trim()
    const conteudos = String(values.get('conteudos') || '').trim()
    const estrategiasEnsino = String(
      values.get('estrategiasEnsino') || '',
    ).trim()
    const avaliacaoAdaptada = String(
      values.get('avaliacaoAdaptada') || '',
    ).trim()

    if (
      !alunoMatricula ||
      !disciplina ||
      !periodoLetivo ||
      !docente ||
      !objetivos ||
      !conteudos ||
      !estrategiasEnsino ||
      !avaliacaoAdaptada
    ) {
      setError(
        'Preencha todos os campos obrigatórios do PEA (aluno, disciplina, período letivo, docente, objetivos adaptados, conteúdos programáticos, estratégias de ensino e avaliação adaptada).',
      )
      return
    }

    setError('')
    setSuccess('')
    setPending(true)
    try {
      await api.cadastrarPea({
        alunoMatricula,
        disciplina,
        periodoLetivo,
        docente,
        objetivos,
        conteudos,
        estrategiasEnsino,
        avaliacaoAdaptada,
      })
      form.reset()
      setMatriculaSelecionada(alunoMatricula)
      setLoadingPeas(true)
      setReloadCount((count) => count + 1)
      setSuccess('Plano de Ensino Adaptado (PEA) registrado com sucesso.')
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'Não foi possível registrar o PEA.',
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <PageTitle
        eyebrow="ENSINO ADAPTADO"
        title="Plano de Ensino Adaptado (PEA)"
        description="Registre e consulte as adaptações curriculares, estratégias de ensino e avaliações por estudante e disciplina."
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
                <FileSpreadsheet size={22} />
              </span>
              <div>
                <h2>Registrar PEA</h2>
                <p>Os campos marcados com * são obrigatórios.</p>
              </div>
            </div>
            {error && <Notice>{error}</Notice>}
            {success && <Notice success>{success}</Notice>}
            <form onSubmit={submit} noValidate>
              <fieldset disabled={pending}>
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="pea-aluno">Aluno *</label>
                    <select
                      id="pea-aluno"
                      name="alunoMatricula"
                      value={matriculaAtiva}
                      onChange={(event) => {
                        setLoadingPeas(true)
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
                    <label htmlFor="pea-periodo">Período letivo *</label>
                    <input
                      id="pea-periodo"
                      name="periodoLetivo"
                      placeholder="Ex.: 2026.2"
                      maxLength={50}
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="pea-disciplina">Disciplina *</label>
                    <input
                      id="pea-disciplina"
                      name="disciplina"
                      placeholder="Nome da disciplina"
                      maxLength={150}
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="pea-docente">Docente *</label>
                    <input
                      id="pea-docente"
                      name="docente"
                      placeholder="Docente responsável pela disciplina"
                      maxLength={150}
                      required
                    />
                  </div>
                  <div className="field full">
                    <label htmlFor="pea-objetivos">Objetivos adaptados *</label>
                    <textarea
                      id="pea-objetivos"
                      name="objetivos"
                      rows={3}
                      placeholder="Descreva os objetivos de aprendizagem adaptados para o estudante…"
                      required
                    />
                  </div>
                  <div className="field full">
                    <label htmlFor="pea-conteudos">
                      Conteúdos programáticos *
                    </label>
                    <textarea
                      id="pea-conteudos"
                      name="conteudos"
                      rows={3}
                      placeholder="Liste os conteúdos e unidades que serão trabalhados…"
                      required
                    />
                  </div>
                  <div className="field full">
                    <label htmlFor="pea-estrategias">
                      Estratégias de ensino *
                    </label>
                    <textarea
                      id="pea-estrategias"
                      name="estrategiasEnsino"
                      rows={3}
                      placeholder="Metodologias, recursos didáticos e tecnologias assistivas…"
                      required
                    />
                  </div>
                  <div className="field full">
                    <label htmlFor="pea-avaliacao">Avaliação adaptada *</label>
                    <textarea
                      id="pea-avaliacao"
                      name="avaliacaoAdaptada"
                      rows={3}
                      placeholder="Instrumentos, critérios e adaptações avaliativas…"
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
                  {pending ? 'Salvando…' : 'Registrar PEA'}
                </button>
              </div>
            </form>
          </section>

          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>
                  PEAs vinculados{' '}
                  <span className="count-badge">{peas.length}</span>
                </h2>
                <p>
                  Consulte os Planos de Ensino Adaptados vinculados ao aluno e
                  filtre por disciplina.
                </p>
              </div>
            </div>
            <div className="filter-bar">
              <div className="search-field">
                <Search size={18} />
                <input
                  aria-label="Filtrar PEA por disciplina"
                  placeholder="Filtrar por disciplina"
                  value={filtroDisciplina}
                  onChange={(event) => {
                    setLoadingPeas(true)
                    setFiltroDisciplina(event.target.value)
                  }}
                />
              </div>
              {filtroDisciplina && (
                <button
                  type="button"
                  className="text-button"
                  onClick={() => {
                    setLoadingPeas(true)
                    setFiltroDisciplina('')
                  }}
                >
                  Limpar
                </button>
              )}
            </div>
            {loadingPeas ? (
              <Loading />
            ) : peas.length === 0 ? (
              <Empty title="Nenhum PEA encontrado">
                {filtroDisciplina
                  ? 'Nenhum plano encontrado para a disciplina informada.'
                  : 'Preencha o formulário acima para registrar o primeiro PEA deste estudante.'}
              </Empty>
            ) : (
              <ul className="timeline">
                {peas.map((item) => (
                  <li key={item.id}>
                    <span className="timeline-dot">
                      <FileSpreadsheet size={16} />
                    </span>
                    <article>
                      <div className="timeline-header">
                        <h3>
                          {item.disciplina} · {item.periodoLetivo}
                        </h3>
                        <span>{formatDate(item.dataCriacao)}</span>
                      </div>
                      <p className="professional">
                        Matrícula: {item.alunoMatricula} · Docente:{' '}
                        {item.docente}
                      </p>
                      <p className="observations">
                        <strong>Objetivos:</strong> {item.objetivos}
                        {'\n'}
                        <strong>Conteúdos:</strong> {item.conteudos}
                        {'\n'}
                        <strong>Estratégias de ensino:</strong>{' '}
                        {item.estrategiasEnsino}
                        {'\n'}
                        <strong>Avaliação adaptada:</strong>{' '}
                        {item.avaliacaoAdaptada}
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
  )
}
