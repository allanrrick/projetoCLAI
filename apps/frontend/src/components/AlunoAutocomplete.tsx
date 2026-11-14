import { useCallback, useEffect, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useResource } from '../hooks/useResource'
import { api } from '../lib/api'
import { normalize } from '../lib/format'
import type { Aluno } from '../types'

export function AlunoAutocomplete({
  id,
  value,
  selectedId,
  onChange,
  onSelect,
  label,
  placeholder,
  required = false,
}: {
  id: string
  value: string
  selectedId?: number
  onChange: (value: string) => void
  onSelect: (aluno: Aluno) => void
  label?: string
  placeholder?: string
  required?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [debounced, setDebounced] = useState('')
  const query = value.trim()
  const expanded = open && query.length >= 3 && selectedId === undefined
  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(query), 300)
    return () => window.clearTimeout(timeout)
  }, [query])
  const ready = expanded && query === debounced
  const load = useCallback(
    async (signal: AbortSignal) => {
      if (!ready) return []
      const alunos = await api.alunos(signal)
      return alunos
        .filter((aluno) => normalize(aluno.nome).includes(normalize(debounced)))
        .slice(0, 5)
    },
    [ready, debounced],
  )
  const { data, error, loading, retry } = useResource(load)
  const pending = loading || query !== debounced
  const options = !pending && !error ? data || [] : []
  const active = options[activeIndex]
  function select(aluno: Aluno) {
    setOpen(false)
    setActiveIndex(-1)
    onSelect(aluno)
  }
  function keyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      setActiveIndex(-1)
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setOpen(true)
      if (options.length) {
        setActiveIndex((index) =>
          event.key === 'ArrowDown'
            ? (index + 1) % options.length
            : index <= 0
              ? options.length - 1
              : index - 1,
        )
      }
    } else if (event.key === 'Enter' && expanded) {
      event.preventDefault()
      if (active) select(active)
    }
  }
  return (
    <div
      className="aluno-autocomplete"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
    >
      <input
        id={id}
        type="search"
        role="combobox"
        aria-label={label}
        aria-autocomplete="list"
        aria-haspopup="listbox"
        aria-expanded={expanded}
        aria-controls={`${id}-sugestoes`}
        aria-describedby={`${id}-ajuda`}
        aria-activedescendant={
          expanded && active ? `${id}-opcao-${active.idAluno}` : undefined
        }
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        required={required}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setActiveIndex(-1)
          setOpen(true)
          onChange(event.target.value)
        }}
        onKeyDown={keyDown}
      />
      <span id={`${id}-ajuda`} className="sr-only">
        Digite pelo menos 3 caracteres do nome. Use as setas e Enter para
        selecionar um aluno.
      </span>
      {expanded && (
        <div className="aluno-sugestoes">
          {pending ? (
            <div className="aluno-busca-mensagem" role="status">
              Buscando alunos…
            </div>
          ) : error ? (
            <div className="aluno-busca-mensagem" role="alert">
              {error}
              <button type="button" className="text-button" onClick={retry}>
                Tentar novamente
              </button>
            </div>
          ) : options.length === 0 ? (
            <div className="aluno-busca-mensagem" role="status">
              Nenhuma sugestão encontrada.
            </div>
          ) : null}
          <div
            id={`${id}-sugestoes`}
            role="listbox"
            aria-label="Sugestões de alunos"
            aria-busy={pending}
          >
            {options.map((aluno, index) => (
              <button
                type="button"
                role="option"
                id={`${id}-opcao-${aluno.idAluno}`}
                key={aluno.idAluno}
                tabIndex={-1}
                aria-selected={index === activeIndex}
                className="aluno-opcao"
                onPointerDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => select(aluno)}
              >
                <strong>{aluno.nome}</strong>
                <span>{aluno.matricula}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
