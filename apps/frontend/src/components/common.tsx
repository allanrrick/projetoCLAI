import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  SearchX,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

export function Loading() {
  return (
    <div className="loading" role="status">
      <LoaderCircle className="spin" size={22} /> Carregando…
    </div>
  )
}
export function Notice({
  children,
  success = false,
}: {
  children: ReactNode
  success?: boolean
}) {
  return (
    <div
      className={`notice ${success ? 'success' : 'error'}`}
      role={success ? 'status' : 'alert'}
    >
      {success ? <CheckCircle2 size={19} /> : <AlertCircle size={19} />}
      <span>{children}</span>
    </div>
  )
}
export function Empty({
  title,
  children,
}: {
  title: string
  children?: ReactNode
}) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <SearchX size={27} />
      </span>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
    </div>
  )
}
export function PageTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <header className="page-title">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="subtitle">{description}</p>
      </div>
      {action}
    </header>
  )
}
export function BackLink() {
  return (
    <Link className="back-link" to="/alunos">
      <ArrowLeft size={16} /> Voltar para alunos
    </Link>
  )
}
export function FormActions({
  pending,
  to,
  label,
}: {
  pending: boolean
  to: string
  label: string
}) {
  return (
    <div className="form-actions">
      <Link className="button secondary" to={to}>
        Cancelar
      </Link>
      <button className="button primary" type="submit" disabled={pending}>
        {pending && <LoaderCircle size={17} className="spin" />}
        {pending ? 'Salvando…' : label}
      </button>
    </div>
  )
}
