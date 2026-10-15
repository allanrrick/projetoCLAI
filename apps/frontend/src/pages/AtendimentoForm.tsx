import { useState } from 'react'
import type { FormEvent } from 'react'
import { ClipboardPlus, FileText, Paperclip, X } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../context'
import { useResource } from '../hooks/useResource'
import { FormActions, Loading, Notice, PageTitle } from '../components/common'

function localDate() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}
export function AtendimentoForm() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { can } = useAuth()
  const {
    data: alunos,
    error: loadError,
    loading,
    retry,
  } = useResource(api.alunos)
  const [files, setFiles] = useState<File[]>([])
  const [fileError, setFileError] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pending, setPending] = useState(false)
  function chooseFiles(selected: FileList | null) {
    setFileError('')
    const next = [...files, ...Array.from(selected || [])]
    if (next.length > 5) {
      setFileError('Anexe no máximo 5 documentos.')
      return
    }
    if (next.some((file) => file.size > 10 * 1024 * 1024)) {
      setFileError('Cada documento deve ter no máximo 10 MB.')
      return
    }
    if (
      next.some(
        (file) =>
          !['application/pdf', 'image/png', 'image/jpeg'].includes(file.type),
      )
    ) {
      setFileError('Selecione apenas documentos PDF ou imagens PNG e JPEG.')
      return
    }
    setFiles(next)
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    const form = event.currentTarget
    const values = new FormData(form)
    const idAluno = Number(values.get('idAluno'))
    const data = String(values.get('data'))
    const hora = String(values.get('hora'))
    const observacoes = String(values.get('observacoes')).trim()
    if (
      !alunos?.some((aluno) => aluno.idAluno === idAluno) ||
      !data ||
      !hora ||
      !observacoes
    ) {
      setError('Selecione um aluno e preencha data, hora e observações.')
      return
    }
    setError('')
    setSuccess('')
    setPending(true)
    try {
      await api.cadastrarAtendimento({
        idAluno,
        data,
        hora,
        observacoes,
        documentos: files,
      })
      if (can('atendimentos:consultar'))
        navigate(`/historico?aluno=${idAluno}`, {
          state: { success: 'Atendimento registrado com sucesso.' },
        })
      else {
        form.reset()
        setFiles([])
        setSuccess('Atendimento registrado com sucesso.')
      }
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'Não foi possível registrar o atendimento.',
      )
    } finally {
      setPending(false)
    }
  }
  return (
    <>
      <PageTitle
        eyebrow="ATENDIMENTOS"
        title="Registrar atendimento"
        description="Registre o cuidado de hoje para acompanhar os próximos passos."
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
                <ClipboardPlus size={22} />
              </span>
              <div>
                <h2>Dados do atendimento</h2>
                <p>Os campos marcados com * são obrigatórios.</p>
              </div>
            </div>
            {error && <Notice>{error}</Notice>}
            {success && <Notice success>{success}</Notice>}
            <form onSubmit={submit}>
              <fieldset disabled={pending}>
                <div className="form-grid">
                  <div className="field full">
                    <label htmlFor="idAluno">Aluno *</label>
                    <select
                      id="idAluno"
                      name="idAluno"
                      defaultValue={params.get('aluno') || ''}
                      required
                    >
                      <option value="">Selecione o aluno</option>
                      {alunos?.map((aluno) => (
                        <option key={aluno.idAluno} value={aluno.idAluno}>
                          {aluno.nome} · {aluno.matricula}
                        </option>
                      ))}
                    </select>
                    {alunos?.length === 0 && (
                      <small>
                        Cadastre um aluno antes de registrar um atendimento.
                      </small>
                    )}
                  </div>
                  <div className="field">
                    <label htmlFor="data">Data *</label>
                    <input
                      id="data"
                      name="data"
                      type="date"
                      defaultValue={localDate()}
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="hora">Hora *</label>
                    <input id="hora" name="hora" type="time" required />
                  </div>
                  <div className="field full">
                    <label htmlFor="observacoes">Observações *</label>
                    <textarea
                      id="observacoes"
                      name="observacoes"
                      rows={5}
                      placeholder="Descreva o atendimento, as orientações e os encaminhamentos realizados…"
                      maxLength={10000}
                      required
                    />
                    <small>
                      Registre apenas as informações necessárias ao
                      acompanhamento.
                    </small>
                  </div>
                  <div className="field full">
                    <label htmlFor="documentos">Documentos</label>
                    <div className="upload-box">
                      <Paperclip size={22} />
                      <strong>Anexar documentos ao atendimento</strong>
                      <span>
                        PDF, PNG ou JPEG · até 5 arquivos de 10 MB cada
                      </span>
                      <input
                        id="documentos"
                        type="file"
                        accept="application/pdf,image/png,image/jpeg"
                        multiple
                        aria-describedby="file-help"
                        onChange={(event) => {
                          chooseFiles(event.target.files)
                          event.target.value = ''
                        }}
                      />
                    </div>
                    <small id="file-help">Os documentos são opcionais.</small>
                    {fileError && <Notice>{fileError}</Notice>}
                    {files.length > 0 && (
                      <ul className="file-list">
                        {files.map((file, index) => (
                          <li key={`${file.name}-${index}`}>
                            <FileText size={17} />
                            <span>{file.name}</span>
                            <small>{(file.size / 1024).toFixed(1)} KB</small>
                            <button
                              type="button"
                              className="icon-button"
                              aria-label={`Remover ${file.name}`}
                              onClick={() =>
                                setFiles(files.filter((_, i) => i !== index))
                              }
                            >
                              <X size={16} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </fieldset>
              <FormActions
                pending={pending}
                to="/alunos"
                label="Registrar atendimento"
              />
            </form>
          </section>
          <aside className="form-aside">
            <span className="eyebrow">CONTINUIDADE NO CUIDADO</span>
            <h2>
              Cada registro
              <br />
              faz a diferença.
            </h2>
            <p>
              Um histórico bem documentado permite que o acompanhamento continue
              com contexto, atenção e acolhimento.
            </p>
            <div className="aside-note">
              <strong>Revise antes de registrar</strong>
              <p>
                Confira o aluno selecionado, a data e os documentos anexados
                antes de salvar o atendimento.
              </p>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
