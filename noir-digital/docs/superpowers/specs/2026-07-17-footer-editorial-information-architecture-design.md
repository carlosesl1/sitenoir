# Footer Editorial — Arquitetura de Informação

## Objetivo

Reorganizar o rodapé da home combinando as duas referências aprovadas em uma única composição contínua. O palco atual de contato — frase grande, 3D, fundo e interações — permanece visual e funcionalmente intacto. A nova informação entra abaixo desse palco, em duas faixas editoriais responsivas.

## Estrutura aprovada

### 1. Faixa informativa superior

Uma grade horizontal, delimitada por linhas finas, contendo:

- **Marca:** NOIR.DIGITAL e identificação institucional curta.
- **Contato:** o e-mail já existente no projeto.
- **Social:** os nomes de redes já cadastrados, sem inventar URLs ausentes.
- **Links:** Work e Services, apontando para os destinos internos existentes.

As colunas usarão divisórias verticais no desktop. A informação será tipográfica e compacta, seguindo a linguagem técnica já usada pelo site.

### 2. Barra final inferior

Uma segunda faixa, mais baixa, contendo:

- À esquerda: `© NOIR.DIGITAL 2026. TODOS OS DIREITOS RESERVADOS.`
- Ao centro: `DO ESCURO, HÁ IDEIAS QUE MARCAM.`
- À direita: os links Privacidade e Termos, seguidos pela marca circular já existente.

Os links legais aparecem somente nesta barra, evitando duplicação com a faixa institucional.

## Integração com o footer atual

- O headline `O PRÓXIMO PASSO DO SEU NEGÓCIO COMEÇA AQUI.` continua no palco principal.
- O anchor da cena 3D, materiais, flare, controles de mouse e camadas de fundo não serão alterados.
- O palco principal ganha um contêiner próprio com altura preservada.
- As duas novas faixas entram no fluxo normal logo após esse contêiner, evitando sobreposição com o 3D e o texto grande.
- As faixas permanecem transparentes para deixar visível o fundo geral da página.
- O e-mail e as redes que hoje ficam posicionados sobre o palco passam para a faixa informativa, eliminando duplicação visual.

## Responsividade

### Desktop

- Faixa superior distribuída dentro dos três módulos do grid persistente do site, sem criar novos eixos verticais.
- Barra inferior distribuída em três zonas: copyright, manifesto e legal/marca.
- As divisórias verticais reutilizam exatamente o inset e os terços da malha global; somente as linhas horizontais próprias das duas faixas são adicionadas.

### Tablet

- Faixa superior reorganizada em uma grade de duas ou três colunas, conforme o espaço disponível.
- Marca e contato recebem prioridade de largura.
- Barra inferior pode quebrar em duas linhas sem reduzir excessivamente a tipografia.

### Mobile

- Marca ocupa a largura completa.
- Contato e Social formam uma grade de duas colunas; Links ocupa a largura completa abaixo.
- O manifesto ocupa uma linha própria.
- Copyright fica separado dos links legais e da marca circular, sem texto fora da tela.
- Todos os elementos mantêm áreas de toque adequadas e nenhuma informação depende de hover.

## Acessibilidade e comportamento

- As coleções de navegação terão rótulos acessíveis.
- Links reais serão usados para e-mail e rotas internas.
- Os links provisórios legais terão URLs válidas, sem `href="#"`.
- Estados de foco serão visíveis e compatíveis com o contraste do rodapé preto.
- Não serão adicionadas animações contínuas nem novos efeitos gráficos ao footer informativo.

## Conteúdo e rotas

- Contato e redes reutilizam `data/content.ts`.
- Work aponta para a seção de projetos da home.
- Services aponta para `/services`.
- Privacidade aponta para `/privacidade`.
- Termos aponta para `/termos`.
- As páginas legais não fazem parte deste escopo; somente os links serão preparados.

## Verificação

- Atualizar o teste do componente para cobrir o manifesto, copyright e os destinos internos/legais.
- Executar o teste direcionado do footer e a checagem de tipos.
- Verificar visualmente a home em um viewport desktop e um mobile, confirmando que o palco 3D não mudou e que as duas faixas não causam overflow horizontal.
