# Footer Brand Lockup and Contact Grid Design

Date: 2026-08-09
Status: Approved direction

## Objective

Correct the NOIR footer lockup so the brand symbol is optically proportional to the `NOIR` wordmark, place the descriptor below the complete symbol-and-wordmark row, replace `ESTÚDIO` with `AGÊNCIA` in every site lockup, and prevent the footer email from overlapping the social links.

## Scope

- Update the footer brand lockup in `ContactFooter` and its CSS Module.
- Update every visible brand descriptor from `ESTÚDIO DE ESTRUTURA DIGITAL` to `AGÊNCIA DE ESTRUTURA DIGITAL`, including the contact page lockup and accessible labels.
- Update focused tests for the new copy, markup contract, proportions, and responsive information-grid behavior.
- Preserve the footer stage, 3D scene, CTA, closing bar, theme behavior, typography, borders, and motion.

## Brand Lockup

The symbol and `NOIR` wordmark form one horizontal name row. Because the symbol is much narrower and appeared too small at an equal numeric height, its rendered height is 120% of the wordmark height and it remains vertically centered beside the wordmark. The descriptor sits on a second row below the combined symbol-and-wordmark width rather than only below the wordmark.

The implementation keeps the existing independent SVG assets because they already support theme filtering and responsive sizing. A small wrapper groups the two assets in the name row, while the descriptor remains live HTML text for accessibility, editing, and responsive wrapping.

The descriptor copy is `AGÊNCIA DE ESTRUTURA DIGITAL`. It may wrap naturally when the available width requires it, but it must remain below the name row and inside the brand cell.

## Information Grid

Desktop and tablet keep their current information architecture. On narrow mobile viewports:

- the brand cell spans the full grid width;
- the contact cell spans the full grid width so the email remains on one contained line;
- the social and links cells share the following two-column row;
- no link may overlap another cell or create horizontal page overflow.

The email remains unchanged and fully readable. It must not be reduced to an illegible size, clipped, or broken with arbitrary characters.

## Responsive and Accessibility Requirements

- The symbol and wordmark share one horizontal centerline, with the symbol rendered at 120% of the wordmark height for optical balance.
- The descriptor is visible in both dark and light themes.
- Existing link labels, destinations, focus styles, and minimum interaction heights remain intact.
- The footer has no horizontal overflow at 390 px and at desktop widths.
- The contact and social text never overlap at supported responsive boundaries.

## Verification

- Run the focused `ContactFooter` and `ContactPage` tests.
- Run Biome on all modified component, CSS, and test files.
- Run the production build.
- Inspect the footer at 390 px and 1920 px, measuring the rendered symbol and wordmark heights and checking the information-grid cell bounds.
- Inspect the contact-page lockup to confirm the descriptor copy is consistent.

## Non-goals

- Rebuilding the logo as a combined raster or SVG asset.
- Changing the footer 3D scene, background effects, closing-bar content, contact details, social URLs, or overall visual language.
- Publishing the changes without a separate explicit publication request.
