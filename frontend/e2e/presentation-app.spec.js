import { expect, test } from '@playwright/test';
import path from 'node:path';

test.beforeEach(async ({ request }) => {
  await deleteAll(request, '/api/presentations');
  await deleteAll(request, '/api/templates');
});

test('creates a presentation and opens it after reload', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Презентации' })).toBeVisible();
  await page.getByRole('button', { name: 'Создать пустую презентацию' }).click();

  await expect(page.getByRole('heading', { name: 'Редактор презентации' })).toBeVisible();
  await expect(page.getByLabel('Название презентации')).toHaveValue('Презентация 1');

  await page.getByRole('button', { name: 'К списку' }).click();
  await expect(page.getByRole('heading', { name: 'Презентации' })).toBeVisible();
  await expect(presentationItem(page, 'Презентация 1')).toBeVisible();

  await page.reload();
  await expect(presentationItem(page, 'Презентация 1')).toBeVisible();

  await presentationItem(page, 'Презентация 1')
    .getByRole('button', { name: 'Открыть' })
    .click();

  await expect(page.getByRole('heading', { name: 'Редактор презентации' })).toBeVisible();
  await expect(page.getByLabel('Название презентации')).toHaveValue('Презентация 1');
});

test('edits a presentation title and slide text, then persists them', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Создать пустую презентацию' }).click();

  await page.getByLabel('Название презентации').fill('Acceptance edited presentation');
  await page.getByLabel('Текст на слайде:').fill('First slide text');

  await page.getByRole('button', { name: 'Добавить слайд' }).click();
  await expect(page.getByText('Слайд 2 из 2')).toBeVisible();
  await page.getByLabel('Текст на слайде:').fill('Second slide text');

  await page.getByRole('button', { name: 'К списку' }).click();
  await expect(presentationItem(page, 'Acceptance edited presentation')).toBeVisible();

  await page.reload();
  await presentationItem(page, 'Acceptance edited presentation')
    .getByRole('button', { name: 'Открыть' })
    .click();

  await expect(page.getByLabel('Название презентации')).toHaveValue('Acceptance edited presentation');
  await expect(page.getByLabel('Текст на слайде:')).toHaveValue('First slide text');

  await page.getByRole('button', { name: 'Вперед' }).click();
  await expect(page.getByLabel('Текст на слайде:')).toHaveValue('Second slide text');
});

test('uploads a template and creates a presentation from it', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Шаблоны' }).click();

  await expect(page.getByRole('heading', { name: 'Шаблоны' })).toBeVisible();
  await page.getByLabel('Добавить шаблон').setInputFiles(path.resolve('e2e/fixtures/03.potx'));

  await expect(templateItem(page, '03')).toBeVisible();
  await templateItem(page, '03')
    .getByRole('button', { name: 'Открыть' })
    .click();

  await expect(page.getByRole('heading', { name: 'Шаблон' })).toBeVisible();
  await expect(page.getByLabel('Название шаблона')).toHaveValue('03');
  await expect(page.getByAltText('Превью шаблона')).toBeVisible();

  await page.getByRole('button', { name: 'Создать презентацию' }).click();

  await expect(page.getByRole('heading', { name: 'Редактор презентации' })).toBeVisible();
  await expect(page.getByLabel('Название презентации')).toHaveValue('Презентация 1');
  await expect(page.getByText(/Слайд 1 из \d+/)).toBeVisible();
});

async function deleteAll(request, collectionUrl) {
  const response = await request.get(collectionUrl);
  if (!response.ok()) {
    return;
  }

  for (const item of await response.json()) {
    await request.delete(`${collectionUrl}/${item.id}`);
  }
}

function presentationItem(page, title) {
  return page.locator('.presentation-item').filter({ has: page.getByRole('heading', { name: title }) });
}

function templateItem(page, title) {
  return page.locator('.presentation-item').filter({ has: page.getByRole('heading', { name: title }) });
}
