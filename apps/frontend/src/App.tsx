import { useCallback, useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import {
  BrowserRouter,
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  ClipboardPlus,
  GraduationCap,
  HeartHandshake,
  History,
  LogOut,
  Menu,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react'
import { api, ApiError, isDemo } from './lib/api'
import { initials } from './lib/format'
import type { Permission, Session } from './types'
import { Auth, useAuth } from './context'
import { Empty, Loading, Notice, PageTitle } from './components/common'
import './App.css'

function Logo() {
  return (
    <span className="logo">
      <span className="logo-symbol">
        <HeartHandshake size={25} strokeWidth={1.8} />
      </span>
      <span>
        CLAI<span className="logo-caption">CUIDADO QUE CONECTA</span>
      </span>
    </span>
  )
}
function Guard({
  permission,
  children,
}: {
  permission: Permission
  children: ReactNode
}) {
  const { can } = useAuth()
  return can(permission) ? (
    children
  ) : (
    <>
      <PageTitle
        eyebrow="Acesso"
        title="Acesso restrito"
        description="Esta funcionalidade não está disponível para o seu perfil."
      />
      <Empty title="Você não tem permissão para acessar esta página">
        Entre em contato com a coordenação caso precise deste acesso.
      </Empty>
    </>
  )
}
function Acesso() {
  const { session } = useAuth()
  const labels: Record<Permission, string> = {
    'alunos:consultar': 'Consultar alunos',
    'alunos:cadastrar': 'Cadastrar alunos',
    'atendimentos:consultar': 'Consultar o histórico de atendimentos',
    'atendimentos:cadastrar': 'Registrar atendimentos',
  }
  return (
    <>
      <PageTitle
        eyebrow="Minha conta"
        title="Seu acesso"
        description="Confira as funcionalidades disponíveis para a sua conta."
      />
      <section className="panel account-panel">
        <span className="avatar large">{initials(session.nome)}</span>
        <h2>{session.nome}</h2>
        <p className="muted">{session.email}</p>
        <hr />
        <h3>Permissões da conta</h3>
        <ul className="permission-list">
          {session.permissoes
            .filter((p) => Object.hasOwn(labels, p))
            .map((p) => (
              <li key={p}>
                <ShieldCheck size={18} />
                {labels[p]}
              </li>
            ))}
        </ul>
        {session.permissoes.length === 0 && (
          <p>Nenhuma funcionalidade foi liberada para esta conta.</p>
        )}
      </section>
    </>
  )
}
function Layout() {
  const { session, can, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [compact, setCompact] = useState(
    () => window.matchMedia('(max-width: 800px)').matches,
  )
  const [error, setError] = useState('')
  const [leaving, setLeaving] = useState(false)
  const location = useLocation()
  useEffect(() => {
    const media = window.matchMedia('(max-width: 800px)')
    const update = (event: MediaQueryListEvent) => setCompact(event.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  const links = [
    {
      to: '/alunos',
      label: 'Alunos',
      icon: Users,
      permission: 'alunos:consultar',
    },
    {
      to: '/atendimentos/novo',
      label: 'Novo atendimento',
      icon: ClipboardPlus,
      permission: 'atendimentos:cadastrar',
    },
    {
      to: '/historico',
      label: 'Histórico',
      icon: History,
      permission: 'atendimentos:consultar',
    },
  ] as const
  const section = location.pathname.startsWith('/historico')
    ? 'Histórico'
    : location.pathname.startsWith('/atendimentos')
      ? 'Atendimentos'
      : location.pathname.startsWith('/acesso')
        ? 'Minha conta'
        : 'Alunos'
  useEffect(() => {
    document.title = `${section} · CLAI`
    document.getElementById('main-content')?.focus()
  }, [location.pathname, section])
  async function leave() {
    setLeaving(true)
    setError('')
    try {
      await logout()
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'Não foi possível sair.',
      )
    } finally {
      setLeaving(false)
    }
  }
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Pular para o conteúdo
      </a>
      {menuOpen && (
        <button
          className="nav-backdrop"
          aria-label="Fechar navegação"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside
        id="main-navigation"
        inert={compact && !menuOpen}
        className={`sidebar ${menuOpen ? 'open' : ''}`}
        aria-label="Navegação principal"
        onClickCapture={(event) => {
          if ((event.target as Element).closest('a')) setMenuOpen(false)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setMenuOpen(false)
        }}
      >
        <Link to="/" className="brand-link" aria-label="CLAI — início">
          <Logo />
        </Link>
        <div className="workspace-label">
          <span className="campus-mark">
            <GraduationCap size={18} />
          </span>
          <div>
            Campus Cajazeiras<small>Coordenação de Acessibilidade</small>
          </div>
        </div>
        <p className="nav-label">ACOMPANHAMENTO</p>
        <nav>
          {links
            .filter(
              (link) =>
                can(link.permission) &&
                (link.permission.startsWith('alunos:') ||
                  can('alunos:consultar')),
            )
            .map(({ to, label, icon: Icon }) => (
              <NavLink to={to} key={to}>
                <Icon size={19} />
                {label}
                <span className="nav-dot" />
              </NavLink>
            ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="care-note">
            <BookOpen size={20} />
            <p>
              Cada trajetória importa.
              <span>Um espaço para acolher, acompanhar e incluir.</span>
            </p>
          </div>
          <NavLink className="account-link" to="/acesso">
            <ShieldCheck size={19} />
            Meu acesso
          </NavLink>
          <button className="logout" onClick={leave} disabled={leaving}>
            <LogOut size={18} />
            {leaving ? 'Saindo…' : 'Sair da conta'}
          </button>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={menuOpen}
              aria-controls="main-navigation"
            >
              {menuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
            <span>Espaço de acompanhamento</span>
            <span className="crumb-slash">/</span>
            <strong>{section}</strong>
          </div>
          <Link to="/acesso" className="user-profile">
            <span className="user-name">
              {session.nome}
              <small>{isDemo ? 'Conta de demonstração' : 'Minha conta'}</small>
            </span>
            <span className="avatar">{initials(session.nome)}</span>
          </Link>
        </header>
        {isDemo && (
          <div className="demo-banner">
            Demonstração com dados fictícios. As alterações duram até recarregar
            a página. Não insira dados reais.
          </div>
        )}
        <main id="main-content" tabIndex={-1}>
          {error && <Notice>{error}</Notice>}
          <Routes>
            <Route
              path="/"
              element={
                <Navigate
                  to={can('alunos:consultar') ? '/alunos' : '/acesso'}
                  replace
                />
              }
            />
            <Route
              path="/alunos"
              element={
                <Guard permission="alunos:consultar">
                  <Pending title="Alunos" />
                </Guard>
              }
            />
            <Route
              path="/alunos/novo"
              element={
                <Guard permission="alunos:cadastrar">
                  <Pending title="Cadastrar aluno" />
                </Guard>
              }
            />
            <Route
              path="/atendimentos/novo"
              element={
                <Guard permission="atendimentos:cadastrar">
                  <Guard permission="alunos:consultar">
                    <Pending title="Registrar atendimento" />
                  </Guard>
                </Guard>
              }
            />
            <Route
              path="/historico"
              element={
                <Guard permission="atendimentos:consultar">
                  <Guard permission="alunos:consultar">
                    <Pending title="Historico de atendimentos" />
                  </Guard>
                </Guard>
              }
            />
            <Route path="/acesso" element={<Acesso />} />
            <Route
              path="*"
              element={
                <>
                  <PageTitle
                    eyebrow="Navegação"
                    title="Página não encontrada"
                    description="O endereço acessado não está disponível."
                  />
                  <Link to="/" className="button primary">
                    Voltar ao início
                  </Link>
                </>
              }
            />
          </Routes>
          <footer className="page-footer">
            <span>CLAI · Coordenação Local de Acessibilidade e Inclusão</span>
            <span>IFPB · Campus Cajazeiras</span>
          </footer>
        </main>
      </div>
    </div>
  )
}
function Login({
  onLogin,
  initialError,
  retry,
}: {
  onLogin: (session: Session) => void
  initialError: string
  retry: () => void
}) {
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    const form = new FormData(event.currentTarget)
    setPending(true)
    setError('')
    try {
      onLogin(
        await api.login(
          String(form.get('email')).trim(),
          String(form.get('senha')),
        ),
      )
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'Não foi possível entrar.',
      )
    } finally {
      setPending(false)
    }
  }
  return (
    <div className="login-screen">
      <section className="login-intro">
        <Logo />
        <div>
          <span className="eyebrow">ACESSIBILIDADE E INCLUSÃO</span>
          <h1>
            Um olhar atento.
            <br />
            Mais possibilidades.
          </h1>
          <p>
            Um espaço para acompanhar cada trajetória e fortalecer o cuidado com
            nossos alunos.
          </p>
        </div>
        <span>IFPB · Campus Cajazeiras</span>
      </section>
      <main className="login-content">
        <div className="login-form">
          <span className="section-icon">
            <ShieldCheck size={24} />
          </span>
          <h2>Bem-vindo à CLAI</h2>
          <p className="subtitle">
            Entre com sua conta para acessar o acompanhamento.
          </p>
          {initialError && (
            <>
              <Notice>{initialError}</Notice>
              <button className="text-button" onClick={retry}>
                Verificar sessão novamente
              </button>
            </>
          )}
          {error && <Notice>{error}</Notice>}
          <form onSubmit={submit}>
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              placeholder="seu.email@instituicao.edu.br"
              maxLength={150}
              required
            />
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              name="senha"
              type="password"
              autoComplete="current-password"
              required
            />
            <button
              type="submit"
              className="button primary full"
              disabled={pending}
            >
              {pending ? 'Entrando…' : 'Entrar'}
              <ArrowRight size={18} />
            </button>
          </form>
          <p className="login-help">
            Precisa de acesso? Entre em contato com a coordenação.
          </p>
        </div>
      </main>
    </div>
  )
}
export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    let active = true
    api
      .session()
      .then((value) => {
        if (active) setSession(value)
      })
      .catch((reason: unknown) => {
        if (active && !(reason instanceof ApiError && reason.status === 401))
          setError(
            reason instanceof Error
              ? reason.message
              : 'Não foi possível verificar sua sessão.',
          )
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [revision])
  useEffect(() => {
    const reset = () => {
      setSession(null)
      setError('Sua sessão expirou. Entre novamente para continuar.')
    }
    window.addEventListener('clai:unauthorized', reset)
    return () => window.removeEventListener('clai:unauthorized', reset)
  }, [])
  const logout = useCallback(async () => {
    await api.logout()
    setSession(null)
    setError('')
  }, [])
  if (loading)
    return (
      <div className="boot-screen">
        <Logo />
        <Loading />
      </div>
    )
  if (!session)
    return (
      <Login
        key={revision}
        onLogin={setSession}
        initialError={error}
        retry={() => {
          setLoading(true)
          setError('')
          setRevision((value) => value + 1)
        }}
      />
    )
  return (
    <Auth.Provider
      value={{
        session,
        can: (permission) => session.permissoes.includes(permission),
        logout,
      }}
    >
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </Auth.Provider>
  )
}

function Pending({ title }: { title: string }) {
  return (
    <PageTitle
      eyebrow="CLAI"
      title={title}
      description="Modulo em desenvolvimento nesta branch de feature."
    />
  )
}
