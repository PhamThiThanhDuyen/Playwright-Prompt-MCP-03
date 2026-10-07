import { test, expect } from '../src/fixtures/test';

const email = process.env.CONATIVE_EMAIL;
const password = process.env.CONATIVE_PASSWORD;
const organization = process.env.CONATIVE_ORGANIZATION;
const sku = 'N6435GWTCZ18';
const viewName = 'CBI TEST DP 02';

test('filter product variants, save a view, and delete it', async ({ page, stepLog }) => {
  test.skip(
    !email || !password || !organization,
    'Set CONATIVE_EMAIL, CONATIVE_PASSWORD, and CONATIVE_ORGANIZATION in .env to run this authenticated flow.',
  );

  // Playwright tests use isolated browser contexts, so establish the prompt's
  // successful-login precondition in this test instead of assuming another spec ran first.
  await stepLog('Sign in and open the configured organization', async () => {
    await page.goto('/sign-in', { waitUntil: 'domcontentloaded' });
    await page.getByPlaceholder('Yourmail@gmail.com', { exact: true }).fill(email!);
    await page.getByPlaceholder('••••••••••••', { exact: true }).fill(password!);
    const terms = page.getByRole('checkbox');
    await expect(terms).toHaveCount(1);
    if (!(await terms.isChecked())) await terms.check();
    await page.getByRole('button', { name: /sign in/i }).click();
    const org = page.getByText(organization!, { exact: true });
    await expect(org).toBeVisible({ timeout: 30_000 });
    await org.click();
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible({ timeout: 30_000 });
  });

  await stepLog("Hover over the 'Product Analytics' menu", async () => {
    await page.getByRole('button', { name: 'Product Analytics', exact: true }).hover();
  });

  await stepLog("Open the 'Product Performance' submenu", async () => {
    await page.getByText('Product Performance', { exact: true }).click();
    await expect(page.getByText('Product Performance', { exact: true }).first()).toBeVisible();
  });

  await stepLog("Open the 'Products' dropdown", async () => {
    await page.getByText('Products', { exact: true }).click();
  });

  await stepLog("Select 'Variants'", async () => {
    await page.getByText('Variants', { exact: true }).click();
  });

  await stepLog(`Search for SKU '${sku}'`, async () => {
    const search = page.getByRole('textbox', { name: 'Search for Title, SKU, Barcode', exact: true });
    await search.click();
    await page.keyboard.type(sku);
    await page.keyboard.press('Enter');
  });

  await stepLog(`Verify matching variants contain SKU '${sku}'`, async () => {
    const matchingRows = page.getByRole('row').filter({ hasText: sku });
    await expect(matchingRows.first()).toBeVisible({ timeout: 30_000 });
    expect(await matchingRows.count(), `Expected at least one variant row containing SKU ${sku}`).toBeGreaterThan(0);
  });

  await stepLog("Verify 'Save as new view' is available", async () => {
    await expect(page.getByText('Save as new view', { exact: true })).toBeVisible();
  });

  await stepLog("Open the 'Save as new view' dialog", async () => {
    await page.getByText('Save as new view', { exact: true }).click();
    await expect(page.getByText('Name new view', { exact: true })).toBeVisible();
  });

  await stepLog(`Name the new view '${viewName}' and save it`, async () => {
    const dialog = page.getByRole('dialog');
    const nameField = dialog.getByRole('textbox').first();
    await nameField.fill(viewName);
    await dialog.getByRole('button', { name: 'Save', exact: true }).click();
  });

  await stepLog("Verify the 'Saved new view.' confirmation", async () => {
    await expect(page.getByText('Saved new view.', { exact: true })).toBeVisible({ timeout: 15_000 });
  });

  await stepLog(`Verify '${viewName}' is the selected view`, async () => {
    const viewButton = page.getByRole('button', { name: viewName, exact: true });
    await expect(viewButton).toBeVisible();
    await expect(page).toHaveURL(/view=custom/);
  });

  await stepLog(`Open the actions for '${viewName}'`, async () => {
    const viewButton = page.getByRole('button', { name: viewName, exact: true });
    const bounds = await viewButton.boundingBox();
    if (!bounds) throw new Error(`The '${viewName}' view button is not visible.`);
    // The kebab icon is inside the view button and has no accessible name of its own.
    await viewButton.click({ position: { x: bounds.width - 12, y: bounds.height / 2 } });
  });

  await stepLog("Choose 'Delete view'", async () => {
    await page.getByText('Delete view', { exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  await stepLog(`Confirm deletion of '${viewName}'`, async () => {
    await expect(page.getByRole('dialog')).toContainText(`Are you sure you want to delete "${viewName}" view?`);
    await page.getByRole('dialog').getByRole('button', { name: 'Delete', exact: true }).click();
  });

  await stepLog(`Verify '${viewName}' was deleted`, async () => {
    await expect(page.getByText(`Successfully deleted ${viewName}`, { exact: true })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: viewName, exact: true })).toHaveCount(0);
  });
});
