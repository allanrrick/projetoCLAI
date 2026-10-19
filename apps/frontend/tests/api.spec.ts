import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

const aluno = {
  idAluno: 1,
  matricula: 'API001',
  nome: 'Aluno da API',
  email: null,
  curso: 'Curso teste',
  ativo: true,
  dataCadastro: '2026-10-15',
}
const historicoAsc = [
  {
    id: 11,
    data: '2026-10-14',
    hora: '08:15:00',
    observacoes: 'Acolhimento inicial',
    profissional: 'Marina Costa',
    documentoUrl: null,
  },
  {
    id: 12,
    data: '2026-10-15',
    hora: '09:00:00',
    observacoes: 'Apoio para adaptação acadêmica',
    profissional: 'José Silva',
    documentoUrl: 'uploads/123e4567-e89b-12d3-a456-426614174000_plano.pdf',
  },
  {
    id: 13,
    data: '2026-10-15',
    hora: '14:30:00',
    observacoes: 'Revisão do plano de apoio',
    profissional: 'Renata Lima',
    documentoUrl: null,
  },
]
const historicoDesc = [...historicoAsc].reverse()

async function freezeClock(page: Page) {
  await page.clock.install({ time: new Date('2026-10-19T12:00:00Z') })
  await page.clock.pauseAt(new Date('2026-10-19T12:01:00Z'))
}

async function session(
  page: Page,
  permissoes = [
    'alunos:consultar',
    'alunos:cadastrar',
    'atendimentos:consultar',
    'atendimentos:cadastrar',
  ],
) {
  await page.route('**/api/auth/sessao', (route) =>
    route.fulfill({
      json: {
        nome: 'Pessoa teste',
        email: 'teste@example.com',
        permissoes,
        csrfToken: 'csrf-teste',
        csrfHeaderName: 'X-CSRF-TOKEN',
      },
    }),
  )
  await page.route('**/api/alunos', (route) =>
    route.request().method() === 'GET'
      ? route.fulfill({ json: [aluno] })
      : route.fallback(),
  )
}

test('envia o contrato real de alunos, normaliza espaços e informa erro sem apagar os campos', async ({
  page,
}) => {
  await session(page)
  let payload: unknown
  let csrf: string | undefined
  await page.route('**/api/alunos', async (route) => {
    if (route.request().method() !== 'POST') return route.fallback()
    payload = route.request().postDataJSON()
    csrf = route.request().headers()['x-csrf-token']
    return route.fulfill({ status: 409, json: { Erro: 'Aluno já cadastrado' } })
  })
  await page.goto('/alunos/novo')
  await page.getByLabel('Nome completo *').fill('  Pessoa teste  ')
  await page.getByLabel('Matrícula *').fill(' API001 ')
  await page.getByLabel('Curso *').fill(' Curso teste ')
  await page.getByRole('button', { name: 'Cadastrar aluno' }).click()
  await expect(page.getByRole('alert')).toContainText('Já existe um aluno')
  expect(payload).toEqual({
    nome: 'Pessoa teste',
    matricula: 'API001',
    email: null,
    curso: 'Curso teste',
  })
  expect(csrf).toBe('csrf-teste')
  await expect(page.getByLabel('Nome completo *')).toHaveValue(
    '  Pessoa teste  ',
  )
})

test('esconde ações sem permissão e bloqueia a navegação direta sem consultar atendimentos', async ({
  page,
}) => {
  await session(page, ['alunos:consultar'])
  let requested = false
  await page.route('**/api/atendimentos/API001*', (route) => {
    requested = true
    return route.fulfill({ json: [] })
  })
  await page.goto('/alunos')
  await expect(page.locator('tbody')).toContainText('Aluno da API')
  await expect(page.getByRole('link', { name: 'Cadastrar aluno' })).toHaveCount(
    0,
  )
  await expect(
    page.getByRole('link', { name: 'Histórico', exact: true }),
  ).toHaveCount(0)
  await expect(
    page.getByRole('link', { name: /Ver histórico de/ }),
  ).toHaveCount(0)
  await page.goto('/historico?aluno=1')
  await expect(
    page.getByRole('heading', { name: 'Acesso restrito' }),
  ).toBeVisible()
  expect(requested).toBeFalsy()
  await page.goto('/alunos/novo')
  await expect(
    page.getByRole('heading', { name: 'Acesso restrito' }),
  ).toBeVisible()
})

test('trata 403 sem expor registros e permite tentar novamente', async ({
  page,
}) => {
  await session(page)
  await page.route('**/api/atendimentos/API001*', (route) =>
    route.fulfill({ status: 403, json: {} }),
  )
  await page.goto('/historico?aluno=1')
  await expect(page.getByRole('alert')).toContainText('Você não tem permissão')
  await expect(page.locator('.timeline')).toHaveCount(0)
  await page.route('**/api/atendimentos/API001*', (route) =>
    route.fulfill({ json: [] }),
  )
  await page.getByRole('button', { name: 'Tentar novamente' }).click()
  await expect(
    page.getByText('Ainda não há atendimentos para este aluno'),
  ).toBeVisible()
})

test('expiração de sessão remove dados da interface e exige nova autenticação', async ({
  page,
}) => {
  await session(page)
  await page.route('**/api/atendimentos/API001*', (route) =>
    route.fulfill({ status: 401, json: {} }),
  )
  await page.goto('/historico?aluno=1')
  await expect(
    page.getByRole('heading', { name: 'Bem-vindo à CLAI' }),
  ).toBeVisible()
  await expect(page.getByRole('alert')).toContainText('Sua sessão expirou')
  await expect(page.getByText('Aluno da API')).toHaveCount(0)
})

test('API indisponível não ativa demonstração e não libera dados', async ({
  page,
}) => {
  await page.route('**/api/auth/sessao', (route) => route.abort('failed'))
  await page.goto('/alunos')
  await expect(page.getByRole('alert')).toContainText(
    'Não foi possível conectar',
  )
  await expect(page.getByText('Ana Oliveira (exemplo)')).toHaveCount(0)
  await expect(page.getByRole('navigation')).toHaveCount(0)
})

test('envia atendimento multipart com matrícula, data, hora, observações e documento e mapeia resposta do backend', async ({
  page,
}) => {
  await session(page)
  let body = ''
  let contentType = ''
  await page.route('**/api/atendimentos', (route) => {
    body = route.request().postData() || ''
    contentType = route.request().headers()['content-type']
    return route.fulfill({
      status: 201,
      json: {
        id: 1,
        data: '2026-10-15',
        hora: '09:30',
        observacoes: 'Registro de teste',
        documentoUrl: 'uploads/123e4567-e89b-12d3-a456-426614174000_teste.pdf',
        profissional: 'Pessoa teste',
      },
    })
  })
  await page.route('**/api/atendimentos/API001*', (route) =>
    route.fulfill({
      json: [
        {
          id: 1,
          data: '2026-10-15',
          hora: '09:30',
          observacoes: 'Registro de teste',
          documentoUrl:
            'uploads/123e4567-e89b-12d3-a456-426614174000_teste.pdf',
          profissional: 'Pessoa teste',
        },
      ],
    }),
  )
  await page.goto('/atendimentos/novo?aluno=1')
  await page.getByLabel('Data *').fill('2026-10-15')
  await page.getByLabel('Hora *').fill('09:30')
  await page.getByLabel('Observações *').fill('Registro de teste')
  await page.getByLabel('Documentos', { exact: true }).setInputFiles({
    name: 'teste.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4'),
  })
  await page.getByRole('button', { name: 'Registrar atendimento' }).click()
  await expect(page).toHaveURL(/historico\?aluno=1/)
  expect(contentType).toContain('multipart/form-data; boundary=')
  expect(body).toContain('name="matricula"')
  expect(body).toContain('API001')
  expect(body).toContain('name="data"')
  expect(body).toContain('2026-10-15')
  expect(body).toContain('name="hora"')
  expect(body).toContain('09:30')
  expect(body).toContain('Registro de teste')
  expect(body).toContain('name="documento"; filename="teste.pdf"')
  await expect(page.getByRole('link', { name: 'teste.pdf' })).toHaveAttribute(
    'href',
    'http://127.0.0.1:5174/api/atendimentos/documentos/123e4567-e89b-12d3-a456-426614174000_teste.pdf',
  )
})

test('login trata credenciais inválidas e consulta as permissões após autenticar', async ({
  page,
}) => {
  let authenticated = false
  await page.route('**/api/auth/sessao', (route) =>
    authenticated
      ? route.fulfill({
          json: {
            nome: 'Conta autenticada',
            email: 'conta@example.com',
            permissoes: ['alunos:consultar'],
          },
        })
      : route.fulfill({ status: 401, json: {} }),
  )
  await page.route('**/api/auth/login', (route) => {
    const credentials = route.request().postDataJSON()
    authenticated =
      credentials.email === 'conta@example.com' &&
      credentials.senha === 'correta'
    return authenticated
      ? route.fulfill({ status: 204 })
      : route.fulfill({ status: 401, json: {} })
  })
  await page.route('**/api/alunos', (route) => route.fulfill({ json: [aluno] }))
  await page.goto('/alunos')
  await expect(
    page.getByRole('heading', { name: 'Bem-vindo à CLAI' }),
  ).toBeVisible()
  await expect(page.getByRole('alert')).toHaveCount(0)
  await page.getByLabel('E-mail', { exact: true }).fill('conta@example.com')
  await page.getByLabel('Senha', { exact: true }).fill('incorreta')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page.getByRole('alert')).toHaveCount(1)
  await expect(page.getByRole('alert')).toContainText(
    'E-mail ou senha inválidos.',
  )
  await page.getByLabel('Senha', { exact: true }).fill('correta')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page.locator('tbody')).toContainText('Aluno da API')
  await expect(page.getByRole('link', { name: 'Cadastrar aluno' })).toHaveCount(
    0,
  )
})

test('cadastra novo usuário, valida confirmação de senha e autentica sessão', async ({
  page,
}) => {
  await page.route('**/api/auth/sessao', (route) =>
    route.fulfill({ status: 401, json: {} }),
  )
  let payload: unknown
  await page.route('**/api/auth/cadastro', (route) => {
    payload = route.request().postDataJSON()
    return route.fulfill({
      status: 201,
      json: {
        nome: 'Novo Profissional',
        email: 'novo@example.com',
        perfil: 'PROFISSIONAL_CLAI',
        permissoes: [
          'alunos:consultar',
          'alunos:cadastrar',
          'atendimentos:consultar',
          'atendimentos:cadastrar',
        ],
      },
    })
  })
  await page.route('**/api/alunos', (route) => route.fulfill({ json: [aluno] }))
  await page.goto('/alunos')
  await page.getByRole('button', { name: 'Criar conta' }).click()
  await expect(
    page.getByRole('heading', { name: 'Criar conta na CLAI' }),
  ).toBeVisible()
  await page.getByLabel('Nome completo').fill('Novo Profissional')
  await page.getByLabel('E-mail', { exact: true }).fill('novo@example.com')
  await page.getByLabel('Senha', { exact: true }).fill('senha123')
  await page.getByLabel('Confirmar senha').fill('outra123')
  await page.getByRole('button', { name: 'Cadastrar conta' }).click()
  await expect(page.getByRole('alert')).toContainText(
    'A confirmação de senha não confere.',
  )
  await page.getByLabel('Confirmar senha').fill('senha123')
  await page.getByRole('button', { name: 'Cadastrar conta' }).click()
  await expect(page.locator('tbody')).toContainText('Aluno da API')
  expect(payload).toEqual({
    nome: 'Novo Profissional',
    email: 'novo@example.com',
    senha: 'senha123',
    perfil: 'PROFISSIONAL_CLAI',
  })
})

test('falha no logout mantém a conta e a tentativa bem-sucedida volta ao login', async ({
  page,
}) => {
  await session(page)
  await page.route('**/api/auth/logout', (route) =>
    route.fulfill({ status: 500, json: {} }),
  )
  await page.goto('/alunos')
  await page.getByRole('button', { name: 'Sair da conta' }).click()
  await expect(page.getByRole('alert')).toContainText(
    'Não foi possível concluir',
  )
  await expect(page.locator('tbody')).toContainText('Aluno da API')
  await page.route('**/api/auth/logout', (route) =>
    route.fulfill({ status: 204 }),
  )
  await page.getByRole('button', { name: 'Sair da conta' }).click()
  await expect(
    page.getByRole('heading', { name: 'Bem-vindo à CLAI' }),
  ).toBeVisible()
  await expect(page.getByText('Aluno da API')).toHaveCount(0)
})

test('não cria links de anexo para scripts ou origens externas', async ({
  page,
}) => {
  await session(page)
  await page.route('**/api/atendimentos/API001*', (route) =>
    route.fulfill({
      json: [
        {
          idAtendimento: 1,
          idAluno: 1,
          data: '2026-10-15',
          hora: '09:30',
          observacoes: 'Teste de documentos',
          profissional: 'Pessoa teste',
          documentos: [
            { id: '1', nome: 'script.pdf', url: 'javascript:alert(1)' },
            {
              id: '2',
              nome: 'externo.pdf',
              url: 'https://externo.example.com/documento',
            },
            {
              id: '3',
              nome: 'seguro.pdf',
              url: '/api/atendimentos/documentos/3',
            },
          ],
        },
      ],
    }),
  )
  await page.goto('/historico?aluno=1')
  await expect(page.getByText('script.pdf')).toBeVisible()
  await expect(page.getByRole('link', { name: 'script.pdf' })).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'externo.pdf' })).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'seguro.pdf' })).toHaveAttribute(
    'href',
    'http://127.0.0.1:5174/api/atendimentos/documentos/3',
  )
})

test('pagina a lista e volta à primeira página após aplicar filtro', async ({
  page,
}) => {
  await session(page)
  await page.route('**/api/alunos', (route) =>
    route.fulfill({
      json: Array.from({ length: 11 }, (_, index) => ({
        ...aluno,
        idAluno: index + 1,
        nome: `Estudante ${index + 1}`,
        matricula: `M${index + 1}`,
      })),
    }),
  )
  await page.goto('/alunos')
  await expect(page.locator('tbody tr')).toHaveCount(8)
  await page.getByRole('button', { name: 'Próxima página' }).click()
  await expect(page.locator('tbody tr')).toHaveCount(3)
  await page
    .getByRole('textbox', { name: 'Buscar alunos' })
    .fill('Estudante 11')
  await expect(page.locator('tbody tr')).toHaveCount(1)
  await expect(
    page.getByRole('button', { name: 'Página anterior' }),
  ).toBeDisabled()
})

test('consulta pela matrícula e apresenta a ordem do servidor com data, hora e profissional', async ({
  page,
}, testInfo) => {
  await session(page)
  const consultas: URL[] = []
  await page.route('**/api/atendimentos/API001*', (route) => {
    const url = new URL(route.request().url())
    consultas.push(url)
    return route.fulfill({
      json:
        url.searchParams.get('ordem') === 'asc' ? historicoAsc : historicoDesc,
    })
  })
  await page.goto('/historico?aluno=1')
  const itens = page.locator('.timeline > li')
  await expect(itens.locator('.observations')).toHaveText([
    'Revisão do plano de apoio',
    'Apoio para adaptação acadêmica',
    'Acolhimento inicial',
  ])
  expect(consultas.at(-1)?.pathname).toBe('/api/atendimentos/API001')
  expect(Object.fromEntries(consultas.at(-1)!.searchParams)).toEqual({
    ordem: 'desc',
  })
  await expect(itens.locator('h3')).toHaveText([
    '15/10/2026',
    '15/10/2026',
    '14/10/2026',
  ])
  await expect(itens.locator('.timeline-header > span')).toHaveText([
    '14:30',
    '09:00',
    '08:15',
  ])
  await expect(itens.locator('.professional')).toHaveText([
    'Registrado por Renata Lima',
    'Registrado por José Silva',
    'Registrado por Marina Costa',
  ])
  await expect(page.getByRole('link', { name: 'plano.pdf' })).toHaveAttribute(
    'href',
    'http://127.0.0.1:5174/api/atendimentos/documentos/123e4567-e89b-12d3-a456-426614174000_plano.pdf',
  )
  const consultaAsc = page.waitForRequest(
    (request) =>
      new URL(request.url()).pathname === '/api/atendimentos/API001' &&
      new URL(request.url()).searchParams.get('ordem') === 'asc',
  )
  await page.getByLabel('Ordenação').selectOption('asc')
  await consultaAsc
  await expect(itens.locator('.observations')).toHaveText([
    'Acolhimento inicial',
    'Apoio para adaptação acadêmica',
    'Revisão do plano de apoio',
  ])
  await expect(itens.locator('.timeline-header > span')).toHaveText([
    '08:15',
    '09:00',
    '14:30',
  ])
  await page.screenshot({
    path: testInfo.outputPath('historico-desktop.png'),
    fullPage: true,
    animations: 'disabled',
  })
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByLabel('Buscar no histórico')).toBeVisible()
  await expect(page.getByLabel('Ordenação')).toBeVisible()
  await page.screenshot({
    path: testInfo.outputPath('historico-mobile.png'),
    fullPage: true,
    animations: 'disabled',
  })
})

test('aguarda 300 ms após a última alteração da busca e envia o texto aparado', async ({
  page,
}) => {
  await freezeClock(page)
  await session(page)
  const consultas: URL[] = []
  await page.route('**/api/atendimentos/API001*', (route) => {
    const url = new URL(route.request().url())
    consultas.push(url)
    return route.fulfill({
      json: url.searchParams.has('q')
        ? [historicoAsc[2], historicoAsc[1]]
        : historicoDesc,
    })
  })
  await page.goto('/historico?aluno=1')
  await expect(page.locator('.timeline > li')).toHaveCount(3)
  const consultasIniciais = consultas.length
  const busca = page.getByLabel('Buscar no histórico')
  await busca.fill('  apo')
  await page.clock.runFor(299)
  expect(consultas).toHaveLength(consultasIniciais)
  await busca.fill('  apoio  ')
  await page.clock.runFor(299)
  expect(consultas).toHaveLength(consultasIniciais)
  const consultaBusca = page.waitForRequest(
    (request) =>
      new URL(request.url()).pathname === '/api/atendimentos/API001' &&
      new URL(request.url()).searchParams.get('q') === 'apoio',
  )
  await page.clock.runFor(1)
  await consultaBusca
  await expect(page.locator('.timeline .observations')).toHaveText([
    'Revisão do plano de apoio',
    'Apoio para adaptação acadêmica',
  ])
  expect(consultas).toHaveLength(consultasIniciais + 1)
  expect(Object.fromEntries(consultas.at(-1)!.searchParams)).toEqual({
    q: 'apoio',
    ordem: 'desc',
  })
  await expect(busca).toHaveValue('  apoio  ')
})

test('combina busca, período e ordem na API e limpa todos os filtros', async ({
  page,
}) => {
  await session(page)
  const consultas: URL[] = []
  await page.route('**/api/atendimentos/API001*', (route) => {
    const url = new URL(route.request().url())
    consultas.push(url)
    let resposta =
      url.searchParams.get('ordem') === 'asc' ? historicoAsc : historicoDesc
    if (url.searchParams.has('inicio'))
      resposta = [historicoAsc[1], historicoAsc[2]]
    if (url.searchParams.has('q')) resposta = [historicoAsc[1]]
    return route.fulfill({ json: resposta })
  })
  await page.goto('/historico?aluno=1')
  const contador = page.locator('.result-count')
  await expect(contador).toHaveText('3 atendimentos encontrados')
  await expect(contador).toHaveAttribute('aria-live', 'polite')
  await expect(contador).toHaveAttribute('aria-atomic', 'true')
  await page.getByLabel('Ordenação').selectOption('asc')
  await expect(page.locator('.timeline .observations').first()).toHaveText(
    'Acolhimento inicial',
  )
  await page.getByLabel('De', { exact: true }).fill('2026-10-15')
  await expect(contador).toHaveText('2 atendimentos encontrados')
  const consultaFim = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === '/api/atendimentos/API001' &&
      new URL(response.url()).searchParams.get('fim') === '2026-10-15',
  )
  await page.getByLabel('Até', { exact: true }).fill('2026-10-15')
  await consultaFim
  await page.getByLabel('Buscar no histórico').fill('  JOSÉ  ')
  await expect(contador).toHaveText('1 atendimento encontrado')
  await expect(page.locator('.timeline .observations')).toHaveText([
    'Apoio para adaptação acadêmica',
  ])
  expect(Object.fromEntries(consultas.at(-1)!.searchParams)).toEqual({
    q: 'JOSÉ',
    inicio: '2026-10-15',
    fim: '2026-10-15',
    ordem: 'asc',
  })
  await page.getByRole('button', { name: 'Limpar filtros' }).click()
  await expect(contador).toHaveText('3 atendimentos encontrados')
  await expect(page.getByLabel('Buscar no histórico')).toHaveValue('')
  await expect(page.getByLabel('De', { exact: true })).toHaveValue('')
  await expect(page.getByLabel('Até', { exact: true })).toHaveValue('')
  await expect(page.getByLabel('Ordenação')).toHaveValue('desc')
  await expect(
    page.getByRole('button', { name: 'Limpar filtros' }),
  ).toHaveCount(0)
  expect(Object.fromEntries(consultas.at(-1)!.searchParams)).toEqual({
    ordem: 'desc',
  })
  await expect(page.locator('.timeline .observations')).toHaveText([
    'Revisão do plano de apoio',
    'Apoio para adaptação acadêmica',
    'Acolhimento inicial',
  ])
})

test('distingue aluno sem histórico de consulta sem resultados e anuncia o contador zero', async ({
  page,
}) => {
  await session(page)
  const consultas: URL[] = []
  await page.route('**/api/atendimentos/API001*', (route) => {
    consultas.push(new URL(route.request().url()))
    return route.fulfill({ json: [] })
  })
  await page.goto('/historico?aluno=1')
  const semHistorico = page.getByRole('heading', {
    name: 'Ainda não há atendimentos para este aluno',
  })
  const semResultado = page.getByRole('heading', {
    name: 'Nenhum atendimento encontrado',
  })
  const contador = page.locator(
    '.result-count[aria-live="polite"][aria-atomic="true"]',
  )
  await expect(semHistorico).toBeVisible()
  await expect(semResultado).toHaveCount(0)
  await expect(contador).toHaveText('0 atendimentos encontrados')
  await page.getByLabel('Buscar no histórico').fill('inexistente')
  await expect(semResultado).toBeVisible()
  await expect(semHistorico).toHaveCount(0)
  await expect(contador).toHaveText('0 atendimentos encontrados')
  expect(consultas.at(-1)?.searchParams.get('q')).toBe('inexistente')
  await page.getByRole('button', { name: 'Limpar filtros' }).click()
  await expect(semHistorico).toBeVisible()
  await expect(semResultado).toHaveCount(0)
  await expect(contador).toHaveText('0 atendimentos encontrados')
  expect(consultas.at(-1)?.searchParams.has('q')).toBe(false)
})

test('avisa sobre intervalo inválido sem consultar a API e permite corrigir as datas', async ({
  page,
}) => {
  await freezeClock(page)
  await session(page)
  const consultas: URL[] = []
  await page.route('**/api/atendimentos/API001*', (route) => {
    const url = new URL(route.request().url())
    consultas.push(url)
    return route.fulfill({
      json: url.searchParams.has('inicio') ? [] : historicoDesc,
    })
  })
  await page.goto('/historico?aluno=1')
  await expect(page.locator('.timeline > li')).toHaveCount(3)
  const inicio = page.getByLabel('De', { exact: true })
  const fim = page.getByLabel('Até', { exact: true })
  await inicio.fill('2026-10-16')
  await expect(page.locator('.result-count')).toHaveText(
    '0 atendimentos encontrados',
  )
  const consultasValidas = consultas.length
  await fim.fill('2026-10-15')
  await expect(page.getByRole('alert')).toHaveText(
    'A data final deve ser igual ou posterior à data inicial.',
  )
  await expect(inicio).toHaveAttribute('aria-invalid', 'true')
  await expect(fim).toHaveAttribute('aria-invalid', 'true')
  await expect(inicio).toHaveAttribute(
    'aria-describedby',
    'historico-periodo-erro',
  )
  await expect(fim).toHaveAttribute(
    'aria-describedby',
    'historico-periodo-erro',
  )
  await page.clock.runFor(1000)
  expect(consultas).toHaveLength(consultasValidas)
  await expect(page.locator('.timeline')).toHaveCount(0)
  await expect(page.locator('.result-count')).toBeEmpty()
  const consultaCorrigida = page.waitForRequest(
    (request) =>
      new URL(request.url()).pathname === '/api/atendimentos/API001' &&
      new URL(request.url()).searchParams.get('fim') === '2026-10-17',
  )
  await fim.fill('2026-10-17')
  await consultaCorrigida
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(inicio).not.toHaveAttribute('aria-invalid', 'true')
  await expect(fim).not.toHaveAttribute('aria-invalid', 'true')
  await expect(page.locator('.result-count')).toHaveText(
    '0 atendimentos encontrados',
  )
})

test('cancela a consulta pendente ao trocar de aluno e preserva o histórico atual', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const sinais: { url: string; aborted: boolean }[] = []
    Reflect.set(window, 'historicoSinais', sinais)
    const fetchOriginal = window.fetch.bind(window)
    window.fetch = (input, options) => {
      const url = input instanceof Request ? input.url : String(input)
      if (url.includes('/atendimentos/')) {
        const estado = { url, aborted: Boolean(options?.signal?.aborted) }
        sinais.push(estado)
        options?.signal?.addEventListener(
          'abort',
          () => {
            estado.aborted = true
          },
          { once: true },
        )
      }
      return fetchOriginal(input, options)
    }
  })
  await session(page)
  await page.route('**/api/alunos', (route) =>
    route.fulfill({
      json: [
        aluno,
        {
          ...aluno,
          idAluno: 2,
          matricula: 'API002',
          nome: 'Outro aluno',
        },
      ],
    }),
  )
  let liberarResposta!: () => void
  const respostaAntiga = new Promise<void>((resolve) => {
    liberarResposta = resolve
  })
  let pendentes = 0
  let concluidas = 0
  await page.route('**/api/atendimentos/API001*', async (route) => {
    if (new URL(route.request().url()).searchParams.get('q') !== 'pendente')
      return route.fulfill({ json: historicoDesc })
    pendentes += 1
    await respostaAntiga
    await route.fulfill({
      json: [{ ...historicoAsc[0], observacoes: 'Resposta antiga pendente' }],
    })
    concluidas += 1
  })
  await page.route('**/api/atendimentos/API002*', (route) =>
    route.fulfill({
      json: [
        {
          ...historicoAsc[0],
          id: 21,
          observacoes: 'Histórico do outro aluno',
        },
      ],
    }),
  )
  try {
    await page.goto('/historico?aluno=1')
    await expect(page.locator('.timeline > li')).toHaveCount(3)
    await page.getByLabel('Buscar no histórico').fill('pendente')
    await expect.poll(() => pendentes).toBeGreaterThan(0)
    await page.getByLabel('Selecione um aluno').selectOption('2')
    await expect(page.locator('.timeline .observations')).toHaveText([
      'Histórico do outro aluno',
    ])
    await expect(page.getByLabel('Buscar no histórico')).toHaveValue('')
    await expect
      .poll(() =>
        page.evaluate(() => {
          const sinais = Reflect.get(window, 'historicoSinais') as {
            url: string
            aborted: boolean
          }[]
          const pendentes = sinais.filter((estado) =>
            estado.url.includes('q=pendente'),
          )
          return pendentes.length > 0 && pendentes.every((item) => item.aborted)
        }),
      )
      .toBe(true)
  } finally {
    liberarResposta()
  }
  await expect.poll(() => concluidas).toBe(pendentes)
  await expect(page.locator('.timeline .observations')).toHaveText([
    'Histórico do outro aluno',
  ])
  await expect(page.getByText('Resposta antiga pendente')).toHaveCount(0)
  await expect(page.getByRole('alert')).toHaveCount(0)
})

test('exibe a mensagem em português de application/problem+json e permite nova consulta', async ({
  page,
}) => {
  await session(page)
  await page.route('**/api/atendimentos/API001*', (route) =>
    route.fulfill({
      status: 404,
      contentType: 'application/problem+json',
      body: JSON.stringify({
        type: 'about:blank',
        title: 'Not Found',
        status: 404,
        detail: 'Aluno não encontrado com a matrícula: API001',
      }),
    }),
  )
  await page.goto('/historico?aluno=1')
  await expect(page.getByRole('alert')).toHaveText(
    'Aluno não encontrado com a matrícula: API001',
  )
  await expect(page.locator('.timeline')).toHaveCount(0)
  await page.route('**/api/atendimentos/API001*', (route) =>
    route.fulfill({ json: historicoDesc }),
  )
  await page.getByRole('button', { name: 'Tentar novamente' }).click()
  await expect(page.locator('.timeline > li')).toHaveCount(3)
  await expect(page.getByRole('alert')).toHaveCount(0)
})
