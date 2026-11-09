import { test, expect } from '@playwright/test'

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
  await page
    .getByLabel('Curso *')
    .selectOption('Análise e Desenvolvimento de Sistemas')
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
  await page.getByLabel('Curso *').selectOption('Engenharia Civil')
  await page.getByRole('button', { name: 'Cadastrar aluno' }).click()
  await expect(page.getByRole('alert')).toContainText('Já existe um aluno')
  await expect(page.getByLabel('Nome completo *')).toHaveValue(
    'Outro estudante',
  )
  await expect(page.getByLabel('Curso *')).toHaveValue('Engenharia Civil')
})

test('rejeita campos obrigatórios vazios, sem curso selecionado ou compostos apenas por espaços', async ({
  page,
}) => {
  await page.goto('/alunos/novo')
  await page.getByRole('button', { name: 'Cadastrar aluno' }).click()
  await expect(page).toHaveURL(/alunos\/novo/)
  await page.getByLabel('Nome completo *').fill('Estudante sem curso')
  await page.getByLabel('Matrícula *').fill('A1')
  await page.getByRole('button', { name: 'Cadastrar aluno' }).click()
  await expect(page).toHaveURL(/alunos\/novo/)
  await page.getByLabel('Nome completo *').fill('   ')
  await page.getByLabel('Matrícula *').fill('A1')
  await page
    .getByLabel('Curso *')
    .selectOption('Análise e Desenvolvimento de Sistemas')
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
  await expect(
    page.getByText('Um espaço de acolhimento e confiança'),
  ).toHaveCount(0)
  await expect(page.getByText('Cada trajetória importa.')).toHaveCount(0)
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
  await expect(page.getByText('CONTINUIDADE NO CUIDADO')).toHaveCount(0)
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

test('preenche e registra relatório de acompanhamento individualizado', async ({
  page,
}) => {
  await page.goto('/relatorios')
  await expect(
    page.getByRole('heading', {
      name: 'Relatório de acompanhamento',
      exact: true,
    }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Salvar relatório' }).click()
  await expect(page.getByRole('alert')).toContainText(
    'Preencha aluno, período letivo',
  )
  await page.getByLabel('Aluno *').selectOption('1')
  await page.getByLabel('Período letivo *').fill('2026.2')
  await page.getByLabel('Componente curricular *').fill('Banco de Dados I')
  await page.getByLabel('Docente *').fill('Prof. Ricardo Alves')
  await page.getByLabel('Interage bem com colegas e docentes').check()
  await page
    .getByLabel('Habilidade 1', { exact: true })
    .fill('Modelagem relacional')
  await page.getByLabel('Nível de aprendizado 1').selectOption('OTIMO')
  await page
    .getByLabel('Parecer conclusivo *')
    .fill('Excelente progresso no semestre.')
  await page.getByRole('button', { name: 'Salvar relatório' }).click()
  await expect(
    page
      .getByRole('status')
      .filter({ hasText: 'Relatório de acompanhamento registrado com sucesso.' }),
  ).toBeVisible()
  await expect(page.locator('.timeline')).toContainText('Banco de Dados I')
  await expect(page.locator('.timeline')).toContainText(
    'Excelente progresso no semestre.',
  )
})

test('valida campos obrigatórios e registra o PEI do estudante', async ({
  page,
}) => {
  await page.goto('/pei')
  await expect(
    page.getByRole('heading', {
      name: 'Plano Educacional Individualizado (PEI)',
      exact: true,
    }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Registrar PEI' }).click()
  await expect(page.getByRole('alert')).toContainText(
    'Preencha todos os campos obrigatórios do PEI',
  )
  await page.getByLabel('Aluno *', { exact: true }).selectOption('DEMO002')
  await page.getByLabel('Período letivo *').fill('2026.2')
  await page
    .getByLabel('Histórico do aluno *')
    .fill('Acompanhamento iniciado no ingresso.')
  await page
    .getByLabel('Necessidades educacionais específicas *')
    .fill('Intérprete de Libras e material visual.')
  await page
    .getByLabel('Afinidade 1', { exact: true })
    .fill('Cálculo aplicado e projetos estruturais')
  await page
    .getByLabel('Dificuldades identificadas *')
    .fill('Aulas expositivas sem apoio visual.')
  await page
    .getByLabel('Propostas de adaptação *')
    .fill('Roteiros visuais antecipados e avaliação adaptada.')
  await page.getByRole('button', { name: 'Registrar PEI' }).click()
  await expect(
    page
      .getByRole('status')
      .filter({
        hasText:
          'Plano Educacional Individualizado (PEI) registrado com sucesso.',
      }),
  ).toBeVisible()
  await expect(page.locator('.timeline')).toContainText(
    'Intérprete de Libras e material visual.',
  )
  await expect(page.locator('.timeline')).toContainText(
    'Cálculo aplicado e projetos estruturais',
  )
})

test('valida campos obrigatórios do PEA e verifica vínculo ao aluno e à disciplina', async ({
  page,
}) => {
  await page.goto('/pea')
  await expect(
    page.getByRole('heading', {
      name: 'Plano de Ensino Adaptado (PEA)',
      exact: true,
    }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Registrar PEA' }).click()
  await expect(page.getByRole('alert')).toContainText(
    'Preencha todos os campos obrigatórios do PEA',
  )
  await page.getByLabel('Aluno *', { exact: true }).selectOption('DEMO001')
  await page.getByLabel('Período letivo *').fill('2026.2')
  await page.getByLabel('Disciplina *').fill('Engenharia de Software')
  await page.getByLabel('Docente *').fill('Profa. Helena Souza')
  await page
    .getByLabel('Objetivos adaptados *')
    .fill('Compreender requisitos e modelagem com apoio visual.')
  await page
    .getByLabel('Conteúdos programáticos *')
    .fill('Engenharia de requisitos, casos de uso e testes.')
  await page
    .getByLabel('Estratégias de ensino *')
    .fill('Mapas mentais e entregas iterativas orientadas.')
  await page
    .getByLabel('Avaliação adaptada *')
    .fill('Projeto prático incremental com feedback semanal.')
  await page.getByRole('button', { name: 'Registrar PEA' }).click()
  await expect(
    page
      .getByRole('status')
      .filter({
        hasText: 'Plano de Ensino Adaptado (PEA) registrado com sucesso.',
      }),
  ).toBeVisible()
  await expect(page.locator('.timeline > li')).toHaveCount(2)
  await page
    .getByRole('textbox', { name: 'Filtrar PEA por disciplina' })
    .fill('Engenharia de Software')
  await expect(page.locator('.timeline > li')).toHaveCount(1)
  await expect(page.locator('.timeline')).toContainText(
    'Engenharia de Software',
  )
  await page.getByLabel('Aluno *', { exact: true }).selectOption('DEMO002')
  await expect(page.getByText('Nenhum PEA encontrado')).toBeVisible()
})

test('acessa planos de ação pela lista de alunos, valida condicionais e separa por aluno', async ({
  page,
}) => {
  await page.goto('/alunos')
  await page
    .getByRole('link', { name: 'Planos de ação de Bruno Santos (exemplo)' })
    .click()
  await expect(page).toHaveURL(/planos-acao\?aluno=2/)
  await expect(
    page.getByRole('heading', { name: 'Bruno Santos (exemplo)' }),
  ).toBeVisible()
  await expect(
    page.getByText('Ainda não há planos de ação para este aluno'),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Registrar plano de ação' }).click()
  await expect(page.getByRole('alert')).toContainText('seções obrigatórias')

  await page.getByLabel('O aluno possui comorbidades?').check()
  await page
    .getByLabel('Necessidades específicas *')
    .fill('Apoio pedagógico e material adaptado.')
  await page
    .getByLabel(
      'Avanços, dificuldades e potencialidades no percurso educacional *',
    )
    .fill('Bom desempenho em disciplinas de cálculo.')
  await page
    .getByLabel('Principais demandas *')
    .fill('Adaptação de avaliações escritas.')
  await page
    .getByLabel('Propostas iniciais de intervenção *')
    .fill('Acompanhamento quinzenal na CLAI.')
  await page.getByRole('button', { name: 'Registrar plano de ação' }).click()
  await expect(page.getByRole('alert')).toContainText(
    'Descreva as comorbidades',
  )

  await page
    .getByLabel('Descrição das comorbidades *')
    .fill('Dislexia com recomendação de tempo adicional.')
  await page.getByRole('button', { name: 'Registrar plano de ação' }).click()
  await expect(
    page
      .getByRole('status')
      .filter({ hasText: 'Plano de ação registrado com sucesso.' }),
  ).toBeVisible()
  await expect(page.locator('.timeline')).toContainText(
    'Dislexia com recomendação de tempo adicional.',
  )

  await page.getByLabel('Selecione um aluno').selectOption('3')
  await expect(
    page.getByText('Ainda não há planos de ação para este aluno'),
  ).toBeVisible()
})
