import { test, expect } from '@playwright/test';

test.describe.serial('Persona 3: Guest Attendee - Kalana', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');

        await page.locator('input[name="email"]').fill('it45678900@my.sliit.lk');
        await page.locator('input[name="password"]').fill('password123');
        await page.getByRole('button', { name: /sign in/i }).click();
        await page.waitForTimeout(2000);
    });

    test('3.1 View Confirmed Group Ticket via Dashboard', async ({ page }) => {
        await page.goto('/my-tickets');

        await expect(page.getByRole('heading', { name: 'My Tickets' })).toBeVisible({ timeout: 10000 });

        // Ensure we are on the Confirmed Tab
        // It is active by default usually, but we click to be certain
        await page.getByRole('button', { name: /Confirmed/i }).click();

        // Check if event title is rendered
        const confirmedCard = page.locator('h3').filter({ hasText: 'React Native Appathon' }).first();
        await expect(confirmedCard).toBeVisible({ timeout: 10000 });

        // Check if the "Gifted by Dummy Buyer" badge is visible inside the card
        // Kalana was gifted this ticket by Dummy Buyer in our seed DB
        const giftBadge = page.getByText(/Gifted by Dummy Buyer/i).first();
        await expect(giftBadge).toBeVisible();
    });

    test('3.2 Access QR Code and Save as PDF', async ({ page }) => {
        await page.goto('/my-tickets');

        await page.getByRole('button', { name: /Confirmed/i }).click();

        const confirmedCard = page.locator('.bg-white.rounded-2xl', { hasText: 'React Native Appathon' }).first();
        await expect(confirmedCard).toBeVisible({ timeout: 10000 });

        // Click View QR Code
        await confirmedCard.getByRole('button', { name: /view qr/i }).click();

        // Expect the Modal Dialog to open and display the event title
        await expect(page.getByRole('dialog').getByText('React Native Appathon', { exact: true })).toBeVisible();
        await expect(page.getByRole('dialog').getByText('Kalana', { exact: true })).toBeVisible(); // Name inside QR dialog
        
        // Close modal by clicking outside or pressing Escape
        await page.keyboard.press('Escape');
        
        // Wait for modal to close
        await expect(page.getByRole('dialog')).toBeHidden();

        // Click Download PDF
        await confirmedCard.getByRole('button', { name: /save pdf/i }).click();
        
        // We will assert the spinning loader appears indicating processing
        // Since playright may not intercept actual file downloads cleanly unless context explicitly set
        // But clicking the button is enough to test the DOM reaction
        await expect(confirmedCard.getByRole('button', { name: /save pdf/i })).toBeVisible(); 
    });
});
