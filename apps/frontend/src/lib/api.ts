import type {
  Aluno,
  Atendimento,
  NovoAluno,
  NovoAtendimento,
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
      400: 'Confira os dados informados e tente novamente.',
      401:
        path === '/auth/login'
          ? 'E-mail ou senha inválidos.'
          : 'Sua sessão não está ativa. Entre para continuar.',
      403: 'Você não tem permissão para realizar esta ação.',
      404: 'Este recurso ainda não está disponível no servidor.',
      409:
        path === '/alunos'
          ? 'Já existe um aluno com esta matrícula ou e-mail.'
          : 'Já existe um registro com estes dados.',
      413: 'Os documentos excedem o tamanho permitido.',
    }
    if (
      response.status === 401 &&
      path !== '/auth/login' &&
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
    const session = demo
      ? (await demo).session
      : await request<Session>('/auth/sessao')
    if (
      !session ||
      !Array.isArray(session.permissoes) ||
      !session.permissoes.every(
        (permission) => typeof permission === 'string',
      ) ||
      typeof session.nome !== 'string' ||
      typeof session.email !== 'string'
    ) {
      throw new ApiError(
        'Não foi possível verificar as permissões da sua conta.',
      )
    }
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
  async atendimentos(idAluno: number): Promise<Atendimento[]> {
    const result = demo
      ? (await demo).getAtendimentos(idAluno)
      : await request<Atendimento[]>(`/alunos/${idAluno}/atendimentos`)
    if (!Array.isArray(result))
      throw new ApiError('Não foi possível carregar o histórico.')
    return result
  },
  async cadastrarAtendimento(input: NovoAtendimento): Promise<Atendimento> {
    if (demo) return (await demo).cadastrarAtendimento(input)
    const { documentos, ...dados } = input
    const body = new FormData()
    body.append(
      'atendimento',
      new Blob([JSON.stringify(dados)], { type: 'application/json' }),
    )
    documentos.forEach((file) => body.append('documentos', file))
    return request<Atendimento>('/atendimentos', { method: 'POST', body })
  },
}
