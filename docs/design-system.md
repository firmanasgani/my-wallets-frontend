# Moneytory design system

Status: proposed target for the authenticated application, based on `src/assets/shell.css` and existing shared components. This document is guidance, not a claim that every page already conforms. The companion [visual reference](design-system.html) is a standalone illustration; production components and tokens remain the source of truth.

## Principles

- Make financial information easy to scan: use clear labels, consistent currency formatting, and visible signs for negative values.
- Give each page one primary action and a clear hierarchy from overview to detail.
- Use shared components before creating local variants. Support light and dark themes, keyboard use, loading, empty and error states.
- Use Indonesian for user-facing copy, with familiar accounting terms when useful. Describe outcomes rather than implementation details.

## Foundations

### Color tokens

Use the variables defined on `.money-shell` in `src/assets/shell.css`. Dark values are applied by `.dark .money-shell`; do not hard-code light values in theme-aware surfaces.

| Token | Light | Dark | Purpose |
| --- | --- | --- | --- |
| `--shell-paper` | `#fdf9ee` | `#17151d` | Page background |
| `--shell-surface` | `#fffcf5` | `#211e29` | Cards and controls |
| `--shell-ink` | `#27231d` | `#f6f0e5` | Primary text |
| `--shell-muted` | `#6c6256` | `#b7aec2` | Secondary text |
| `--shell-line` | `#423a2d` | `#736b7e` | Strong borders |
| `--shell-rule` | `#e2d8c7` | `#3c3549` | Dividers and subtle borders |
| `--shell-grape` | `#5026a5` | `#cfb8f5` | Accent and focus |
| `--shell-lilac` | `#eee4ff` | `#35264e` | Accent background |
| `--shell-mint` | `#ddf4d9` | `#243a32` | Positive background |
| `--shell-sun` | `#fff0b6` | `#423822` | Caution background |

The grape token changes in dark mode: do not assume white text on it has sufficient contrast. Check foreground and background in both themes. Use color with text or icons for status; never rely on color alone. Treat older green/slate values in `base.css` and individual views as legacy, not additional primary palettes.

### Typography and spacing

Use Arial/Helvetica/sans-serif as in the shell. Body defaults to 14px/1.5. Use bold, tightly tracked page titles, 20-26px section headings, 14px body text, and 10-12px uppercase overlines sparingly. Allow headings, amounts and long account names to wrap. Use tabular numerals for financial amounts. Use a spacing rhythm of 4, 8, 12, 16, 24 and 32px; prefer 16-24px cards, 18-24px card radii and pill-shaped actions. These dimensions are recommended targets, not centrally enforced tokens.

## Page structure

1. Page header: overline, title, concise description and the main action.
2. Optional overview: a small number of meaningful metrics with their period or context. Do not imply totals represent all records when data is paginated.
3. Filters: labeled fields and an explicit reset where useful. Keep current filter context visible.
4. Content: section heading, table or cards, with loading, error and empty states.
5. Secondary notes: explain limitations near the relevant data without dominating the page.

Use a centered content area up to 1280px with responsive padding. Stack header actions, metrics and controls on small screens. Tables may scroll horizontally; preserve readable columns and indicate overflow where needed.

## Components

| Need | Preferred implementation | Guidance |
| --- | --- | --- |
| Icons | `src/components/common/AppIcon.vue` | Use consistent icons; label icon-only controls. |
| Selection | `src/components/common/AppSelect.vue` | Use for custom dropdowns, including search and keyboard interaction. Use a visible label and required state. |
| Date range | `src/components/common/DateRangePicker.vue` | Use the shared picker and its apply event. |
| Form dialog | `src/components/common/AppDialog.vue` | Use native modal behavior, title, focus restoration, scroll lock and busy state. |
| Destructive confirmation | `src/components/common/ConfirmationModal.vue` | State the consequence and action; use the danger variant. |
| Monetary input | `src/components/common/CurrencyInput.vue` | Use where its value contract fits; preserve validation and currency precision. |
| Loading | `src/components/common/LoadingSpinner.vue` | Pair with context or status text. |

### Buttons and forms

Use one primary action per context, a quiet secondary action, and a distinct destructive treatment. Labels should name the action: `Simpan perubahan`, `Tambah akun`, `Hapus`. Use real buttons and links, visible labels associated with fields, helper text for constraints, and inline errors near the relevant input. Disable actions while saving and communicate progress. Do not use placeholders as labels.

### Tables and lists

Use descriptive column headings, left-align names and right-align amounts, with consistent currency and negative signs. Include explicit text for account type and status. Provide accessible names for icon-only actions. Group related records with a real button for expansion and `aria-expanded`. On mobile, retain all data via horizontal scrolling or an equivalent accessible layout.

### Dialogs

Prefer the shared dialog and confirmation components over custom overlays. A dialog needs an accessible title, focus moved inside and restored to its opener, focus containment, Escape and backdrop behavior, and scroll locking. Prevent accidental dismissal during a save. Keep forms short, show errors in context, and provide cancel and primary actions. Teleported content must receive theme variables: shell-scoped variables do not automatically inherit through `Teleport` to `body`.

### States and accessibility

Provide loading, empty, error and success feedback. Distinguish no data from a failed request and offer retry when appropriate. Support keyboard navigation, visible focus, semantic headings, links and buttons, and labels for controls. Maintain readable contrast in both themes, including badges, hover, selected and disabled states. Avoid conveying meaning with color alone. Check at narrow and wide widths and with long values.

## Implementation and migration

- Source tokens: `src/assets/shell.css`. Existing shared styles: `src/assets/select.css`, `dialog.css`, `confirmation.css`, `date-range.css`.
- Several recently redesigned report and business views use local CSS and hard-coded purple hero colors; older views still use emerald/slate utility classes. They are not yet one unified implementation.
- Some custom teleported modals and calendar controls need an accessibility and dark-theme audit. Prefer migrating them to `AppDialog` rather than copying local overlay implementations.
- Consolidate repeated page headings, overview cards, buttons and semantic status colors into shared components/tokens incrementally. Keep existing financial behavior and permissions intact.
- For each migration, check light/dark, desktop/mobile, keyboard/focus, loading/error/empty, permissions and long financial values. Run `npm run type-check`, `npm run build` and relevant tests when dependencies are available.
