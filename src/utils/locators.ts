import type { Locator, Page } from '@playwright/test';

/** Prefer accessible role/name, then label, placeholder, and finally a test id. */
export function resilientLocator(
  page: Page,
  options: { role: Parameters<Page['getByRole']>[0]; name: string; label?: string; placeholder?: string; testId?: string },
): Locator {
  const candidates: Locator[] = [page.getByRole(options.role, { name: options.name, exact: true })];
  if (options.label) candidates.push(page.getByLabel(options.label, { exact: true }));
  if (options.placeholder) candidates.push(page.getByPlaceholder(options.placeholder, { exact: true }));
  if (options.testId) candidates.push(page.getByTestId(options.testId));

  // Use the first locator that uniquely matches. Ambiguous matches intentionally fail with detail.
  return new Proxy(candidates[0], {
    get(target, property, receiver) {
      if (property === 'waitFor') {
        return async (params?: Parameters<Locator['waitFor']>[0]) => {
          for (const candidate of candidates) {
            try {
              await candidate.waitFor({ ...params, state: 'visible', timeout: 1_500 });
              if (await candidate.count() === 1) return;
            } catch { /* try the next semantic locator */ }
          }
          throw new Error(`No unique visible ${options.role} named "${options.name}" was found using accessible name, label, placeholder, or test id.`);
        };
      }
      if (['click', 'fill', 'check', 'uncheck', 'isVisible', 'count'].includes(String(property))) {
        return async (...args: unknown[]) => {
          for (const candidate of candidates) {
            try {
              if (await candidate.count() === 1 && await candidate.isVisible()) {
                return (candidate[property as keyof Locator] as (...values: unknown[]) => unknown).apply(candidate, args);
              }
            } catch { /* try next locator strategy */ }
          }
          throw new Error(`Could not uniquely locate visible ${options.role} "${options.name}". Tried semantic role/name${options.label ? ', label' : ''}${options.placeholder ? ', placeholder' : ''}${options.testId ? ', test id' : ''}.`);
        };
      }
      return Reflect.get(target, property, receiver);
    },
  });
}
