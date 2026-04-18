import { test, expect } from '@playwright/test';

test.describe.serial('Persona 2: Society Admin - Thulya', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');

        await page.locator('input[name="email"]').fill('it12345678@my.sliit.lk');
        await page.locator('input[name="password"]').fill('password123');
        await page.getByRole('button', { name: /sign in/i }).click();
        await page.waitForTimeout(2000);
    });

    test('2.1 Review pending payment slips for their society', async ({ page }) => {
        await page.goto('/admin/verify-slips');
        await expect(page.getByRole('heading', { name: 'AI Payment Verification' })).toBeVisible({ timeout: 10000 });
        
        // Wait for table cell with event title
        const row = page.getByRole('row', { name: /React Native Appathon/i }).first();
        await expect(row).toBeVisible({ timeout: 10000 });
    });

    test('2.2 Reject Slip with Reason', async ({ page }) => {
        await page.goto('/admin/verify-slips');

        const row = page.getByRole('row', { name: /React Native Appathon/i }).first();
        await expect(row).toBeVisible({ timeout: 10000 });

        // Open specific slip Review dialog
        await row.getByRole('button', { name: /Review Slip/i }).click();
        await expect(page.getByText('Verify Transaction:')).toBeVisible({ timeout: 5000 });

        // Reject Slip flow
        await page.getByRole('button', { name: /Reject Slip/i }).click();

        // Reason Input
        await page.getByPlaceholder(/Amount mismatch/i).fill('Slip is blurry and unreadable');

        // Confirm
        await page.getByRole('button', { name: /Confirm Rejection/i }).click();

        // Expect Snackbar
        await expect(page.getByText('Slip rejected successfully', { exact: false })).toBeVisible({ timeout: 10000 });
    });
});
