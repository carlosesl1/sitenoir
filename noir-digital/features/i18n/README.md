# Site languages

On the first visit, the site selects the first supported language in `navigator.languages` (including regional English and Portuguese variants). It falls back to `navigator.language` when the list is empty, then to Portuguese if no supported language is found. A valid explicit PT/EN choice saved in `noir-language` takes priority. Automatic detection does not save an override, and storage failures do not prevent detection or switching.

`LanguageProvider` exposes `language`, `setLanguage` and `t` to client components. The PT/EN control changes the language without navigation, saves the preference and updates the document language. Removing a saved preference in another tab restores browser detection. A small script in the document head resolves the language before paint; English content is revealed after hydration has applied the translation. If the application bundle fails to load, the static Portuguese fallback becomes visible after eight seconds. JavaScript-disabled browsers receive the original static page.

English dictionaries use the existing Portuguese copy as keys. Keep URLs, service form values, identifiers, project names and media sources unchanged. Translate display labels with `t`. Add new text to the appropriate `en*.json` dictionary; the coverage test checks published content, cases and legal documents.

The site still exports its original Portuguese routes and metadata. English is a browser preference, not a separate set of indexed URLs. Original client artwork and video audio are preserved; videos offer Portuguese and English caption tracks.

Run `npx vitest run features/i18n` for persistence, contact flow and content coverage checks.
