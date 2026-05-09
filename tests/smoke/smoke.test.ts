// Smoke Tests - Critical Path Testing
// File: tests/smoke/smoke.test.ts

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Smoke Tests - Critical Paths', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'admin@msl.local');
    await page.fill('input[name="password"]', 'admin12345');
    await page.click('button:has-text("Login")');
    await page.waitForURL(`${BASE_URL}/dashboard`);
  });

  test('Critical Path 1: Dashboard loads successfully', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);

    // Check page loaded
    await expect(page).toHaveTitle(/Dashboard/i);

    // Check critical elements exist
    await expect(page.locator('text=Students')).toBeVisible();
    await expect(page.locator('text=Standards')).toBeVisible();
    await expect(page.locator('text=Fees received')).toBeVisible();
    await expect(page.locator('text=Pending')).toBeVisible();

    // Check navigation works
    await expect(page.locator('a[href="/payments/new"]')).toBeVisible();
  });

  test('Critical Path 2: Can view students list', async ({ page }) => {
    await page.goto(`${BASE_URL}/students`);

    // Check page loaded
    await expect(page.locator('h1:has-text("Students")')).toBeVisible();

    // Check table or empty state exists
    const hasTable = await page.locator('table').count() > 0;
    const hasEmptyState = await page.locator('text=/No students/i').count() > 0;
    expect(hasTable || hasEmptyState).toBeTruthy();
  });

  test('Critical Path 3: Can view payments list', async ({ page }) => {
    await page.goto(`${BASE_URL}/payments`);

    // Check page loaded
    await expect(page.locator('h1:has-text("Payments")')).toBeVisible();

    // Check record payment button exists
    await expect(page.locator('a[href="/payments/new"]')).toBeVisible();
  });

  test('Critical Path 4: Payment form loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/payments/new`);

    // Check page loaded
    await expect(page.locator('h1:has-text("Record payment")')).toBeVisible();

    // Check form elements exist
    await expect(page.locator('select[name="standardId"]')).toBeVisible();
    await expect(page.locator('select[name="studentId"]')).toBeVisible();
    await expect(page.locator('input[name="amountReceived"]')).toBeVisible();
    await expect(page.locator('input[name="paymentDate"]')).toBeVisible();
  });

  test('Critical Path 5: Standards page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/standards`);

    // Check page loaded
    await expect(page.locator('h1:has-text("Standards")')).toBeVisible();
  });

  test('Critical Path 6: Settings page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/settings`);

    // Check page loaded
    await expect(page.locator('h1:has-text("Settings")')).toBeVisible();
  });

  test('Critical Path 7: Reports page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/reports`);

    // Check page loaded
    await expect(page.locator('h1:has-text("Reports")')).toBeVisible();
  });

  test('Critical Path 8: Fee structures page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/fee-structures`);

    // Check page loaded
    await expect(page.locator('h1:has-text("Fee structures")')).toBeVisible();
  });

  test('Critical Path 9: Navigation menu works', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);

    // Check all navigation links exist
    await expect(page.locator('a[href="/dashboard"]')).toBeVisible();
    await expect(page.locator('a[href="/students"]')).toBeVisible();
    await expect(page.locator('a[href="/payments"]')).toBeVisible();
    await expect(page.locator('a[href="/standards"]')).toBeVisible();
    await expect(page.locator('a[href="/reports"]')).toBeVisible();
  });

  test('Critical Path 10: Logout works', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);

    // Find and click logout button
    const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout")');
    if (await logoutButton.count() > 0) {
      await logoutButton.click();

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
    }
  });
});

test.describe('Smoke Tests - Performance', () => {
  test('Dashboard loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'admin@msl.local');
    await page.fill('input[name="password"]', 'admin12345');
    await page.click('button:has-text("Login")');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    const loadTime = Date.now() - startTime;

    // Dashboard should load in under 5 seconds (before optimization)
    // After optimization, should be under 2 seconds
    expect(loadTime).toBeLessThan(5000);
    console.log(`Dashboard load time: ${loadTime}ms`);
  });

  test('Students page loads within acceptable time', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'admin@msl.local');
    await page.fill('input[name="password"]', 'admin12345');
    await page.click('button:has-text("Login")');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    const startTime = Date.now();
    await page.goto(`${BASE_URL}/students`);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000);
    console.log(`Students page load time: ${loadTime}ms`);
  });
});

test.describe('Smoke Tests - Security', () => {
  test('Unauthenticated users redirected to login', async ({ page }) => {
    // Try to access dashboard without login
    await page.goto(`${BASE_URL}/dashboard`);

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('Unauthenticated users cannot access students', async ({ page }) => {
    await page.goto(`${BASE_URL}/students`);
    await expect(page).toHaveURL(/\/login/);
  });

  test('Unauthenticated users cannot access payments', async ({ page }) => {
    await page.goto(`${BASE_URL}/payments`);
    await expect(page).toHaveURL(/\/login/);
  });

  test('Invalid login credentials rejected', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button:has-text("Login")');

    // Should stay on login page or show error
    await page.waitForTimeout(1000);
    const url = page.url();
    expect(url).toContain('/login');
  });
});
