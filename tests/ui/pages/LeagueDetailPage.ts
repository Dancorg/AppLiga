import { type Page, type Locator } from '@playwright/test';

export class LeagueDetailPage {
    constructor(private page: Page) {}

    dateCard(dateStr: string): Locator {
        return this.page.locator('div').filter({
            has: this.page.getByRole('heading', { name: dateStr, level: 4 }),
        });
    }

    async joinLeague() {
        await this.page.getByRole('button', { name: 'Join League' }).click();
    }

    async createDate(dateStr: string) {
        const input = this.page.locator('input[type="date"]');
        await input.fill(dateStr);
        await this.page.getByRole('button', { name: 'Add Date' }).click();
        await this.page.getByRole('heading', { name: dateStr, level: 4 }).waitFor();
    }

    async joinDate(dateStr: string) {
        await this.dateCard(dateStr).getByRole('button', { name: 'Join Date' }).click();
    }

    async generateMatches(dateStr: string) {
        await this.dateCard(dateStr).getByRole('button', { name: 'Generate Matches' }).click();
    }

    async clickFirstMatch(dateStr: string) {
        await this.dateCard(dateStr).locator('li').nth(2).click();
        await this.page.waitForURL(/\/matches\/\d+/);
    }
}
