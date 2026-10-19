import { useCallback, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context'
import { api } from '../lib/api'
import { formatDate } from '../lib/format'
import { useResource } from '../hooks/useResource'
import {
  BackLink,
  Empty,
  FormActions,
  Loading,
  Notice,
  PageTitle,
} from '../components/common'
import type { Aluno, NovoPlanoAcao, PlanoAcao } from '../types'

const complementares = [
  ['periodoLetivo', 'Período letivo', 20],
  ['periodoIngresso', 'Período de ingresso', 20],
  ['telefoneAluno', 'Telefone do estudante', 30],
  ['nomeResponsavel', 'Nome do responsável', 150],
  ['parentescoResponsavel', 'Grau de parentesco', 50],
  ['telefoneResponsavel', 'Telefone do responsável', 30],
  ['emailResponsavel', 'E-mail do responsável', 150],
] as const

const perguntas = [
  ['possuiComorbidade', 'comorbidades', 'Há comorbidade relevante?'],
  ['usaMedicacaoContinua', 'medicacoes', 'Faz uso de medicação contínua?'],
  ['frequentaServicosApoio', 'servicosApoio', 'Frequenta serviços de apoio?'],
  [
    'apresentouDocumentos',
    'documentosComprobatorios',
    'Apresentou documentos comprobatórios?',
  ],
] as const

const secoes = [
  [
    'necessidadesEspecificas',
    'Identificação das necessidades específicas',
    'Diagnósticos, encaminhamentos, autonomia e contexto familiar e escolar.',
  ],
  [
    'percursoEducacional',
    'Percurso educacional: avanços, dificuldades e potencialidades',
    'Objetivos atingidos, facilidades e experiências anteriores no ensino.',
  ],
  [
    'principaisDemandas',
    'Principais demandas identificadas no caso',
    'Necessidades de aprendizagem, limitações, dificuldades e adaptações anteriores.',
  ],
  [
    'propostasIntervencao',
    'Propostas iniciais de intervenção',
    'Adaptações de acessibilidade e aprendizagem, atendimentos e apoios complementares.',
  ],
] as const

function hoje() {
  const data = new Date()
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`
}

export function PlanosAcao({ novo = false }: { novo?: boolean }) {
  const { idAluno } = useParams()
  const id = Number(idAluno)
  const carregar = useCallback(
    (signal: AbortSignal) => api.aluno(id, signal),
    [id],
  )
  const { data: aluno, loading, error, retry } = useResource(carregar)
  return (
    <>
      <BackLink />
      <PageTitle
        eyebrow="ACOMPANHAMENTO"
        title={novo ? 'Registrar plano de ação' : 'Planos de ação'}
        description="Plano de Ação da CLAI — Anexo II do modelo institucional."
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
        aluno && (
          <>
            <section className="panel student-summary">
              <div>
                <h2>{aluno.nome}</h2>
                <p>
                  Matrícula: {aluno.matricula} · Curso: {aluno.curso}
                </p>
                <p>E-mail: {aluno.email || 'Não informado'}</p>
              </div>
            </section>
            {novo ? (
              <PlanoForm key={aluno.idAluno} aluno={aluno} />
            ) : (
              <ListaPlanos key={aluno.idAluno} aluno={aluno} />
            )}
          </>
        )
      )}
    </>
  )
}

function ListaPlanos({ aluno }: { aluno: Aluno }) {
  const { can } = useAuth()
  const location = useLocation()
  const carregar = useCallback(
    (signal: AbortSignal) => api.planos(aluno.idAluno, signal),
    [aluno.idAluno],
  )
  const { data: planos, loading, error, retry } = useResource(carregar)
  return (
    <>
      {location.state?.success && (
        <Notice success>{location.state.success}</Notice>
      )}
      {can('planos:cadastrar') && (
        <Link
          className="button primary"
          to={`/alunos/${aluno.idAluno}/planos/novo`}
        >
          Registrar plano de ação
        </Link>
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
      ) : planos?.length ? (
        planos.map((plano) => (
          <VisualizarPlano key={plano.idPlanoAcao} plano={plano} />
        ))
      ) : (
        <section className="panel">
          <Empty title="Nenhum plano cadastrado">
            Registre o primeiro plano de ação deste estudante.
          </Empty>
        </section>
      )}
    </>
  )
}

function VisualizarPlano({ plano }: { plano: PlanoAcao }) {
  return (
    <details className="panel plano-detalhes">
      <summary>
        Plano #{plano.idPlanoAcao} · {plano.periodoLetivo} ·{' '}
        {formatDate(plano.dataDocumento)}
      </summary>
      <div className="form-grid">
        {complementares.map(([nome, rotulo]) => (
          <div className="field" key={nome}>
            <h3>{rotulo}</h3>
            <p>{plano[nome] || 'Não informado'}</p>
          </div>
        ))}
        <div className="field">
          <h3>Data de nascimento</h3>
          <p>{formatDate(plano.dataNascimento)}</p>
        </div>
        {perguntas.map(([nome, descricao, rotulo]) => (
          <div className="field full" key={nome}>
            <h3>{rotulo}</h3>
            <p>{plano[nome] ? 'Sim' : 'Não'}</p>
            {plano[nome] && <p className="plano-texto">{plano[descricao]}</p>}
          </div>
        ))}
        {secoes.map(([nome, rotulo]) => (
          <div className="field full" key={nome}>
            <h3>{rotulo}</h3>
            <p className="plano-texto">{plano[nome]}</p>
          </div>
        ))}
        <div className="field">
          <h3>Coordenador da CLAI</h3>
          <p>{plano.nomeCoordenador}</p>
        </div>
        <div className="field">
          <h3>Data do documento</h3>
          <p>{formatDate(plano.dataDocumento)}</p>
        </div>
        <div className="field full">
          <h3>Registro</h3>
          <p>
            Registrado por {plano.autorNome} em{' '}
            {formatDate(plano.dataCriacao.split('T')[0])}.
          </p>
        </div>
      </div>
    </details>
  )
}

function PlanoForm({ aluno }: { aluno: Aluno }) {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const enviando = useRef(false)
  const [respostas, setRespostas] = useState<Record<string, string>>({})
  const voltar = `/alunos/${aluno.idAluno}/planos`

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (enviando.current) return
    const form = new FormData(event.currentTarget)
    const texto = (nome: string) => String(form.get(nome) || '').trim()
    if (
      !texto('periodoLetivo') ||
      !texto('nomeCoordenador') ||
      !texto('dataDocumento') ||
      secoes.some(([nome]) => !texto(nome))
    ) {
      setError(
        'Preencha todos os campos obrigatórios. Campos com apenas espaços não são válidos.',
      )
      return
    }
    if (
      perguntas.some(
        ([nome, descricao]) =>
          !['sim', 'nao'].includes(texto(nome)) ||
          (texto(nome) === 'sim' && !texto(descricao)),
      )
    ) {
      setError(
        'Responda às quatro perguntas e descreva cada resposta Sim. Campos com apenas espaços não são válidos.',
      )
      return
    }
    const dados: NovoPlanoAcao = {
      idAluno: aluno.idAluno,
      periodoLetivo: texto('periodoLetivo'),
      periodoIngresso: texto('periodoIngresso') || null,
      dataNascimento: texto('dataNascimento') || null,
      telefoneAluno: texto('telefoneAluno') || null,
      nomeResponsavel: texto('nomeResponsavel') || null,
      parentescoResponsavel: texto('parentescoResponsavel') || null,
      telefoneResponsavel: texto('telefoneResponsavel') || null,
      emailResponsavel: texto('emailResponsavel') || null,
      possuiComorbidade: texto('possuiComorbidade') === 'sim',
      comorbidades: texto('comorbidades') || null,
      usaMedicacaoContinua: texto('usaMedicacaoContinua') === 'sim',
      medicacoes: texto('medicacoes') || null,
      frequentaServicosApoio: texto('frequentaServicosApoio') === 'sim',
      servicosApoio: texto('servicosApoio') || null,
      apresentouDocumentos: texto('apresentouDocumentos') === 'sim',
      documentosComprobatorios: texto('documentosComprobatorios') || null,
      necessidadesEspecificas: texto('necessidadesEspecificas'),
      percursoEducacional: texto('percursoEducacional'),
      principaisDemandas: texto('principaisDemandas'),
      propostasIntervencao: texto('propostasIntervencao'),
      nomeCoordenador: texto('nomeCoordenador'),
      dataDocumento: texto('dataDocumento'),
    }
    enviando.current = true
    setPending(true)
    setError('')
    try {
      await api.cadastrarPlano(dados)
      navigate(voltar, {
        state: { success: 'Plano de ação registrado com sucesso.' },
        replace: true,
      })
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'Não foi possível registrar o plano.',
      )
    } finally {
      enviando.current = false
      setPending(false)
    }
  }

  return (
    <section className="panel form-panel">
      <div className="panel-heading">
        <div>
          <h2>Informações do plano</h2>
          <p>Campos com * são obrigatórios. Os demais são opcionais.</p>
        </div>
      </div>
      {error && <Notice>{error}</Notice>}
      <form onSubmit={submit}>
        <fieldset disabled={pending} className="form-grid">
          {complementares.map(([nome, rotulo, limite]) => (
            <div className="field" key={nome}>
              <label htmlFor={nome}>
                {rotulo}
                {nome === 'periodoLetivo' ? ' *' : ''}
              </label>
              <input
                id={nome}
                name={nome}
                type={
                  nome === 'emailResponsavel'
                    ? 'email'
                    : nome.startsWith('telefone')
                      ? 'tel'
                      : 'text'
                }
                maxLength={limite}
                required={nome === 'periodoLetivo'}
              />
            </div>
          ))}
          <div className="field">
            <label htmlFor="dataNascimento">Data de nascimento</label>
            <input
              id="dataNascimento"
              name="dataNascimento"
              type="date"
              max={hoje()}
            />
          </div>
          {perguntas.map(([nome, descricao, rotulo]) => (
            <div className="field full" key={nome}>
              <label htmlFor={nome}>{rotulo} *</label>
              <select
                id={nome}
                name={nome}
                required
                value={respostas[nome] || ''}
                onChange={(event) =>
                  setRespostas({ ...respostas, [nome]: event.target.value })
                }
              >
                <option value="">Selecione</option>
                <option value="nao">Não</option>
                <option value="sim">Sim</option>
              </select>
              {respostas[nome] === 'sim' && (
                <>
                  <label htmlFor={descricao}>Descreva: {rotulo} *</label>
                  <textarea
                    id={descricao}
                    name={descricao}
                    required
                    maxLength={10000}
                    rows={3}
                  />
                </>
              )}
            </div>
          ))}
          {secoes.map(([nome, rotulo, dica]) => (
            <div className="field full" key={nome}>
              <label htmlFor={nome}>{rotulo} *</label>
              <textarea
                id={nome}
                name={nome}
                required
                maxLength={20000}
                rows={5}
                aria-describedby={`${nome}-dica`}
              />
              <small id={`${nome}-dica`}>{dica}</small>
            </div>
          ))}
          <div className="field">
            <label htmlFor="nomeCoordenador">
              Nome do coordenador da CLAI *
            </label>
            <input
              id="nomeCoordenador"
              name="nomeCoordenador"
              required
              maxLength={150}
            />
            <small>Identificação do coordenador, sem assinatura digital.</small>
          </div>
          <div className="field">
            <label htmlFor="dataDocumento">Data do documento *</label>
            <input
              id="dataDocumento"
              name="dataDocumento"
              type="date"
              required
              defaultValue={hoje()}
            />
          </div>
        </fieldset>
        <FormActions
          pending={pending}
          to={voltar}
          label="Salvar plano de ação"
        />
      </form>
    </section>
  )
}
