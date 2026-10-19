import { test, expect } from '@playwright/test'

test.skip(
  !process.env.CLAI_TEST_API,
  'Requer API de teste ligada a um PostgreSQL local, com API_TARGET configurado no Vite.',
)

test('cadastra pela interface, recupera após recarregar e protege os planos no backend real', async ({
  page,
  request,
}) => {
  const sufixo = `${Date.now()}${Math.floor(Math.random() * 10000)}`
  const cadastro = await page.request.post('/api/auth/cadastro', {
    data: {
      nome: 'Profissional de teste US04',
      email: `profissional-${sufixo}@example.com`,
      senha: 'teste-us04-123',
      perfil: 'PROFISSIONAL_CLAI',
    },
  })
  expect(cadastro.status()).toBe(201)
  const sessao = await cadastro.json()
  const headers = { 'X-CSRF-TOKEN': sessao.csrfToken }
  const criarAluno = async (letra: string) => {
    const resposta = await page.request.post('/api/alunos', {
      headers,
      data: {
        nome: `Estudante de teste ${letra}`,
        matricula: `${letra}${sufixo}`,
        curso: 'ADS',
        email: null,
      },
    })
    expect(resposta.status()).toBe(201)
    return resposta.json()
  }
  const primeiro = await criarAluno('A')
  const segundo = await criarAluno('B')
  await page.goto(`/alunos/${primeiro.idAluno}/planos/novo`)
  await expect(page.getByRole('heading', { name: primeiro.nome })).toBeVisible()
  await page.locator('#periodoLetivo').fill('2026.2')
  for (const nome of [
    'possuiComorbidade',
    'usaMedicacaoContinua',
    'frequentaServicosApoio',
    'apresentouDocumentos',
  ])
    await page.locator(`#${nome}`).selectOption('nao')
  const texto = 'Inclusão, ação e aprendizagem.\nSegunda linha preservada.'
  for (const nome of [
    'necessidadesEspecificas',
    'percursoEducacional',
    'principaisDemandas',
    'propostasIntervencao',
  ])
    await page.locator(`#${nome}`).fill(texto)
  await page.locator('#nomeCoordenador').fill('Coordenação de teste')
  await page.getByRole('button', { name: 'Salvar plano de ação' }).click()
  await expect(
    page.getByText('Plano de ação registrado com sucesso.', { exact: true }),
  ).toBeVisible()
  await page.reload()
  await page.locator('summary').click()
  await expect(page.locator('.plano-texto').first()).toHaveText(texto)
  const planos = await page.request.get(
    `/api/planos-acao/aluno/${primeiro.idAluno}`,
  )
  expect(planos.status()).toBe(200)
  expect((await planos.json())[0].necessidadesEspecificas).toBe(texto)
  await page.goto(`/alunos/${segundo.idAluno}/planos`)
  await expect(
    page.getByRole('heading', { name: 'Nenhum plano cadastrado' }),
  ).toBeVisible()
  expect(
    (await request.get(`/api/planos-acao/aluno/${primeiro.idAluno}`)).status(),
  ).toBe(401)
  const assistente = await page.request.post('/api/auth/cadastro', {
    data: {
      nome: 'Assistente de teste',
      email: `assistente-${sufixo}@example.com`,
      senha: 'teste-us04-123',
      perfil: 'ASSISTENTE',
    },
  })
  expect(assistente.status()).toBe(201)
  expect(
    (
      await page.request.get(`/api/planos-acao/aluno/${primeiro.idAluno}`)
    ).status(),
  ).toBe(403)
  await page.goto(`/alunos/${primeiro.idAluno}/planos`)
  await expect(
    page.getByRole('heading', { name: 'Acesso restrito' }),
  ).toBeVisible()
})
