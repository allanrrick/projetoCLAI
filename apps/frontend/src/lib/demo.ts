import type {
  Aluno,
  Atendimento,
  HistoricoParams,
  NovoAluno,
  NovoAtendimento,
  NovoRelatorio,
  NovoUsuario,
  Permission,
  RelatorioAcompanhamento,
  Session,
} from '../types'
import { ApiError } from './api'
import { normalize } from './format'

const fullPermissions: Permission[] = [
  'alunos:consultar',
  'alunos:cadastrar',
  'atendimentos:consultar',
  'atendimentos:cadastrar',
]

export const session: Session = {
  nome: 'Profissional CLAI',
  email: 'demo@example.com',
  perfil: 'PROFISSIONAL_CLAI',
  permissoes: fullPermissions,
}

export function cadastrarUsuario(input: NovoUsuario): Session {
  const permissoes: Permission[] =
    input.perfil === 'ASSISTENTE' ? ['alunos:consultar'] : fullPermissions
  return {
    nome: input.nome,
    email: input.email,
    perfil: input.perfil || 'PROFISSIONAL_CLAI',
    permissoes,
  }
}
// Somente dados fictícios, mantidos em memória. Recarregar a página restaura os exemplos.
const alunos: Aluno[] = [
  {
    idAluno: 1,
    matricula: 'DEMO001',
    nome: 'Ana Oliveira (exemplo)',
    email: 'ana@example.com',
    curso: 'Análise e Desenvolvimento de Sistemas',
    ativo: true,
    dataCadastro: '2026-10-09',
  },
  {
    idAluno: 2,
    matricula: 'DEMO002',
    nome: 'Bruno Santos (exemplo)',
    email: 'bruno@example.com',
    curso: 'Engenharia Civil',
    ativo: true,
    dataCadastro: '2026-10-10',
  },
  {
    idAluno: 3,
    matricula: 'DEMO003',
    nome: 'Clara Lima (exemplo)',
    email: null,
    curso: 'Licenciatura em Matemática',
    ativo: true,
    dataCadastro: '2026-10-12',
  },
  {
    idAluno: 4,
    matricula: 'DEMO004',
    nome: 'Daniel Costa (exemplo)',
    email: 'daniel@example.com',
    curso: 'Técnico em Informática',
    ativo: false,
    dataCadastro: '2026-10-13',
  },
]
const atendimentos: Atendimento[] = [
  {
    idAtendimento: 1,
    idAluno: 1,
    data: '2026-10-10',
    hora: '09:00',
    observacoes:
      'Acolhimento inicial e levantamento das necessidades de acompanhamento. Registro fictício para demonstração.',
    profissional: 'Profissional CLAI',
    documentos: [],
  },
  {
    idAtendimento: 2,
    idAluno: 1,
    data: '2026-10-14',
    hora: '14:30',
    observacoes:
      'Orientação sobre recursos de acessibilidade e organização da rotina de estudos. Registro fictício para demonstração.',
    profissional: 'Profissional CLAI',
    documentos: [],
  },
  {
    idAtendimento: 3,
    idAluno: 2,
    data: '2026-10-13',
    hora: '10:00',
    observacoes:
      'Acompanhamento pedagógico. Registro fictício para demonstração.',
    profissional: 'Profissional CLAI',
    documentos: [],
  },
]
export const getAlunos = () => structuredClone(alunos)
export function getAtendimentos(id: number, params: HistoricoParams = {}) {
  const { inicio, fim, ordem = 'desc' } = params
  if (inicio && fim && inicio > fim)
    throw new ApiError(
      'A data final deve ser igual ou posterior à data inicial.',
      400,
    )
  const query = normalize(params.q?.trim() || '')
  return structuredClone(
    atendimentos
      .filter(
        (item) =>
          item.idAluno === id &&
          (!inicio || item.data >= inicio) &&
          (!fim || item.data <= fim) &&
          (!query ||
            normalize(item.observacoes).includes(query) ||
            normalize(item.profissional).includes(query) ||
            item.documentos.some((doc) => normalize(doc.nome).includes(query))),
      )
      .sort(
        (a, b) =>
          `${a.data}T${a.hora}`.localeCompare(`${b.data}T${b.hora}`) *
          (ordem === 'desc' ? -1 : 1),
      ),
  )
}
export function cadastrarAluno(input: NovoAluno): Aluno {
  if (
    alunos.some(
      (aluno) =>
        aluno.matricula === input.matricula ||
        (input.email &&
          aluno.email?.toLowerCase() === input.email.toLowerCase()),
    )
  ) {
    throw new ApiError('Já existe um aluno com esta matrícula ou e-mail.', 409)
  }
  const aluno = {
    ...input,
    idAluno: alunos.length + 1,
    ativo: true,
    dataCadastro: new Date().toLocaleDateString('en-CA'),
  }
  alunos.push(aluno)
  return structuredClone(aluno)
}
export function cadastrarAtendimento(input: NovoAtendimento): Atendimento {
  const { documentos, ...dados } = input
  if (!alunos.some((aluno) => aluno.idAluno === dados.idAluno))
    throw new ApiError('Aluno não encontrado.', 404)
  const atendimento = {
    ...dados,
    idAtendimento: atendimentos.length + 1,
    profissional: session.nome,
    documentos: documentos.map((file, i) => ({
      id: `${atendimentos.length + 1}-${i}`,
      nome: file.name,
      url: URL.createObjectURL(file),
    })),
  }
  atendimentos.push(atendimento)
  return structuredClone(atendimento)
}
const relatorios: RelatorioAcompanhamento[] = [
  {
    id: 1,
    alunoId: 1,
    periodoLetivo: '2026.2',
    componenteCurricular: 'Estrutura de Dados',
    docente: 'Prof. Carlos Mendes',
    comentarioRelacionamento: 'Participa ativamente das aulas práticas.',
    comentarioCognitivo: 'Boa assimilação com apoio de material visual.',
    comentarioSocioemocional: 'Demonstra engajamento e autonomia.',
    avancosGerais: 'Evolução consistente na resolução de exercícios.',
    relatoDificuldades: 'Necessita de tempo adicional em avaliações escritas.',
    fatoresExternos: '',
    aspectos: [
      {
        id: 1,
        grupo: 'RELACIONAMENTO',
        opcao: 'Interage bem com colegas e docentes',
      },
      {
        id: 2,
        grupo: 'COGNITIVO',
        opcao: 'Compreende os conceitos trabalhados',
      },
    ],
    habilidades: [
      {
        id: 1,
        ordem: 1,
        habilidadeDesenvolvida: 'Implementação de listas encadeadas',
        nivelAprendizado: 'OTIMO',
        observacoes: 'Concluiu todas as atividades práticas.',
      },
    ],
    parecer:
      'Recomenda-se manter o acompanhamento semestral e o tempo adicional em provas.',
    dataRelatorio: '2026-10-15',
  },
]
export const getRelatorios = () => structuredClone(relatorios)
export function cadastrarRelatorio(
  input: NovoRelatorio,
): RelatorioAcompanhamento {
  if (!alunos.some((aluno) => aluno.idAluno === input.alunoId))
    throw new ApiError('Aluno não encontrado.', 404)
  const relatorio: RelatorioAcompanhamento = {
    ...input,
    id: relatorios.length + 1,
  }
  relatorios.unshift(relatorio)
  return structuredClone(relatorio)
}
