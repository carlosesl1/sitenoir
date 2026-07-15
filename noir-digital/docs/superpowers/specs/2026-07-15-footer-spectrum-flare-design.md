# Footer Spectrum Flare

## Objetivo

Transformar somente o flare luminoso produzido pelo modelo 3D do footer em um espectro contínuo de cores, preservando o flare atual da hero e evitando novos passes de renderização.

## Solução aprovada

O shader de flare existente receberá um controle numérico que distingue a hero do footer. Na hero, o shader continuará usando a cor atual. Quando o footer estiver visível, o mesmo passe misturará os rastros do flare com um gradiente espectral ordenado de vermelho a violeta.

O centro do brilho permanecerá branco. A saturação aumentará gradualmente ao longo dos rastros, evitando colorir a superfície inteira do modelo ou produzir faixas duras.

## Arquitetura

- Reutilizar o material e o render target existentes em `HeroLensFlare`.
- Expor no estado de transição se a seção de contato está visível.
- Atualizar um único uniforme do shader por frame, sem medições adicionais do DOM.
- Calcular o espectro diretamente no fragment shader com funções matemáticas, sem texturas ou luzes extras.
- Manter todos os parâmetros atuais da hero inalterados.

## Desempenho

A alteração adiciona apenas um uniforme e poucas operações matemáticas ao passe já existente. Não haverá novas meshes, luzes, texturas, render targets ou passes de pós-processamento.

## Verificação

- Executar a checagem de tipos e o build de produção.
- Inspecionar o footer no localhost para confirmar o espectro e a preservação do núcleo branco.
- Voltar à hero e confirmar que sua coloração permanece igual.
