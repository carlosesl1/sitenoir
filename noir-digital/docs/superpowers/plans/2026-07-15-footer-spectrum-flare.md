# Footer Spectrum Flare Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar um espectro vermelho-violeta somente aos rastros do flare do modelo 3D do footer, mantendo o núcleo branco e a hero inalterada.

**Architecture:** O estado de transição da cena passará a informar quando o footer está visível. `HeroLensFlare` converterá esse estado em um uniforme escalar, e o fragment shader misturará sua rampa monocromática atual com uma rampa HSV somente no footer, reutilizando o mesmo passe e os mesmos render targets.

**Tech Stack:** React 19, React Three Fiber, Three.js `ShaderMaterial`, GLSL, Vitest, Next.js 16.

---

### Task 1: Identificar o footer no estado da cena

**Files:**
- Modify: `scene/scene-transition.ts`
- Modify: `scene/FullscreenDither.tsx`
- Test: `scene/scene-transition.test.ts`

- [x] **Step 1: Escrever o teste de propagação da visibilidade do footer**

Adicionar `contactVisible: true` à entrada do teste e verificar `expect(state.contactVisible).toBe(true)`.

- [x] **Step 2: Executar o teste e confirmar a falha**

Run: `npx vitest run scene/scene-transition.test.ts`
Expected: FAIL porque `contactVisible` ainda não existe no estado.

- [x] **Step 3: Implementar o estado mínimo**

Adicionar `contactVisible` a `SceneTransitionState` e `SceneTransitionInput`, inicializá-lo como `false` e propagá-lo em `resolveSceneTransition`. Em `FullscreenDither`, reutilizar as métricas já armazenadas para calcular a interseção do footer com a viewport e enviar esse booleano ao store.

- [x] **Step 4: Executar o teste e confirmar que passa**

Run: `npx vitest run scene/scene-transition.test.ts`
Expected: PASS.

### Task 2: Criar a rampa espectral no flare existente

**Files:**
- Modify: `scene/HeroLensFlare.tsx`
- Modify: `scene/hero-lens-flare-shaders.ts`

- [x] **Step 1: Adicionar o controle do espectro ao material**

Criar o uniforme `uSpectrumMix` com valor inicial `0` e atualizá-lo no `useFrame` para `1` somente quando `transition.contactVisible` for verdadeiro.

- [x] **Step 2: Implementar a mistura espectral no GLSL**

Declarar `uSpectrumMix`, converter matiz HSV em RGB e mapear a distância do núcleo de `0.0` a `0.78`, produzindo vermelho, amarelo, verde, ciano, azul e violeta. Preservar branco perto do núcleo e misturar com a rampa atual via `uSpectrumMix`.

- [x] **Step 3: Formatar e checar os arquivos alterados**

Run: `npm run check`
Expected: exit code 0.

### Task 3: Verificar integração e aparência

**Files:**
- Verify: `scene/HeroLensFlare.tsx`
- Verify: `scene/hero-lens-flare-shaders.ts`

- [x] **Step 1: Executar o build de produção**

Run: `npm run build`
Expected: exit code 0 e rotas compiladas.

- [x] **Step 2: Inspecionar o footer no localhost**

Abrir `http://127.0.0.1:3000/#contact` e confirmar: núcleo branco, rastros espectrais e nenhuma coloração uniforme sobre a superfície do 3D.

- [x] **Step 3: Inspecionar a hero**

Voltar para `http://127.0.0.1:3000/` e confirmar que o flare da hero mantém sua cor anterior.
