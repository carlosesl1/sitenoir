# Espectro Prismático para o Vidro Canvas UI

Data: 2026-08-10
Status: Direção aprovada

## Objetivo

Evoluir a variante experimental `?glass=canvas-ui` escolhida pelo usuário. O corpo do NOIR deve continuar transparente, com a geometria e a transmissão física atuais, mas ganhar o espectro visível da referência: contornos cromáticos definidos e poucas faixas de cor atravessando partes do vidro.

O ajuste permanece restrito à branch `codex/noir-prismatic-glass` e à variante Canvas UI. A home padrão e o painel **ATUAL** de `/glass-test` não serão modificados.

## Direção visual aprovada

A opção escolhida foi **bordas fortes com feixes internos sutis**.

O resultado deve combinar:

- corpo transparente, sem preenchimento preto, cinza ou arco-íris contínuo;
- contorno branco frio produzido pelo vidro físico;
- separação RGB mais intensa nas arestas externas e internas das letras;
- poucas faixas prismáticas estreitas no interior, semelhantes a luz atravessando um volume;
- resposta da cor ao ângulo da superfície e ao movimento já existente do modelo;
- ausência de animação autônoma do espectro.

O espectro será um destaque óptico. Ele não deve encobrir o fundo, reduzir a legibilidade da geometria nem transformar o NOIR em um objeto emissivo sólido.

## Arquitetura do material

### Camada base

`HeroCanvasUiGlassAsset` continuará usando o `MeshPhysicalMaterial` atual como material principal. Permanecem válidos transmissão total, IOR, espessura, roughness, clearcoat, dispersion e o ambiente PMREM já aprovados.

Essa camada é responsável por:

- transparência e refração física;
- highlights brancos;
- leitura do volume e das faces chanfradas;
- interação com o ambiente de estúdio.

### Camada prismática

Uma segunda malha compartilhará exatamente a mesma `BufferGeometry`. Ela usará um `ShaderMaterial` transparente e aditivo, renderizado depois da camada base, com escrita de profundidade desativada e pequeno `polygonOffset` para evitar conflito entre superfícies coplanares.

A geometria não será clonada. O custo adicional previsto é um draw call do modelo e um material leve, sem texturas, framebuffer extra ou novo carregamento de asset.

A camada prismática combinará duas máscaras:

1. **Rim espectral:** Fresnel baseado na normal mundial e no vetor da câmera. A intensidade cresce nas arestas rasantes e permanece quase nula nas faces frontais.
2. **Feixes internos:** bandas estreitas calculadas a partir da posição local e da orientação da superfície. Uma função de limiar mantém somente alguns picos visíveis, com intensidade menor que a do contorno.

As cores serão geradas por uma paleta espectral contínua em fase RGB. A fase variará no espaço do modelo e com a normal, fazendo as cores responderem naturalmente à rotação e ao scroll sem um relógio de animação.

## Configuração

Os controles prismáticos ficarão em um objeto de configuração puro, próximo de `hero-canvas-ui-glass-config.ts`, para permitir ajuste e teste sem espalhar números pelo componente.

O contrato inicial incluirá:

- força e potência do rim;
- força, frequência e nitidez das bandas;
- saturação espectral;
- opacidade máxima da camada;
- intensidade mínima das faces, limitada para preservar transparência;
- `polygonOffset` da camada.

Os valores iniciais favorecerão bordas fortes e bandas internas secundárias. O tuning visual poderá alterar somente esses valores, sem mudar arquitetura ou geometria.

## Componentes e ciclo de vida

- `HeroCanvasUiGlassAsset` continuará sendo o ponto de montagem da variante.
- Um módulo isolado fornecerá os shaders e, se útil para teste, a fábrica do material prismático.
- As duas malhas compartilharão a geometria preparada por `createHeroModelGeometry`.
- A camada base continuará no render layer usado pela refração do hero; a camada prismática seguirá a mesma transformação e ordem visual.
- Material físico, material prismático, geometria e PMREM serão descartados no unmount por seus respectivos proprietários.
- `prefers-reduced-motion` não exige caminho alternativo, pois o espectro não terá animação temporal própria.

## Falhas e isolamento

A camada não introduzirá fetch, textura externa ou processamento assíncrono. Erros de shader continuarão cobertos pelo `SceneErrorBoundary` existente e deverão ser detectados durante a validação local.

A seleção da variante não muda: somente `glass=canvas-ui` monta o novo material. Valores ausentes ou desconhecidos continuam usando `HeroGlassAsset` sem qualquer alteração.

## Testes

O trabalho seguirá TDD.

Antes do código de produção, testes deverão falhar comprovando a ausência do novo contrato e então validar:

- configuração prismática com rim dominante e bandas secundárias;
- shader com máscaras separadas para aresta e feixes internos;
- camada transparente, aditiva, sem escrita de profundidade e sem dependência temporal;
- compartilhamento da geometria entre o vidro físico e a camada prismática;
- cleanup dos materiais e manutenção da variante padrão.

A verificação final incluirá:

- testes Vitest focados da variante, configuração, shader e geometria;
- testes existentes do hero e do comparador;
- TypeScript;
- Biome nos arquivos alterados;
- build de produção com Webpack no worktree;
- `/glass-test` em desktop para comparar transparência, contornos e feixes;
- inspeção de console para warnings novos do material.

## Critérios de aceitação

1. O painel **CANVAS UI** mantém o fundo claramente visível através das faces.
2. Arestas externas e internas exibem separação RGB evidente, semelhante à referência.
3. Algumas faixas espectrais atravessam o vidro, mas não preenchem toda a palavra.
4. O contorno branco e a leitura dos chanfros continuam presentes.
5. O espectro responde ao ângulo do modelo sem animação autônoma.
6. O painel **ATUAL** e a home sem `glass=canvas-ui` permanecem inalterados.
7. Não há textura, framebuffer, geometria clonada ou carregamento adicional.
8. Recursos WebGL adicionados são descartados ao desmontar a cena.
9. Testes, typecheck, Biome e build passam.

## Fora de escopo

- alterar novamente o GLB;
- substituir o `MeshPhysicalMaterial` por um shader único;
- copiar o shader prismático atual para a variante Canvas UI;
- adicionar controles públicos ou sliders ao site;
- animar o espectro por tempo, áudio ou ponteiro;
- mudar fundo, layout, textos, stickers, câmera ou movimento do hero;
- publicar, mesclar ou enviar a branch ao remoto.
