import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

const aluno = {
  idAluno: 1,
  nome: 'Estudante de teste',
  matricula: 'PLANO001',
  curso: 'ADS',
  email: 'aluno@example.com',
  ativo: true,
  dataCadastro: '2026-10-19',
}
const perguntas = [
  'possuiComorbidade',
  'usaMedicacaoContinua',
  'frequentaServicosApoio',
  'apresentouDocumentos',
]
const narrativas = [
  'necessidadesEspecificas',
  'percursoEducacional',
  'principaisDemandas',
  'propostasIntervencao',
]

async function preparar(
  page: Page,
  permissoes = ['alunos:consultar', 'planos:consultar', 'planos:cadastrar'],
) {
  await page.route('**/api/auth/sessao', (route) =>
    route.fulfill({
      json: {
        nome: 'Profissional de teste',
        email: 'profissional@example.com',
        permissoes,
        csrfToken: 'csrf-plano',
      },
    }),
  )
  await page.route('**/api/alunos', (route) => route.fulfill({ json: [aluno] }))
  await page.route('**/api/alunos/1', (route) => route.fulfill({ json: aluno }))
  await page.route('**/api/planos-acao/aluno/*', (route) =>
    route.fulfill({ json: [] }),
  )
}

async function preencher(page: Page) {
  await page.locator('#periodoLetivo').fill(' 2026.2 ')
  for (const nome of perguntas)
    await page.locator(`#${nome}`).selectOption('nao')
  for (const nome of narrativas)
    await page.locator(`#${nome}`).fill('Inclusão e apoio\nSegunda linha.')
  await page.locator('#nomeCoordenador').fill('Coordenação de teste')
}

test('envia o plano para a API, preserva preenchimento após erro e evita envio duplicado', async ({
  page,
}) => {
  await preparar(page)
  let envios = 0
  let dados: Record<string, unknown> = {}
  let responder = () => {}
  const resposta = new Promise<void>((resolve) => {
    responder = resolve
  })
  await page.route('**/api/planos-acao', async (route) => {
    envios++
    dados = route.request().postDataJSON()
    expect(route.request().headers()['x-csrf-token']).toBe('csrf-plano')
    await resposta
    await route.fulfill({
      status: 500,
      json: { Erro: 'Falha controlada no teste.' },
    })
  })
  await page.goto('/alunos/1/planos/novo')
  await preencher(page)
  await page
    .getByRole('button', { name: 'Salvar plano de ação' })
    .click({ clickCount: 2 })
  await expect(page.getByRole('button', { name: 'Salvando…' })).toBeDisabled()
  responder()
  await expect(page.getByRole('alert')).toContainText('Falha controlada')
  await expect(page.locator('#periodoLetivo')).toHaveValue(' 2026.2 ')
  await expect(page.locator('#necessidadesEspecificas')).toHaveValue(
    'Inclusão e apoio\nSegunda linha.',
  )
  expect(envios).toBe(1)
  expect(dados.periodoLetivo).toBe('2026.2')
  expect(dados.idAluno).toBe(1)
  expect(dados).not.toHaveProperty('autorId')
})

test('valida espaços nos campos obrigatórios e nas quatro descrições condicionais', async ({
  page,
}) => {
  await preparar(page)
  let envios = 0
  await page.route('**/api/planos-acao', (route) => {
    envios++
    return route.fulfill({ status: 500 })
  })
  await page.goto('/alunos/1/planos/novo')
  await preencher(page)
  for (const nome of ['periodoLetivo', ...narrativas, 'nomeCoordenador']) {
    await page.locator(`#${nome}`).fill('   ')
    await page.getByRole('button', { name: 'Salvar plano de ação' }).click()
    await expect(page.getByRole('alert')).toContainText('apenas espaços')
    await page.locator(`#${nome}`).fill('Texto de teste')
  }
  const descricoes = [
    'comorbidades',
    'medicacoes',
    'servicosApoio',
    'documentosComprobatorios',
  ]
  for (let i = 0; i < perguntas.length; i++) {
    await page.locator(`#${perguntas[i]}`).selectOption('sim')
    await page.locator(`#${descricoes[i]}`).fill('   ')
    await page.getByRole('button', { name: 'Salvar plano de ação' }).click()
    await expect(page.getByRole('alert')).toContainText('cada resposta Sim')
    await page.locator(`#${descricoes[i]}`).fill('Descrição de teste')
  }
  expect(envios).toBe(0)
})

test('não mistura planos ao trocar de aluno e trata ausência de planos', async ({
  page,
}) => {
  await preparar(page)
  await page.route('**/api/planos-acao/aluno/1', (route) =>
    route.fulfill({
      json: [
        {
          idPlanoAcao: 1,
          idAluno: 1,
          periodoLetivo: '2026.2',
          dataDocumento: '2026-10-19',
          dataCriacao: '2026-10-19T10:00:00',
          necessidadesEspecificas: 'PLANO EXCLUSIVO DO PRIMEIRO ALUNO',
        },
      ],
    }),
  )
  await page.route('**/api/alunos/2', (route) =>
    route.fulfill({ json: { ...aluno, idAluno: 2, nome: 'Outro estudante' } }),
  )
  await page.goto('/alunos/1/planos')
  await page.locator('summary').click()
  await expect(
    page.getByText('PLANO EXCLUSIVO DO PRIMEIRO ALUNO'),
  ).toBeVisible()
  await page.goto('/alunos/2/planos')
  await expect(
    page.getByRole('heading', { name: 'Nenhum plano cadastrado' }),
  ).toBeVisible()
  await expect(page.getByText('PLANO EXCLUSIVO DO PRIMEIRO ALUNO')).toHaveCount(
    0,
  )
})

test('bloqueia assistente na navegação direta e esconde a ação na lista', async ({
  page,
}) => {
  await preparar(page, ['alunos:consultar'])
  let consultas = 0
  await page.route('**/api/planos-acao/**', (route) => {
    consultas++
    return route.fulfill({ status: 403 })
  })
  await page.goto('/alunos')
  await expect(page.locator('tbody')).toContainText(aluno.nome)
  await expect(page.getByRole('link', { name: /Ver planos de/ })).toHaveCount(0)
  for (const url of ['/alunos/1/planos', '/alunos/1/planos/novo']) {
    await page.goto(url)
    await expect(
      page.getByRole('heading', { name: 'Acesso restrito' }),
    ).toBeVisible()
  }
  expect(consultas).toBe(0)
})

test('trata aluno inexistente e sessão ausente', async ({ page }) => {
  await preparar(page)
  await page.route('**/api/alunos/99', (route) =>
    route.fulfill({ status: 404, json: { Erro: 'Aluno não encontrado.' } }),
  )
  await page.goto('/alunos/99/planos')
  await expect(page.getByRole('alert')).toContainText('Aluno não encontrado')
  await page.route('**/api/auth/sessao', (route) =>
    route.fulfill({ status: 401 }),
  )
  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'Bem-vindo à CLAI' }),
  ).toBeVisible()
})

test('mostra erro e permite tentar consultar os planos novamente', async ({
  page,
}) => {
  await preparar(page)
  let consultas = 0
  await page.route('**/api/planos-acao/aluno/1', (route) => {
    consultas++
    return consultas === 1
      ? route.fulfill({ status: 500, json: { Erro: 'Consulta indisponível.' } })
      : route.fulfill({ json: [] })
  })
  await page.goto('/alunos/1/planos')
  await expect(page.getByRole('alert')).toContainText('Consulta indisponível')
  await page.getByRole('button', { name: 'Tentar novamente' }).click()
  await expect(
    page.getByRole('heading', { name: 'Nenhum plano cadastrado' }),
  ).toBeVisible()
})

for (const status of [401, 403]) {
  test(`trata HTTP ${status} ao consultar planos sem mostrar conteúdo privado`, async ({
    page,
  }) => {
    await preparar(page)
    await page.route('**/api/planos-acao/aluno/1', (route) =>
      route.fulfill({ status, json: { Erro: 'Acesso negado.' } }),
    )
    await page.goto('/alunos/1/planos')
    if (status === 401)
      await expect(
        page.getByRole('heading', { name: 'Bem-vindo à CLAI' }),
      ).toBeVisible()
    else
      await expect(page.getByRole('alert')).toContainText(
        'Você não tem permissão',
      )
    await expect(page.locator('summary')).toHaveCount(0)
  })
}
