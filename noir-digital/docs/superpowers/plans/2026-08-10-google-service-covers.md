# Google Service Covers Implementation Plan

> **For agentic workers:** Execute directly by default. Use subagents only for independent bounded lanes that satisfy the global harness policy. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the textual Contábil Sudoeste and Posto Ipiranga service thumbnails with a coherent pair of square graphical covers generated through ChatGPT web.

**Architecture:** Generate one approved master for each client, using the Contábil result as the structural reference for the Posto result. Derive each hover state from its approved master so the framing cannot jump, then use the existing work-asset pipeline to produce the tracked 1200, 960, 720, and 480 WebPs without changing card layout or routing.

**Tech Stack:** ChatGPT web `Criar imagem`, PNG source masters, Sharp, Next.js 16, TypeScript, Vitest, T3 collaborative browser.

---

### Task 1: Generate and accept the Contábil Sudoeste master

**Files:**
- Create source: `asset-sources/google-presence/contabil-sudoeste/generated/contabil-google-main-square.png`
- Reference: `docs/superpowers/specs/2026-08-10-google-service-covers-design.md`

- [ ] **Step 1: Inspect the authenticated ChatGPT web conversation**

Use the collaborative browser status and snapshot tools. Reuse the existing authenticated ChatGPT tab or open `https://chatgpt.com/` if no suitable tab exists. Do not replace an active image-generation conversation without checking its visible state.

- [ ] **Step 2: Select the real image-generation tool**

Open `Adicionar arquivos e mais`, select `Criar imagem`, and verify the composer displays the `Criar imagem` chip before entering the prompt.

- [ ] **Step 3: Send the exact Contábil prompt**

```text
Use OBRIGATORIAMENTE a ferramenta selecionada "Criar imagem".

Crie EXATAMENTE 1 imagem real e separada, em formato quadrado 1:1, para a capa editorial do case Contábil Sudoeste no site da agência NOIR.

Direção: fundo preto e grafite profundo; uma escultura arquitetônica central feita de módulos tridimensionais organizados como livros-caixa, edifícios e barras ascendentes; metal preto anodizado e vidro fumê; linhas muito finas de coordenadas e rotas; poucos pontos luminosos dourados e cobre; iluminação cinematográfica precisa; alto contraste; amplo espaço negativo; câmera frontal com perspectiva suave; horizonte baixo; objeto central ocupando aproximadamente 68% da imagem; acabamento premium, minimalista, tecnológico e editorial.

A imagem deve sugerir organização, estrutura, localização e presença digital sem mostrar interfaces.

PROIBIDO: palavras, letras, números, logotipos, marcas, telas do Google, navegador, barra de busca, estrelas, avaliações, dashboard, mockup de aplicativo, pessoas, colagem ou grade. Nenhum elemento pode parecer texto ilegível.

Não use Python, código, SVG, HTML, canvas, desenho programático, ZIP, PDF, placeholder ou pacote de arquivos. Gere somente a imagem real.
```

Expected: one finished `Imagem gerada` card, no grid, ZIP, code, text, logo, browser UI, or fake interface.

- [ ] **Step 4: Inspect and accept the master**

Reject and regenerate if the image contains letter-like marks, malformed logos, obvious charts with labels, a browser frame, excessive orange, or an object that fills more than roughly three quarters of the square. Accept only a centered dark composition with controlled gold/copper accents and clear negative space.

- [ ] **Step 5: Download and place the original**

Download the accepted original image and place it at:

```text
asset-sources/google-presence/contabil-sudoeste/generated/contabil-google-main-square.png
```

Verify it is a readable square raster:

```powershell
node --input-type=module -e "import sharp from 'sharp'; const m=await sharp('asset-sources/google-presence/contabil-sudoeste/generated/contabil-google-main-square.png').metadata(); console.log(m.width,m.height,m.format); if(!m.width||m.width!==m.height) process.exit(1)"
```

Expected: equal non-zero width and height and format `png`.

### Task 2: Generate and accept the structurally matched Posto Ipiranga master

**Files:**
- Create source: `asset-sources/google-presence/posto-ipiranga/generated/posto-google-main-square.png`
- Reference source: `asset-sources/google-presence/contabil-sudoeste/generated/contabil-google-main-square.png`

- [ ] **Step 1: Attach the approved Contábil master as a structural reference**

In the same ChatGPT conversation, attach `contabil-google-main-square.png`. Select `Criar imagem` again and verify the image-generation chip is present before typing.

- [ ] **Step 2: Send the exact Posto prompt**

```text
Use OBRIGATORIAMENTE a ferramenta selecionada "Criar imagem".

Use a imagem anexada SOMENTE como referência estrutural da série: preserve a mesma câmera frontal, horizonte, escala do objeto, quantidade de espaço negativo, fundo grafite, materiais, densidade visual e distribuição geral dos pontos luminosos.

Crie EXATAMENTE 1 nova imagem real e separada, quadrada 1:1, para a capa editorial do case Posto Ipiranga no site da agência NOIR.

Reinterprete a escultura modular como uma arquitetura abstrata de mobilidade: cobertura horizontal, ilha central, pista geométrica e uma rota fina que atravessa os volumes. Use metal preto anodizado e vidro fumê, luz amarela como acento principal e azul-cobalto apenas em poucos detalhes. Mantenha iluminação cinematográfica precisa, alto contraste, acabamento premium, minimalista, tecnológico e editorial. O objeto central deve ocupar aproximadamente 68% da imagem.

A imagem deve sugerir localização, rota, energia e presença digital sem reproduzir um posto real ou uma interface.

PROIBIDO: palavras, letras, números, logotipos, marca Ipiranga desenhada, placas, preços, bombas com texto, telas do Google, navegador, barra de busca, estrelas, avaliações, dashboard, mockup de aplicativo, pessoas, carros, colagem ou grade. Nenhum elemento pode parecer texto ilegível.

Não use Python, código, SVG, HTML, canvas, desenho programático, ZIP, PDF, placeholder ou pacote de arquivos. Gere somente a imagem real.
```

Expected: one finished `Imagem gerada` card that is visibly part of the same series as the Contábil master while remaining identifiable as a mobility/fuel architecture through shape and color.

- [ ] **Step 3: Inspect and accept the pair**

Compare both cards side by side. Reject the Posto result if camera height, object scale, background, contrast, or visual density differ materially from Contábil, or if any lettering/logo is present.

- [ ] **Step 4: Download and place the original**

Download the accepted image to:

```text
asset-sources/google-presence/posto-ipiranga/generated/posto-google-main-square.png
```

Verify it is a readable square PNG:

```powershell
node --input-type=module -e "import sharp from 'sharp'; const m=await sharp('asset-sources/google-presence/posto-ipiranga/generated/posto-google-main-square.png').metadata(); console.log(m.width,m.height,m.format); if(!m.width||m.width!==m.height) process.exit(1)"
```

Expected: equal non-zero width and height and format `png`.

### Task 3: Derive stable hover sources and rebuild the responsive assets

**Files:**
- Create source: `asset-sources/google-presence/contabil-sudoeste/generated/contabil-google-hover.png`
- Create source: `asset-sources/google-presence/posto-ipiranga/generated/posto-google-hover.png`
- Modify: `public/work/contabil-google-main.webp`
- Modify: `public/work/contabil-google-main-480.webp`
- Modify: `public/work/contabil-google-main-720.webp`
- Modify: `public/work/contabil-google-main-960.webp`
- Modify: `public/work/contabil-google-hover.webp`
- Modify: `public/work/contabil-google-hover-480.webp`
- Modify: `public/work/contabil-google-hover-720.webp`
- Modify: `public/work/contabil-google-hover-960.webp`
- Modify: `public/work/posto-google-main.webp`
- Modify: `public/work/posto-google-main-480.webp`
- Modify: `public/work/posto-google-main-720.webp`
- Modify: `public/work/posto-google-main-960.webp`
- Modify: `public/work/posto-google-hover.webp`
- Modify: `public/work/posto-google-hover-480.webp`
- Modify: `public/work/posto-google-hover-720.webp`
- Modify: `public/work/posto-google-hover-960.webp`

- [ ] **Step 1: Create hover sources from the same pixels**

Run:

```powershell
node --input-type=module -e "import sharp from 'sharp'; const jobs=[['asset-sources/google-presence/contabil-sudoeste/generated/contabil-google-main-square.png','asset-sources/google-presence/contabil-sudoeste/generated/contabil-google-hover.png'],['asset-sources/google-presence/posto-ipiranga/generated/posto-google-main-square.png','asset-sources/google-presence/posto-ipiranga/generated/posto-google-hover.png']]; for (const [input,output] of jobs) await sharp(input).modulate({brightness:1.08,saturation:1.12}).png().toFile(output);"
```

Expected: two square hover PNGs with identical geometry to their masters and a restrained increase in light and saturation.

- [ ] **Step 2: Rebuild the work asset set with the existing pipeline**

Run:

```powershell
npm run assets:work
```

Expected: the pipeline reports all work assets and writes the two selected `main/hover` pairs at 1200 x 1200 plus 480, 720, and 960 variants.

- [ ] **Step 3: Confirm that no unrelated public asset changed**

Run:

```powershell
git diff --name-only -- public/work
```

Expected: exactly the 16 Contábil/Posto WebPs listed under this task. If any unrelated asset differs, stop and inspect the pipeline/input before staging.

- [ ] **Step 4: Verify every output dimension and format**

Run:

```powershell
node --input-type=module -e "import sharp from 'sharp'; import fs from 'node:fs'; const files=fs.readdirSync('public/work').filter(n=>/^(contabil|posto)-google-(main|hover)(-(480|720|960))?\.webp$/.test(n)); if(files.length!==16) throw new Error('expected 16 outputs'); for(const f of files){const m=await sharp('public/work/'+f).metadata(); const expected=f.includes('-480.')?480:f.includes('-720.')?720:f.includes('-960.')?960:1200; console.log(f,m.width+'x'+m.height,m.format); if(m.width!==expected||m.height!==expected||m.format!=='webp') process.exitCode=1;}"
```

Expected: 16 WebPs, each square at its filename width.

### Task 4: Make the accessible descriptions match the new artwork

**Files:**
- Modify: `data/projects.test.ts`
- Modify: `data/projects.ts`

- [ ] **Step 1: Write the failing accessibility-copy test**

Add to `data/projects.test.ts` inside `describe("projects", ...)`:

```ts
it("describes the paired graphical covers without claiming Google interface screenshots", () => {
  const descriptions = Object.fromEntries(
    projects
      .filter(({ slug }) => slug === "contabil-sudoeste" || slug === "posto-ipiranga")
      .map(({ slug, imageAlt }) => [slug, imageAlt]),
  );

  expect(descriptions).toEqual({
    "contabil-sudoeste":
      "Composição gráfica em grafite e dourado para o case de presença local da Contábil Sudoeste",
    "posto-ipiranga":
      "Composição gráfica em grafite, amarelo e azul para o case de presença local do Posto Ipiranga",
  });
});
```

- [ ] **Step 2: Run the test and verify the old descriptions fail**

Run:

```powershell
npx vitest run data/projects.test.ts --reporter=dot --maxWorkers=4
```

Expected: FAIL showing the two previous screenshot-oriented `imageAlt` values.

- [ ] **Step 3: Update only the two descriptions**

In `data/projects.ts`, set:

```ts
imageAlt: "Composição gráfica em grafite e dourado para o case de presença local da Contábil Sudoeste",
```

and:

```ts
imageAlt:
  "Composição gráfica em grafite, amarelo e azul para o case de presença local do Posto Ipiranga",
```

- [ ] **Step 4: Run the focused test again**

Run:

```powershell
npx vitest run data/projects.test.ts --reporter=dot --maxWorkers=4
```

Expected: all tests in `data/projects.test.ts` PASS.

### Task 5: Verify the integrated cards

**Files:**
- Verify: `components/work/ProjectCard.tsx`
- Verify: `components/work/SelectedWork.test.tsx`
- Verify: `public/work/contabil-google-*.webp`
- Verify: `public/work/posto-google-*.webp`

- [ ] **Step 1: Run the work-section regression tests**

Run:

```powershell
npx vitest run data/projects.test.ts components/work --reporter=dot --maxWorkers=4
```

Expected: all selected tests PASS.

- [ ] **Step 2: Run type and formatting checks**

Run:

```powershell
npm run typecheck
npx biome check data/projects.ts data/projects.test.ts
```

Expected: both commands exit 0.

- [ ] **Step 3: Build the production export**

Run:

```powershell
npm run build
```

Expected: build exits 0 and generates all current static routes.

- [ ] **Step 4: Inspect desktop main and hover states**

Start the site:

```powershell
npm run dev -- --port 3101
```

Open `http://127.0.0.1:3101/?effects=on` in the collaborative browser at 1920 x 900. Confirm the two Google cards have matching camera, scale, background, and density; no text appears inside either artwork; each hover brightens without geometric movement; and both cards remain square.

- [ ] **Step 5: Inspect the mobile layout**

Resize the same collaborative browser tab to 390 x 844 and reload `http://127.0.0.1:3101/?effects=on`. Confirm both compositions remain legible, centered, unclipped, and free of horizontal overflow. Hover-only content must not be required to understand the card.

- [ ] **Step 6: Review the final scope before committing**

Run:

```powershell
git status --short
git diff --name-only
git diff --check
```

Expected: only `data/projects.ts`, `data/projects.test.ts`, and the 16 intended public WebPs are part of the implementation change. Source masters may remain in the existing ignored `asset-sources` tree and unrelated pre-existing untracked files remain untouched.

- [ ] **Step 7: Commit the implementation without publishing**

Run:

```powershell
git add -- data/projects.ts data/projects.test.ts public/work/contabil-google-main.webp public/work/contabil-google-main-480.webp public/work/contabil-google-main-720.webp public/work/contabil-google-main-960.webp public/work/contabil-google-hover.webp public/work/contabil-google-hover-480.webp public/work/contabil-google-hover-720.webp public/work/contabil-google-hover-960.webp public/work/posto-google-main.webp public/work/posto-google-main-480.webp public/work/posto-google-main-720.webp public/work/posto-google-main-960.webp public/work/posto-google-hover.webp public/work/posto-google-hover-480.webp public/work/posto-google-hover-720.webp public/work/posto-google-hover-960.webp
git diff --cached --check
git commit -m "feat(work): replace textual Google service covers"
```

Expected: one implementation commit containing only the two cover families and their accurate accessible descriptions. Do not push or deploy without a separate explicit request.
