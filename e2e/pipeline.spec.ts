import { test, expect, type Page } from '@playwright/test';

const API = process.env.API_URL ?? 'http://localhost:3001';

// Unique per test, so reruns against the same database never hit the duplicate-application check.
function candidate(label: string) {
  const id = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  return { name: `${label} ${id}`, email: `${label.toLowerCase().replace(/\s+/g, '.')}.${id}@example.com` };
}

// Job 1 is the seeded "Senior Frontend Engineer". Its fixed id avoids depending on list order, which other tests change.
const SEED_JOB = '/jobs/1';

async function applyToSeedJob(page: Page, name: string, email: string) {
  await page.goto(SEED_JOB);
  const form = page.getByTestId('apply-form');
  await expect(form).toBeVisible();
  await form.getByLabel('Full name').fill(name);
  await form.getByLabel('Email').fill(email);
  await form.getByRole('button', { name: 'Submit application' }).click();
}

function cardFor(page: Page, column: string, name: string) {
  return page.getByTestId(`pipeline-column-${column}`).getByTestId('application-card').filter({ hasText: name });
}

test('applying to a job puts the candidate into the pipeline', async ({ page }) => {
  const { name, email } = candidate('Ada Tester');
  await applyToSeedJob(page, name, email);
  await expect(page.getByTestId('apply-success')).toContainText(name);

  await page.goto('/employer');
  const card = cardFor(page, 'applied', name);
  await expect(card).toBeVisible();
  await expect(card).toContainText(email);
});

test('a second application with the same email shows the API conflict message', async ({ page }) => {
  const { name, email } = candidate('Repeat Applicant');
  await applyToSeedJob(page, name, email);
  await expect(page.getByTestId('apply-success')).toBeVisible();

  await applyToSeedJob(page, name, email);
  await expect(page.getByTestId('apply-error')).toContainText('has already applied to this job');
});

test('an invalid email is rejected by the API and the message is shown', async ({ page }) => {
  await page.goto(SEED_JOB);
  const form = page.getByTestId('apply-form');
  await form.getByLabel('Full name').fill('Bad Address');
  // "a@b" passes the browser's email check but not the API's, so the API message is what the user sees.
  await form.getByLabel('Email').fill('a@b');
  await form.getByRole('button', { name: 'Submit application' }).click();
  await expect(page.getByTestId('apply-error')).toContainText('candidateEmail must be a valid email address');
});

test('moving a card with the keyboard updates its column and keeps focus on the card', async ({ page }) => {
  const { name, email } = candidate('Move Tester');
  await applyToSeedJob(page, name, email);
  await expect(page.getByTestId('apply-success')).toBeVisible();

  await page.goto('/employer');
  const card = cardFor(page, 'applied', name);
  await expect(card).toBeVisible();

  const moveButton = card.getByRole('button', { name: 'Move to screening' });
  await moveButton.focus();
  await page.keyboard.press('Enter');

  await expect(cardFor(page, 'screening', name)).toBeVisible();
  await expect(cardFor(page, 'applied', name)).toHaveCount(0);
  await expect(cardFor(page, 'screening', name)).toBeFocused();
});

test('a move the API refuses shows its validation message on the card', async ({ page, request }) => {
  const { name, email } = candidate('Stale Board');
  await applyToSeedJob(page, name, email);
  await expect(page.getByTestId('apply-success')).toBeVisible();

  await page.goto('/employer');
  const card = cardFor(page, 'applied', name);
  await expect(card).toBeVisible();
  const id = await card.getAttribute('data-application-id');

  // Another user moves the candidate on while this board still shows them as applied.
  const res = await request.patch(`${API}/applications/${id}/stage`, { data: { stage: 'screening' } });
  expect(res.status()).toBe(200);

  await card.getByRole('button', { name: 'Move to screening' }).click();
  await expect(cardFor(page, 'screening', name).getByTestId('stage-error')).toContainText(
    'application is already in screening',
  );
  // The board reloads after a refused move, so the card now sits in the column the API reports.
  await expect(cardFor(page, 'screening', name)).toBeVisible();
});

test('rejecting a candidate moves them to the rejected column', async ({ page }) => {
  const { name, email } = candidate('Reject Tester');
  await applyToSeedJob(page, name, email);
  await expect(page.getByTestId('apply-success')).toBeVisible();

  await page.goto('/employer');
  const card = cardFor(page, 'applied', name);
  await expect(card).toBeVisible();
  await card.getByRole('button', { name: 'Reject' }).click();

  await expect(cardFor(page, 'rejected', name)).toBeVisible();
  await expect(cardFor(page, 'rejected', name).getByRole('button')).toHaveCount(0);
});
