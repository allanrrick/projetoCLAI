import type {
  Aluno,
  Atendimento,
  HistoricoParams,
  NovoAluno,
  NovoAtendimento,
  NovoPea,
  NovoPei,
  NovoPlanoAcao,
  NovoRelatorio,
  NovoUsuario,
  Pea,
  Pei,
  Permission,
  PlanoAcao,
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
  'planos:consultar',
  'planos:cadastrar',
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
const peis: Pei[] = [
  {
    id: 1,
    alunoMatricula: 'DEMO001',
    periodoLetivo: '2026.2',
    historico:
      'Estudante ingressante pelo sistema de reserva de vagas, com acompanhamento contínuo da CLAI.',
    necessidadesEspecificas:
      'Ampliação de material didático e tempo adicional em avaliações.',
    afinidades: [
      { id: 1, afinidade: 'Desenvolvimento web e interfaces visuais' },
      { id: 2, afinidade: 'Projetos práticos em equipe' },
    ],
    dificuldades: 'Leitura de textos extensos sem adaptação tipográfica.',
    propostasAdaptacao:
      'Disponibilização prévia de slides e roteiros práticos com fonte ampliada.',
    dataCriacao: '2026-10-12',
  },
]
export function getPeis(matricula: string): Pei[] {
  return structuredClone(
    peis.filter((item) => item.alunoMatricula === matricula),
  )
}
export function cadastrarPei(input: NovoPei): Pei {
  const aluno = alunos.find((item) => item.matricula === input.alunoMatricula)
  if (!aluno) throw new ApiError('Aluno não encontrado.', 404)
  const novo: Pei = {
    id: peis.length + 1,
    alunoMatricula: input.alunoMatricula,
    periodoLetivo: input.periodoLetivo,
    historico: input.historico,
    necessidadesEspecificas: input.necessidades,
    afinidades: input.afinidades.map((item, idx) => ({
      id: idx + 1,
      afinidade: item.afinidade,
    })),
    dificuldades: input.dificuldades,
    propostasAdaptacao: input.propostas,
    dataCriacao: new Date().toLocaleDateString('en-CA'),
  }
  peis.unshift(novo)
  return structuredClone(novo)
}
const peas: Pea[] = [
  {
    id: 1,
    alunoMatricula: 'DEMO001',
    disciplina: 'Algoritmos e Programação',
    periodoLetivo: '2026.2',
    docente: 'Prof. Marcos Vieira',
    objetivos: 'Desenvolver lógica de programação com exercícios guiados.',
    conteudos: 'Estruturas condicionais, laços de repetição e funções.',
    estrategiasEnsino: 'Uso de fluxogramas visuais e monitoria individualizada.',
    avaliacaoAdaptada:
      'Provas práticas em laboratório com tempo estendido em 50%.',
    dataCriacao: '2026-10-14',
  },
]
export function getPeas(matricula: string, disciplina?: string): Pea[] {
  const termo = normalize(disciplina?.trim() || '')
  return structuredClone(
    peas.filter(
      (item) =>
        item.alunoMatricula === matricula &&
        (!termo || normalize(item.disciplina).includes(termo)),
    ),
  )
}
export function cadastrarPea(input: NovoPea): Pea {
  const aluno = alunos.find((item) => item.matricula === input.alunoMatricula)
  if (!aluno) throw new ApiError('Aluno não encontrado.', 404)
  const novo: Pea = {
    ...input,
    id: peas.length + 1,
    dataCriacao: new Date().toLocaleDateString('en-CA'),
  }
  peas.unshift(novo)
  return structuredClone(novo)
}
const planosAcao: PlanoAcao[] = [
  {
    idPlano: 1,
    idAluno: 1,
    alunoNome: 'Ana Oliveira (exemplo)',
    alunoMatricula: 'DEMO001',
    alunoCurso: 'Análise e Desenvolvimento de Sistemas',
    alunoEmail: 'ana@example.com',
    responsavelNome: 'Helena Oliveira',
    responsavelParentesco: 'Mãe',
    responsavelContato: '(83) 99999-1001',
    possuiComorbidades: false,
    comorbidades: null,
    usoMedicacaoContinua: false,
    medicacaoContinua: null,
    servicosApoio: 'Acompanhamento pedagógico e orientação de estudos',
    documentosComprobatorios: 'Relatório multiprofissional inicial',
    necessidadesEspecificas:
      'Materiais didáticos com estrutura visual clara e antecedência nas entregas.',
    percursoEducacional:
      'Boa adaptação às disciplinas técnicas e participação ativa em projetos.',
    principaisDemandas:
      'Organização de cronograma de avaliações e apoio em atividades extensas.',
    propostasIntervencao:
      'Encontros quinzenais com a equipe da CLAI e articulação com os docentes.',
    assinaturaCoordenador: 'Coordenação Local CLAI - Campus Cajazeiras',
    dataDocumento: '2026-10-14',
    autor: 'Profissional CLAI',
    criadoEm: '2026-10-14T10:00:00',
  },
]
export function getPlanosAcao(idAluno: number): PlanoAcao[] {
  const aluno = alunos.find((item) => item.idAluno === idAluno)
  if (!aluno) throw new ApiError('Aluno não encontrado.', 404)
  return structuredClone(
    planosAcao.filter((item) => item.idAluno === idAluno),
  )
}
export function cadastrarPlanoAcao(input: NovoPlanoAcao): PlanoAcao {
  const aluno = alunos.find((item) => item.idAluno === input.idAluno)
  if (!aluno) throw new ApiError('Aluno não encontrado.', 404)
  const novo: PlanoAcao = {
    ...input,
    idPlano: planosAcao.length + 1,
    alunoNome: aluno.nome,
    alunoMatricula: aluno.matricula,
    alunoCurso: aluno.curso,
    alunoEmail: aluno.email,
    autor: session.nome,
    criadoEm: new Date().toISOString(),
  }
  planosAcao.unshift(novo)
  return structuredClone(novo)
}
