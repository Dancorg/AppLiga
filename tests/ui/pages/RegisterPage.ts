import { type Page } from '@playwright/test';

export class RegisterPage {
    constructor(private page: Page) {}

    async goto() {
        await this.page.goto('/register');
    }

    async register(email: string, username: string, password: string, role: 'player' | 'admin') {
        await this.page.getByPlaceholder('Email').fill(email);
        await this.page.getByPlaceholder('Username').fill(username);
        await this.page.getByPlaceholder('Password').fill(password);
        await this.page.getByRole('combobox').selectOption(role);
        await this.page.getByRole('button', { name: 'Register' }).click();
        await this.page.waitForURL('/');
    }
}
