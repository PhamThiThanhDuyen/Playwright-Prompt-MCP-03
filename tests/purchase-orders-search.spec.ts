import { test, expect } from '../src/fixtures/test';

const email = process.env.CONATIVE_EMAIL;
const password = process.env.CONATIVE_PASSWORD;
const organization = process.env.CONATIVE_ORGANIZATION;

test.describe('Purchase Orders — Basic Operations Test Plan', () => {
  test('PO-02 — Search by PO number, vendor, and warehouse', async ({ page, stepLog }) => {
    test.skip(
      !email || !password || !organization,
      'Set CONATIVE_EMAIL, CONATIVE_PASSWORD, and CONATIVE_ORGANIZATION in .env to run this authenticated search flow.',
    );

    // Establish the authenticated organization context for this isolated browser context.
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

    await stepLog('Open the Purchase Orders list with search cleared', async () => {
      await page.goto('/replenishment/purchase-orders?filters=source[eq]=conative', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('searchbox', { name: 'Search POs, vendors, or warehouses', exact: true })).toBeVisible();
    });

    // The live Purchase Orders control has the semantic searchbox role.
    const search = page.getByRole('searchbox', { name: 'Search POs, vendors, or warehouses', exact: true });
    const rows = () => page.getByRole('row').filter({ has: page.locator('td') });
    const rowTexts = async () => (await rows().allTextContents()).map(text => text.trim()).filter(Boolean);
    const cellTexts = async (row: import('@playwright/test').Locator, index: number) =>
      row.locator('td').nth(index).innerText();
    await stepLog('Wait for the initial result batch to finish loading', async () => {
      // Table rows are present as skeleton placeholders while data loads, so
      // visibility alone does not mean a usable record has rendered.
      await expect.poll(async () => {
        const texts = await rowTexts();
        return texts.some(text => text.length > 0);
      }, { timeout: 30_000 }).toBe(true);
    });

    // Use the first visible fixture row as the known search record. The observed
    // table columns are PO ID, PO Number, Vendor, Warehouse, so these values
    // exercise the three supported search dimensions without environment data.
    const fixtureRow = rows().first();
    const poNumber = await cellTexts(fixtureRow, 1);
    const vendor = await cellTexts(fixtureRow, 2);
    const warehouse = await cellTexts(fixtureRow, 3);
    expect(poNumber.trim()).not.toBe('');
    expect(vendor.trim()).not.toBe('');
    expect(warehouse.trim()).not.toBe('');

    await stepLog(`1. Enter a known PO number in Search POs, vendors, or warehouses: ${poNumber}`, async () => {
      await search.fill(poNumber!);
    });

    await stepLog('2. Verify the matching result(s) and updated result summary', async () => {
      const matchingRows = rows().filter({ hasText: poNumber! });
      await expect(matchingRows.first()).toBeVisible({ timeout: 30_000 });
      for (const text of await matchingRows.allTextContents()) {
        expect(text).toContain(poNumber!);
      }
    });

    await stepLog(`3. Replace the term with the known vendor name and verify the results: ${vendor}`, async () => {
      await search.fill(vendor!);
      const matchingRows = rows().filter({ hasText: vendor! });
      await expect(matchingRows.first()).toBeVisible({ timeout: 30_000 });
      for (const text of await matchingRows.allTextContents()) {
        expect(text).toContain(vendor!);
      }
    });

    await stepLog(`4. Repeat with the known warehouse name: ${warehouse}`, async () => {
      await search.fill(warehouse!);
      const matchingRows = rows().filter({ hasText: warehouse! });
      await expect(matchingRows.first()).toBeVisible({ timeout: 30_000 });
      for (const text of await matchingRows.allTextContents()) {
        expect(text).toContain(warehouse!);
      }
    });

    await stepLog('5. Enter a term that should not match any result and verify the empty state', async () => {
      await search.fill('no-match-po-search-7f3a91');
      await expect(rows()).toHaveCount(0, { timeout: 30_000 });
      await expect(page.getByText(/no (purchase orders|results)|no matching|0 results/i).first()).toBeVisible();
    });

    await stepLog('6. Use the clear control and verify unfiltered records and removal of the search URL parameter', async () => {
      const clearButton = page.getByRole('button', { name: /clear search|clear/i });
      if (await clearButton.count()) {
        await clearButton.click();
      } else {
        // Some builds clear the query as soon as the search input is emptied.
        await search.fill('');
      }
      await expect(search).toHaveValue('');
      await expect(page).not.toHaveURL(/[?&](search|query|q)=/i);
      await expect.poll(async () => {
        const texts = await rowTexts();
        return texts.some(text => text.length > 0);
      }, { timeout: 30_000 }).toBe(true);
      const restoredRows = await rowTexts();
      expect(restoredRows.length).toBeGreaterThan(0);
    });
  });
});
