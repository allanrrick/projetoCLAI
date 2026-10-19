import { test, expect } from '@playwright/test'

test('planos em demonstração usam memória e informam que os dados são fictícios', async ({
  page,
}) => {
  await page.goto('/alunos/1/planos/novo')
  await expect(page.locator('.demo-banner')).toContainText('dados fictícios')
  await page.locator('#periodoLetivo').fill('2026.2')
  for (const nome of [
    'possuiComorbidade',
    'usaMedicacaoContinua',
    'frequentaServicosApoio',
    'apresentouDocumentos',
  ])
    await page.locator(`#${nome}`).selectOption('nao')
  for (const nome of [
    'necessidadesEspecificas',
    'percursoEducacional',
    'principaisDemandas',
    'propostasIntervencao',
  ])
    await page.locator(`#${nome}`).fill('Plano fictício de demonstração.')
  await page.locator('#nomeCoordenador').fill('Coordenação de demonstração')
  await page.getByRole('button', { name: 'Salvar plano de ação' }).click()
  await page.locator('summary').click()
  await expect(page.locator('.plano-texto').first()).toHaveText(
    'Plano fictício de demonstração.',
  )
  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'Nenhum plano cadastrado' }),
  ).toBeVisible()
})

test('lista alunos e combina busca, curso e situação', async ({ page }) => {
  await page.goto('/alunos')
  await expect(
    page.getByRole('heading', { name: 'Alunos', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByText('Demonstração com dados fictícios.', { exact: false }),
  ).toBeVisible()
  await page
    .getByRole('textbox', { name: 'Buscar alunos' })
    .fill('ana oliveira')
  await expect(page.locator('tbody tr')).toHaveCount(1)
  await page
    .getByRole('combobox', { name: 'Filtrar por situação' })
    .selectOption('inativo')
  await expect(page.getByText('Nenhum aluno encontrado')).toBeVisible()
  await page.getByRole('button', { name: 'Limpar', exact: true }).click()
  await page
    .getByRole('combobox', { name: 'Filtrar por curso' })
    .selectOption('Engenharia Civil')
  await expect(page.locator('tbody tr')).toHaveCount(1)
  await expect(page.locator('tbody')).toContainText('Bruno Santos')
})

test('cadastra aluno, mostra sucesso e detecta matrícula duplicada', async ({
  page,
}) => {
  await page.goto('/alunos/novo')
  await page.getByLabel('Nome completo *').fill('Estudante de teste')
  await page.getByLabel('Matrícula *').fill('TESTE001')
  await page.getByLabel('Curso *').fill('Curso de teste')
  await page.getByRole('button', { name: 'Cadastrar aluno' }).click()
  await expect(
    page
      .getByRole('status')
      .filter({ hasText: 'Aluno cadastrado com sucesso.' }),
  ).toBeVisible()
  await expect(page.locator('tbody')).toContainText('Estudante de teste')
  await page.getByRole('link', { name: 'Cadastrar aluno' }).click()
  await page.getByLabel('Nome completo *').fill('Outro estudante')
  await page.getByLabel('Matrícula *').fill('TESTE001')
  await page.getByLabel('Curso *').fill('Outro curso')
  await page.getByRole('button', { name: 'Cadastrar aluno' }).click()
  await expect(page.getByRole('alert')).toContainText('Já existe um aluno')
  await expect(page.getByLabel('Nome completo *')).toHaveValue(
    'Outro estudante',
  )
})

test('rejeita campos obrigatórios vazios ou compostos apenas por espaços', async ({
  page,
}) => {
  await page.goto('/alunos/novo')
  await page.getByRole('button', { name: 'Cadastrar aluno' }).click()
  await expect(page).toHaveURL(/alunos\/novo/)
  await page.getByLabel('Nome completo *').fill('   ')
  await page.getByLabel('Matrícula *').fill('A1')
  await page.getByLabel('Curso *').fill('Curso')
  await page.getByRole('button', { name: 'Cadastrar aluno' }).click()
  await expect(page.getByRole('alert')).toContainText('apenas espaços')
})

test('registra atendimento com anexo no aluno correto e consulta o histórico', async ({
  page,
}) => {
  await page.goto('/atendimentos/novo?aluno=3')
  await expect(page.getByLabel('Aluno *')).toHaveValue('3')
  await page.getByLabel('Data *').fill('2026-10-15')
  await page.getByLabel('Hora *').fill('11:30')
  await page
    .getByLabel('Observações *')
    .fill('Orientação sobre organização dos estudos.')
  await page.getByLabel('Documentos', { exact: true }).setInputFiles({
    name: 'orientacoes.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4 exemplo'),
  })
  await expect(page.getByText('orientacoes.pdf')).toBeVisible()
  await page.getByRole('button', { name: 'Registrar atendimento' }).click()
  await expect(page).toHaveURL(/historico\?aluno=3/)
  await expect(
    page
      .getByRole('status')
      .filter({ hasText: 'Atendimento registrado com sucesso.' }),
  ).toBeVisible()
  await expect(page.locator('.timeline')).toContainText(
    'Orientação sobre organização dos estudos.',
  )
  await expect(
    page.getByRole('link', { name: 'orientacoes.pdf' }),
  ).toHaveAttribute('href', /^blob:/)
  await page.getByLabel('Selecione um aluno').selectOption('1')
  await expect(page.locator('.timeline')).not.toContainText(
    'Orientação sobre organização dos estudos.',
  )
})

test('ordena cronologicamente e combina busca e período no histórico', async ({
  page,
}) => {
  await page.goto('/historico?aluno=1')
  await expect(page.locator('.timeline article')).toHaveCount(2)
  await expect(page.locator('.timeline article').first()).toContainText(
    '14/10/2026',
  )
  await page.getByLabel('Ordenação').selectOption('asc')
  await expect(page.locator('.timeline article').first()).toContainText(
    '10/10/2026',
  )
  await page.getByLabel('Buscar no histórico').fill('orientacao')
  await expect(page.locator('.timeline article')).toHaveCount(1)
  await page.getByLabel('De', { exact: true }).fill('2026-10-15')
  await expect(page.getByText('Nenhum atendimento encontrado')).toBeVisible()
  await page.getByLabel('Até', { exact: true }).fill('2026-10-01')
  await expect(page.getByRole('alert')).toContainText('data final')
  await page.getByRole('button', { name: 'Limpar filtros' }).click()
  await expect(page.locator('.timeline article')).toHaveCount(2)
  await page.getByLabel('Selecione um aluno').selectOption('3')
  await expect(
    page.getByText('Ainda não há atendimentos para este aluno'),
  ).toBeVisible()
})

test('rejeita anexos incompatíveis e permite remover um documento', async ({
  page,
}) => {
  await page.goto('/atendimentos/novo')
  await page.getByLabel('Documentos', { exact: true }).setInputFiles({
    name: 'script.html',
    mimeType: 'text/html',
    buffer: Buffer.from('<p>exemplo</p>'),
  })
  await expect(page.getByRole('alert')).toContainText(
    'PDF ou imagens PNG e JPEG',
  )
  await page.getByLabel('Documentos', { exact: true }).setInputFiles({
    name: 'arquivo.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4'),
  })
  await page.getByRole('button', { name: 'Remover arquivo.pdf' }).click()
  await expect(page.locator('.file-list')).toHaveCount(0)
})

test('navegação e formulário funcionam em celular sem transbordar a página', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/alunos')
  await expect(
    page.getByRole('heading', { name: 'Alunos', exact: true }),
  ).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy()
  await page.getByRole('button', { name: 'Abrir menu' }).click()
  await page
    .getByRole('link', { name: 'Novo atendimento', exact: true })
    .click()
  await expect(page.getByLabel('Observações *')).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy()
  await page.screenshot({
    path: testInfo.outputPath('mobile.png'),
    fullPage: true,
  })
})
