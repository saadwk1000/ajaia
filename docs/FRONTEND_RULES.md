# Frontend conventions

Use camelCase folders. UI components: frontend/src/component/UI/<name>/{index.tsx,style.module.scss,types.ts}. Page implementations: frontend/src/component/page/<name>/{index.tsx,page.tsx,style.module.scss,types.ts}. page.tsx only initializes the implementation. Next.js route files only render page components. Global styles live in frontend/src/styles/styles.scss. Keep documentation and prompts under docs. Use separate validation, slice and store files if those libraries are introduced.
