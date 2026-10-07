import { test as base, expect } from '@playwright/test';

type Fixtures = {
  stepLog: (description: string, action: () => Promise<void>) => Promise<void>;
};

export const test = base.extend<Fixtures>({
  stepLog: async ({ page }, use, testInfo) => {
    const log = async (description: string, action: () => Promise<void>) => {
      const started = Date.now();
      console.info(`[${testInfo.project.name}] ${description}`);
      try {
        await test.step(description, action);
        console.info(`[${testInfo.project.name}] ✓ ${description} (${Date.now() - started}ms)`);
      } catch (error) {
        console.error(`[${testInfo.project.name}] ✗ ${description} at ${page.url()}`);
        console.error(error);
        throw new Error(`Step failed: ${description}\nPage: ${page.url()}\n${String(error)}`, { cause: error });
      }
    };
    await use(log);
  },
});

export { expect };
