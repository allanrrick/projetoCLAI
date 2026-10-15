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
  await page.route('**/api/alunos/1/atendimentos', (route) => {
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
  await page.route('**/api/alunos/1/atendimentos', (route) =>
    route.fulfill({ status: 403, json: {} }),
  )
  await page.goto('/historico?aluno=1')
  await expect(page.getByRole('alert')).toContainText('Você não tem permissão')
  await expect(page.locator('.timeline')).toHaveCount(0)
  await page.route('**/api/alunos/1/atendimentos', (route) =>
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
  await page.route('**/api/alunos/1/atendimentos', (route) =>
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

test('envia atendimento multipart com aluno, data, hora, observações e documento', async ({
  page,
}) => {
  await session(page)
  let body = ''
  let contentType = ''
  await page.route('**/api/atendimentos', (route) => {
    body = route.request().postData() || ''
    contentType = route.request().headers()['content-type']
    return route.fulfill({ status: 201, json: { idAtendimento: 1 } })
  })
  await page.route('**/api/alunos/1/atendimentos', (route) =>
    route.fulfill({ json: [] }),
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
  expect(body).toContain('name="atendimento"')
  expect(body).toContain('"idAluno":1')
  expect(body).toContain('"data":"2026-10-15"')
  expect(body).toContain('"hora":"09:30"')
  expect(body).toContain('Registro de teste')
  expect(body).toContain('name="documentos"; filename="teste.pdf"')
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
  await page.route('**/api/alunos/1/atendimentos', (route) =>
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
            { id: '3', nome: 'seguro.pdf', url: '/api/documentos/3' },
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
    'http://127.0.0.1:5174/api/documentos/3',
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
