export const formatDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat('pt-BR').format(
        new Date(`${value.slice(0, 10)}T12:00:00`),
      )
    : 'Não informada'
export const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
export const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
export function safeDocumentUrl(url?: string): string | undefined {
  if (!url) return undefined
  try {
    const parsed = new URL(url, window.location.origin)
    if (parsed.origin !== window.location.origin) return undefined
    return ['http:', 'https:', 'blob:'].includes(parsed.protocol)
      ? parsed.href
      : undefined
  } catch {
    return undefined
  }
}
