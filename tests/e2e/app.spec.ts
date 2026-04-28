import { expect, test } from "@playwright/test";

test("admin can login and view dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByText("Fees received")).toBeVisible();
});

test("invoice PDF endpoint returns a PDF", async ({ request, page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await page.goto("/payments");
  await expect(page.getByRole("heading", { name: "Payments" })).toBeVisible();
  const href = await page.getByRole("link", { name: "PDF" }).first().getAttribute("href");
  expect(href).toBeTruthy();
  const response = await request.get(href!);
  expect(response.ok()).toBeTruthy();
  expect(response.headers()["content-type"]).toContain("application/pdf");
});
