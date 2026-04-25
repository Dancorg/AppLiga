// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    timeout: 5_000, // remove line for defaut value, default is 30_0000, 
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'api',
            testMatch: '**/api/**/*.spec.{js,ts}',
        },
        {
            name: 'ui',
            testMatch: '**/ui/**/*.spec.{js,ts}',
            use: {
                ...devices['Desktop Chrome'],
                baseURL: process.env.FRONTEND_URL ?? 'http://localhost:5173',
            },
        },
    ],
});
