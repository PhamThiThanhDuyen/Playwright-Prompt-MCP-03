import { test, expect } from '../src/fixtures/test';
import { resilientLocator } from '../src/utils/locators';

const email = process.env.CONATIVE_EMAIL;
const password = process.env.CONATIVE_PASSWORD;
const organization = process.env.CONATIVE_ORGANIZATION;

test('sign in and open the organization dashboard', async ({ page, stepLog }) => {
  test.skip(!email || !password || !organization, 'Set CONATIVE_EMAIL, CONATIVE_PASSWORD, and CONATIVE_ORGANIZATION in .env to run this authenticated flow.');

  await stepLog('Open the sign-in page', async () => {
    await page.goto('/sign-in', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/sign-in/);
  });

  await stepLog('Enter the account email', async () => {
    // The live form renders "Email" as nearby text rather than an associated label.
    await page.getByPlaceholder('Yourmail@gmail.com', { exact: true }).fill(email!);
  });
  await stepLog('Enter the account password', async () => {
    // The password field has a masked placeholder and no associated label.
    await page.getByPlaceholder('••••••••••••', { exact: true }).fill(password!);
  });
  await stepLog('Accept the Terms of Service', async () => {
    // The terms link is separate from the unlabeled checkbox in the live form.
    const terms = page.getByRole('checkbox');
    await expect(terms).toHaveCount(1);
    if (!(await terms.isChecked())) await terms.check();
  });
  await stepLog('Submit the sign-in form', async () => {
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForLoadState('domcontentloaded').catch(() => undefined);
  });
  await stepLog('Choose the requested organization', async () => {
    // The organization chooser renders each option as clickable generic content,
    // not as a semantic button or link (see the captured accessibility snapshot).
    const org = page.getByText(organization!, { exact: true });
    await expect(org).toBeVisible({ timeout: 30_000 });
    await expect(org).toHaveCount(1);
    await org.click();
  });
  await stepLog('Verify the dashboard is displayed', async () => {
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible({ timeout: 30_000 });
  });
  await stepLog("Verify the successful sign-in message is displayed", async () => {
    await expect(
      page.getByText('Sign in is successfully, Welcome to Conative!', { exact: true }),
    ).toBeVisible({ timeout: 15_000 });
  });
});
