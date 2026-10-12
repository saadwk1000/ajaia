import { test, expect, type Page } from "@playwright/test";
const ids = {
  Alice: "11111111-1111-4111-8111-111111111111",
  Bob: "22222222-2222-4222-8222-222222222222",
};
const requestHeaders = {
  "X-Ajaia-Request": "1",
  Origin: "http://localhost:3000",
};
async function login(page: Page, name: "Alice" | "Bob" = "Alice") {
  await page.goto("/login");
  await page.getByRole("radio", { name: new RegExp(name) }).check();
  if (name === "Alice" && (page.viewportSize()?.width || 0) > 1000)
    await page.screenshot({
      path: "docs/visual/login-desktop.png",
      fullPage: true,
    });
  await page.getByRole("button", { name: "Continue to workspace" }).click();
  await expect(
    page.getByRole("heading", { name: "Your ideas, all in one place." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Refresh", exact: true }),
  ).toBeEnabled();
}
async function create(page: Page) {
  await page.getByRole("button", { name: "New document", exact: true }).click();
  await page.waitForURL(/\/documents\//);
  await expect(
    page.getByRole("textbox", { name: "Document content" }),
  ).toBeVisible();
  return page.url().split("/").pop()!;
}
async function remove(page: Page, id: string) {
  await page.request.delete(`/api/v1/documents/${id}`, {
    headers: requestHeaders,
  });
}
test("create, rename, formatting toolbar, autosave and persistence", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("401"))
      errors.push(message.text());
  });
  await login(page);
  await page.screenshot({
    path: "docs/visual/dashboard-desktop.png",
    fullPage: true,
  });
  const id = await create(page);
  try {
    await page
      .getByRole("button", { name: "Rename document", exact: true })
      .click();
    await page
      .getByRole("textbox", { name: "Document title" })
      .fill("Playwright document");
    await page.getByRole("button", { name: "Save title" }).click();
    await expect(
      page.getByRole("heading", { name: "Playwright document" }),
    ).toBeVisible();
    const editor = page.getByRole("textbox", { name: "Document content" });
    await editor.fill("A lasting idea");
    await editor.press("ControlOrMeta+a");
    for (const label of ["Bold", "Italic", "Underline"]) {
      await page.getByRole("button", { name: label, exact: true }).click();
      await expect(
        page.getByRole("button", { name: label, exact: true }),
      ).toHaveAttribute("aria-pressed", "true");
    }
    await page.getByRole("button", { name: "Heading 1", exact: true }).click();
    await expect(editor.locator("h1")).toContainText("A lasting idea");
    await page.getByRole("button", { name: "Heading 2", exact: true }).click();
    await expect(editor.locator("h2")).toContainText("A lasting idea");
    await page.getByRole("button", { name: "Heading 3", exact: true }).click();
    await expect(editor.locator("h3")).toContainText("A lasting idea");
    await page
      .getByRole("button", { name: "Bulleted list", exact: true })
      .click();
    await expect(editor.locator("ul")).toBeVisible();
    await page
      .getByRole("button", { name: "Numbered list", exact: true })
      .click();
    await expect(editor.locator("ol")).toBeVisible();
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(editor.locator("ol")).toHaveCount(0);
    await page.getByRole("button", { name: "Redo", exact: true }).click();
    await expect(editor.locator("ol")).toBeVisible();
    await expect(page.getByRole("status")).toContainText("Saved");
    await page.reload();
    await expect(editor).toContainText("A lasting idea");
    await page.screenshot({
      path: "docs/visual/editor-desktop.png",
      fullPage: true,
    });
    await expect(
      editor.locator(
        "strong em u, strong u em, em strong u, u em strong, em u strong, u strong em",
      ),
    ).toContainText("A lasting idea");
    await page.getByRole("button", { name: "Back to dashboard" }).click();
    await expect(
      page.getByRole("link", { name: "Open Playwright document" }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Delete Playwright document" })
      .click();
    await page
      .getByRole("button", { name: "Delete document", exact: true })
      .click();
    await expect(
      page.getByRole("link", { name: "Open Playwright document" }),
    ).toHaveCount(0);
    expect(errors).toEqual([]);
  } finally {
    await remove(page, id);
  }
});
test("TXT and Markdown import retain formatting after refresh", async ({
  page,
}) => {
  await login(page);
  const imported: string[] = [];
  try {
    for (const [name, text] of [
      ["playwright.txt", "First paragraph\n\nSecond paragraph"],
      [
        "playwright.md",
        "# Imported heading\n\n**bold** and *italic*\n\n- list item",
      ],
    ]) {
      await page.getByRole("button", { name: "Import", exact: true }).click();
      await page.locator("input[type=file]").setInputFiles({
        name,
        mimeType: "text/plain",
        buffer: Buffer.from(text),
      });
      await page
        .getByRole("button", { name: "Import document", exact: true })
        .click();
      await page.waitForURL(/\/documents\//);
      imported.push(page.url().split("/").pop()!);
      const editor = page.getByRole("textbox", { name: "Document content" });
      await expect(editor).toBeVisible();
      await page.reload();
      if (name.endsWith(".md")) {
        await expect(editor.locator("h1")).toHaveText("Imported heading");
        await expect(editor.locator("strong")).toHaveText("bold");
        await expect(editor.locator("em")).toHaveText("italic");
        await expect(editor.locator("ul")).toContainText("list item");
      } else await expect(editor).toContainText("Second paragraph");
      await page.getByRole("button", { name: "Back to dashboard" }).click();
    }
  } finally {
    for (const id of imported) await remove(page, id);
  }
});
test("sharing dialog, viewer/editor access, revocation and user switching", async ({
  page,
  browser,
}) => {
  await login(page);
  const id = await create(page);
  const context = await browser.newContext();
  const recipient = await context.newPage();
  try {
    await page
      .getByRole("textbox", { name: "Document content" })
      .fill("Shared ideas");
    await expect(page.getByRole("status")).toContainText("Saved");
    await page.getByRole("button", { name: "Share", exact: true }).click();
    await page
      .getByRole("combobox", { name: "User to share with" })
      .selectOption(ids.Bob);
    await page.getByRole("button", { name: "Grant access" }).click();
    await expect(
      page.getByRole("combobox", { name: "Permission for Bob" }),
    ).toHaveValue("VIEW");
    await page.screenshot({
      path: "docs/visual/share-dialog.png",
      fullPage: true,
    });
    await login(recipient, "Bob");
    await expect(
      recipient.getByRole("heading", { name: "Shared with me" }),
    ).toBeVisible();
    await recipient
      .getByRole("link", { name: "Open Untitled Document" })
      .click();
    await expect(
      recipient.getByRole("textbox", { name: "Document content" }),
    ).toHaveAttribute("contenteditable", "false");
    await expect(
      recipient.getByRole("button", { name: "Bold", exact: true }),
    ).toBeDisabled();
    await expect(
      recipient.getByText("Shared ideas", { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("combobox", { name: "Permission for Bob" })
      .selectOption("EDIT");
    await expect(
      page.getByRole("status").filter({ hasText: "Access updated" }),
    ).toBeVisible();
    await recipient.reload();
    await expect(
      recipient.getByRole("textbox", { name: "Document content" }),
    ).toHaveAttribute("contenteditable", "true");
    await recipient
      .getByRole("textbox", { name: "Document content" })
      .fill("Edited by Bob");
    await expect(recipient.getByRole("status")).toContainText("Saved");
    await page.getByRole("button", { name: "Revoke Bob" }).click();
    await expect(
      page.getByRole("combobox", { name: "Permission for Bob" }),
    ).toHaveCount(0);
    await recipient
      .getByRole("textbox", { name: "Document content" })
      .fill("Unsaved after revocation");
    await expect(recipient.getByRole("status")).toContainText("Save failed");
    await expect(
      recipient.getByRole("alert").filter({ hasText: "access revoked" }),
    ).toContainText("access revoked");
    recipient.once("dialog", (d) => d.accept());
    await recipient.getByRole("button", { name: "Back to dashboard" }).click();
  } finally {
    await remove(page, id);
    await context.close();
  }
});
test("failed autosave preserves content and retry succeeds", async ({
  page,
}) => {
  await login(page);
  const id = await create(page);
  try {
    await page.route("**/api/v1/documents/*/content", (route) =>
      route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ message: "Temporarily unavailable" }),
      }),
    );
    const editor = page.getByRole("textbox", { name: "Document content" });
    await editor.fill("Keep this local text");
    await expect(page.getByRole("status")).toContainText("Save failed");
    await expect(editor).toHaveText("Keep this local text");
    await page.unroute("**/api/v1/documents/*/content");
    await page.getByRole("button", { name: "Retry save" }).click();
    await expect(page.getByRole("status")).toContainText("Saved");
    await page.reload();
    await expect(editor).toHaveText("Keep this local text");
  } finally {
    await remove(page, id);
  }
});
test("simultaneous sessions show version conflict without losing local text", async ({
  page,
  context,
}) => {
  await login(page);
  const id = await create(page);
  const second = await context.newPage();
  try {
    await second.goto(`/documents/${id}`);
    await expect(
      second.getByRole("textbox", { name: "Document content" }),
    ).toBeVisible();
    await page
      .getByRole("textbox", { name: "Document content" })
      .fill("First session");
    await expect(page.getByRole("status")).toContainText("Saved");
    await second
      .getByRole("textbox", { name: "Document content" })
      .fill("Second unsaved session");
    await expect(second.getByRole("status")).toContainText("Version conflict");
    await expect(
      second.getByRole("textbox", { name: "Document content" }),
    ).toHaveText("Second unsaved session");
    second.once("dialog", (d) => d.accept());
    await second.getByRole("button", { name: "Reload latest" }).click();
    await expect(
      second.getByRole("textbox", { name: "Document content" }),
    ).toHaveText("First session");
    await expect(
      second.getByText("An unsaved draft from this browser tab is available."),
    ).toBeVisible();
  } finally {
    await remove(page, id);
    await second.close();
  }
});
test("fast navigation restores draft and mobile workspace fits", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await page.screenshot({
    path: "docs/visual/dashboard-mobile.png",
    fullPage: true,
  });
  const id = await create(page);
  try {
    await page
      .getByRole("textbox", { name: "Document content" })
      .fill("Fast navigation draft");
    page.once("dialog", (d) => d.accept());
    await page.getByRole("button", { name: "Back to dashboard" }).click();
    await page.getByRole("link", { name: "Open Untitled Document" }).click();
    await expect(
      page.getByText("An unsaved draft from this browser tab is available."),
    ).toBeVisible();
    await page.getByRole("button", { name: "Restore draft" }).click();
    await expect(
      page.getByRole("textbox", { name: "Document content" }),
    ).toHaveText("Fast navigation draft");
    await expect(page.getByRole("status")).toContainText("Saved");
    await page.screenshot({
      path: "docs/visual/editor-mobile.png",
      fullPage: true,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.getByRole("button", { name: "Back to dashboard" }).click();
    await page.getByRole("button", { name: "Log out", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Welcome to Ajaia" }),
    ).toBeVisible();
    await page.getByRole("radio", { name: /Bob/ }).check();
    await page.getByRole("button", { name: "Continue to workspace" }).click();
    await expect(
      page.getByRole("heading", { name: "Your ideas, all in one place." }),
    ).toBeVisible();
    await page.request.post("/api/v1/auth/demo-login", {
      headers: requestHeaders,
      data: { userId: ids.Alice },
    });
  } finally {
    await remove(page, id);
  }
});
