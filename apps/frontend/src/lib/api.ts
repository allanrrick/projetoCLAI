import type {
  Aluno,
  Atendimento,
  Documento,
  HistoricoParams,
  NovoAluno,
  NovoAtendimento,
  NovoUsuario,
  Session,
} from '../types'

export const isDemo = import.meta.env.VITE_DEMO_MODE === 'true'
const base = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
let currentSession: Session | null = null

export class ApiError extends Error {
  status: number
  constructor(message: string, status = 0) {
    super(message)
    this.status = status
  }
}

function validateSession(session: unknown): Session {
  if (
    !session ||
    typeof session !== 'object' ||
    !Array.isArray((session as Session).permissoes) ||
    !(session as Session).permissoes.every(
      (permission) => typeof permission === 'string',
    ) ||
    typeof (session as Session).nome !== 'string' ||
    typeof (session as Session).email !== 'string'
  ) {
    throw new ApiError('Não foi possível verificar as permissões da sua conta.')
  }
  return session as Session
}

function mapAtendimento(
  raw: Record<string, unknown>,
  idAluno: number,
): Atendimento {
  const idAtendimento =
    typeof raw.idAtendimento === 'number'
      ? raw.idAtendimento
      : typeof raw.id === 'number'
        ? raw.id
        : 0
  const data = typeof raw.data === 'string' ? raw.data : ''
  const hora = typeof raw.hora === 'string' ? raw.hora : ''
  const observacoes = typeof raw.observacoes === 'string' ? raw.observacoes : ''
  const profissional =
    typeof raw.profissional === 'string' && raw.profissional.trim()
      ? raw.profissional
      : 'Profissional CLAI'

  let documentos: Documento[] = []
  if (Array.isArray(raw.documentos)) {
    documentos = raw.documentos.filter((doc): doc is Documento =>
      Boolean(
        doc &&
        typeof doc === 'object' &&
        typeof (doc as Documento).id === 'string' &&
        typeof (doc as Documento).nome === 'string',
      ),
    )
  } else if (typeof raw.documentoUrl === 'string' && raw.documentoUrl.trim()) {
    const fileName = raw.documentoUrl.split(/[/\\]/).pop() || 'documento'
    const displayName = fileName.replace(/^[0-9a-fA-F-]{36}_/, '')
    documentos = [
      {
        id: String(idAtendimento || fileName),
        nome: displayName,
        url: `${base}/atendimentos/documentos/${encodeURIComponent(fileName)}`,
      },
    ]
  }

  return {
    idAtendimento,
    idAluno: typeof raw.idAluno === 'number' ? raw.idAluno : idAluno,
    data,
    hora,
    observacoes,
    profissional,
    documentos,
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  if (options.body && !(options.body instanceof FormData))
    headers.set('Content-Type', 'application/json')
  if (options.method && options.method !== 'GET' && currentSession?.csrfToken) {
    headers.set(
      currentSession.csrfHeaderName || 'X-CSRF-TOKEN',
      currentSession.csrfToken,
    )
  }
  let response: Response
  try {
    response = await fetch(`${base}${path}`, {
      ...options,
      credentials: 'include',
      headers,
      signal: AbortSignal.timeout(15000),
      redirect: 'error',
    })
  } catch {
    throw new ApiError(
      'Não foi possível conectar ao servidor. Verifique a conexão e tente novamente.',
    )
  }
  if (!response.ok) {
    let detail = ''
    if (response.headers.get('content-type')?.includes('application/json')) {
      const parsed = await response.json().catch(() => ({}))
      const body = parsed && typeof parsed === 'object' ? parsed : {}
      detail =
        typeof body.Erro === 'string'
          ? body.Erro
          : typeof body.message === 'string'
            ? body.message
            : typeof body.detail === 'string'
              ? body.detail
              : ''
    }
    const messages: Record<number, string> = {
      400: detail || 'Confira os dados informados e tente novamente.',
      401:
        path === '/auth/login'
          ? 'E-mail ou senha inválidos.'
          : 'Sua sessão não está ativa. Entre para continuar.',
      403: 'Você não tem permissão para realizar esta ação.',
      404: detail || 'Este recurso ainda não está disponível no servidor.',
      409:
        path === '/alunos'
          ? 'Já existe um aluno com esta matrícula ou e-mail.'
          : path === '/auth/cadastro'
            ? 'Já existe um usuário com este e-mail.'
            : 'Já existe um registro com estes dados.',
      413: 'Os documentos excedem o tamanho permitido.',
    }
    if (
      response.status === 401 &&
      path !== '/auth/login' &&
      path !== '/auth/cadastro' &&
      path !== '/auth/sessao'
    ) {
      currentSession = null
      window.dispatchEvent(new Event('clai:unauthorized'))
    }
    throw new ApiError(
      messages[response.status] ||
        detail ||
        'Não foi possível concluir a operação. Tente novamente.',
      response.status,
    )
  }
  if (response.status === 204) return undefined as T
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new ApiError(
      'O servidor retornou uma resposta inesperada. Tente entrar novamente.',
    )
  }
  return response.json()
}

// O simulador só é carregado quando o modo de demonstração está explicitamente ativo.
const demo = isDemo ? import('./demo') : null
export const api = {
  async session(): Promise<Session> {
    const raw = demo
      ? (await demo).session
      : await request<Session>('/auth/sessao')
    const session = validateSession(raw)
    currentSession = session
    return session
  },
  async login(email: string, senha: string): Promise<Session> {
    if (demo) return (await demo).session
    await request<unknown>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    })
    return this.session()
  },
  async cadastrarUsuario(input: NovoUsuario): Promise<Session> {
    if (demo) return (await demo).cadastrarUsuario(input)
    const created = await request<Session>('/auth/cadastro', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    const session = validateSession(created)
    currentSession = session
    return session
  },
  async logout(): Promise<void> {
    if (!demo) await request<void>('/auth/logout', { method: 'POST' })
    currentSession = null
  },
  async alunos(): Promise<Aluno[]> {
    const result = demo
      ? (await demo).getAlunos()
      : await request<Aluno[]>('/alunos')
    if (!Array.isArray(result))
      throw new ApiError('Não foi possível carregar a lista de alunos.')
    return result
  },
  async cadastrarAluno(input: NovoAluno): Promise<Aluno> {
    return demo
      ? (await demo).cadastrarAluno(input)
      : request<Aluno>('/alunos', {
          method: 'POST',
          body: JSON.stringify(input),
        })
  },
  async atendimentos(
    idAluno: number,
    matricula?: string,
    params: HistoricoParams = {},
  ): Promise<Atendimento[]> {
    if (demo) return (await demo).getAtendimentos(idAluno, params)
    const chave = matricula ? encodeURIComponent(matricula) : String(idAluno)
    const query = new URLSearchParams()
    if (params.q?.trim()) query.set('q', params.q.trim())
    if (params.inicio) query.set('inicio', params.inicio)
    if (params.fim) query.set('fim', params.fim)
    if (params.ordem) query.set('ordem', params.ordem)
    const search = query.toString()
    const result = await request<Record<string, unknown>[]>(
      `/atendimentos/${chave}${search ? `?${search}` : ''}`,
    )
    if (!Array.isArray(result))
      throw new ApiError('Não foi possível carregar o histórico.')
    return result.map((item) => mapAtendimento(item, idAluno))
  },
  async cadastrarAtendimento(input: NovoAtendimento): Promise<Atendimento> {
    if (demo) return (await demo).cadastrarAtendimento(input)
    const { documentos, matricula, data, hora, observacoes, idAluno } = input
    const body = new FormData()
    body.append('matricula', matricula)
    body.append('data', data)
    body.append('hora', hora)
    body.append('observacoes', observacoes)
    if (documentos[0]) {
      body.append('documento', documentos[0])
    }
    const result = await request<Record<string, unknown>>('/atendimentos', {
      method: 'POST',
      body,
    })
    return mapAtendimento(result || {}, idAluno)
  },
}
