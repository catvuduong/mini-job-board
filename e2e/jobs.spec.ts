import { test, expect } from '@playwright/test';

test('the jobs page loads a full first page of results', async ({ page }) => {
  await page.goto('/');
  const cards = page.getByTestId('job-card');
  await expect(cards).toHaveCount(12);
  await expect(page.getByTestId('result-count')).toHaveText(/Showing 12 of \d+ jobs/);
  await expect(page.getByTestId('skill-filter-TypeScript')).toBeVisible();
});

test('filtering by a skill keeps only jobs that require it', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('job-card').first()).toBeVisible();

  await page.getByTestId('skill-filter-TypeScript').check();

  const cards = page.getByTestId('job-card');
  await expect(cards).toHaveCount(4);
  await expect(page.getByTestId('result-count')).toHaveText('Showing 4 of 4 jobs');
  for (const card of await cards.all()) {
    await expect(card.getByRole('list', { name: 'Skills' })).toContainText('TypeScript');
  }
});

test('combining filters can produce an empty state with a way out', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('job-card').first()).toBeVisible();

  await page.getByTestId('search-input').fill('no-such-role-anywhere');
  await expect(page.getByText('No jobs match these filters.')).toBeVisible();

  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.getByTestId('job-card').first()).toBeVisible();
  await expect(page.getByTestId('search-input')).toHaveValue('');
});

test('the remote filter keeps only remote jobs', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('job-card').first()).toBeVisible();

  // The list keeps showing the unfiltered results until the filtered response arrives, so wait for it.
  const filtered = page.waitForResponse((res) => res.url().includes('remote=true') && res.ok());
  await page.getByTestId('remote-filter').check();
  await filtered;

  // The six remote seed jobs fit on one page, so every visible card should carry the Remote badge.
  const cards = page.getByTestId('job-card');
  const remoteCards = cards.filter({ has: page.getByText('Remote', { exact: true }) });
  await expect
    .poll(async () => (await cards.count()) > 0 && (await cards.count()) === (await remoteCards.count()))
    .toBe(true);
});
