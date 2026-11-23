# App Style Sheet (Travel Card, working name)

Version 0.2, by Dali. Approved by Matthieu on 23/11/2026. Matthieu's decisions applied: system font, favourites shown only at the top, TRA-03 Taxi for the hotel card. For Dave. Scope: the Android phone and tablet app, V1. Based on Functional Analysis v0.5, Architecture v0.3, the request's App interface section and the Artwork Style Guideline. The artwork (`assets/symbols`) is not changed by this sheet. Mock-ups and highlights: `docs/design/mockups/app-mockups.html`.

## 1. Feel and principles
Calm, clean, friendly. The symbols are the only strong colour on screen, so the interface stays quiet: cool-light greys, one blue for actions, generous space. One light look only (no theme setting). Display mode is always white. One-hand use: the main action sits at the bottom, reachable by the thumb. Units are dp (text in sp). Everything must survive Android font scaling up to 130 %.

## 2. Colour tokens
Contrast is measured with the WCAG formula. AA needs 4.5:1 for text and 3:1 for controls and icons that carry meaning.

| Token | Hex | Use | Contrast (AA) |
|---|---|---|---|
| `background` | `#F4F6F8` | Screen background | fill |
| `surface` | `#FFFFFF` | Cards, tiles, fields, sheets | fill |
| `surface-variant` | `#E9EEF2` | Card preview area, disabled fills | fill |
| `on-surface` | `#212121` | Main text | 16.10:1 on surface, 14.86:1 on background |
| `on-surface-muted` | `#4A5A66` | Secondary text, hints, counters | 7.13:1 on surface, 6.58:1 on background |
| `outline` | `#78909C` | Borders of fields, chips, outlined buttons | 3.35:1 on surface (passes 3:1) |
| `outline-subtle` | `#D5DDE3` | Tile edges, dividers (decorative only) | not relied on |
| `primary` | `#1565C0` | Buttons, selected state, links, favourite star | 5.75:1 on surface |
| `on-primary` | `#FFFFFF` | Text and icons on primary | 5.75:1 on primary |
| `primary-container` | `#DCEBFA` | Selected cell or chip fill | fill |
| `on-primary-container` | `#0B3D7A` | Text on selected fill | 8.82:1 |
| `danger` | `#C62828` | Delete, errors | 5.62:1 on surface |
| `danger-container` | `#FDECEA` | Error fill | danger on it 4.92:1 |
| `warning` | `#F57C00` | Decorative accent only (bar, icon) | 2.70:1 on surface: never used alone as text or as the only boundary |
| `warning-container` | `#FFF1DC` | Safety notice fill | fill |
| `on-warning-container` | `#6B3600` | Safety notice text | 8.76:1 |
| `success` | `#2E7D32` | Confirmation | 5.13:1 on surface |
| `disabled-text` | `#6B7B86` | Disabled text, on `surface-variant` | 3.74:1 (disabled is exempt from AA; kept legible) |
| `display-background` | `#FFFFFF` | Display mode, always | fill |

Rules: text on `background` or `surface` is `on-surface` or `on-surface-muted`. Blue means "tap or selected"; red only means delete or error in the interface (the red in the artwork keeps its "no / danger" meaning). Colour never carries meaning alone: selected also has a 2 dp border, a disabled item is also faded and not tappable.

## 3. Typography
**Decided by Matthieu: the Android system font. Roboto is not bundled.** Small differences between devices (for example the Xiaomi tablet's own font) are accepted. This matches the Architecture ("no fonts to download"). Licence note: Roboto, which is the system font on Samsung, is Apache License 2.0; nothing is bundled, so no licence file is needed in the app. Artwork uses no font. Use only two weights: Regular 400 and Medium 500. Artwork uses no font.

| Style | Size / line | Weight | Use |
|---|---|---|---|
| title-large | 22 / 28 sp | Medium | App bar title |
| title-medium | 16 / 24 sp | Medium | Category header, section title |
| body | 16 / 24 sp | Regular | Text, fields, notices |
| label | 14 / 20 sp | Medium | Buttons, chips, card label |
| caption | 12 / 16 sp | Regular | Picker cell names, counters. Never smaller than 12 sp |

Texts are replaceable per language: leave room (labels may take two lines, buttons grow in width, never truncate a safety text).

## 4. Spacing, shape, elevation, targets
- **Spacing**: 4 dp grid. Tokens 4, 8, 12, 16, 24, 32. Screen side margin 16. Gap between tiles 12.
- **Corner radius**: 8 small elements, 12 picker cells and notices, 16 tiles and the card preview, 24 and 28 pill shapes (search, chips, buttons), 16 extended add button.
- **Elevation**: flat. Surfaces are separated by tone and a 1 dp `outline-subtle` edge, like the artwork (no shadows). The only shadows: the add button (Android elevation 3) and dialogs and bottom sheets (elevation 8).
- **Tap targets**: 48 x 48 dp minimum everywhere (icons are 24 dp inside a 48 dp area). Main action 56 dp high. At least 8 dp between targets.
- **Icons**: 24 dp, 2 dp stroke, round caps, `currentColor`, drawn in the same rounded geometry as the artwork. Needed: search, plus, back, camera, check, star, more (three dots). Self-drawn, so no icon-font licence.
- **One-hand use**: add button and Save at the bottom, search at the top is a field (tap), not a gesture. No target in the top corners for primary actions except back.

## 5. Components
**Card tile** (home): 158 dp wide (two per row on a 360 dp phone, more on a tablet), `surface`, radius 16, 1 dp `outline-subtle` edge. A 104 dp thumbnail area shows the card exactly as in display mode (main symbol, the No rule, badges) at about 84 dp; below it the label (label style, 2 lines max, 14 sp; if the card has no label show the symbol name). A favourite shows a 28 dp `primary` star at the top right. A card with a photo shows a 44 x 34 dp photo thumbnail at the left of the thumbnail area (about 150 dp tile height in total). Whole tile is the tap target (opens display mode). Press: `primary-container` overlay. Edit and reorder are in a long press menu and in an edit mode with up and down buttons (48 dp), per FA section 8.

**Category header**: title-medium on the left, count (caption, `on-surface-muted`) on the right, 40 dp high, 16 dp side margin. **Decided by Matthieu: a favourite appears only in the Favourites section at the top, and not again in its category.** A category that has no non-favourite card left is not shown on Home (in the default state Diet & allergies is hidden, because its only card, No peanuts, is a favourite). Only categories that still hold cards appear. Favourites is a header too, followed by a horizontal row of tiles. Home also keeps the add button clear of the last tile: the list has 88 dp bottom padding and the button sits at the right.

**Search field**: 52 dp on home (44 dp inside the picker), pill, `surface`, 1.5 dp `outline` border, 24 dp search icon, hint in `on-surface-muted`. Hint text "Search cards and symbols". Focus: border becomes 2 dp `primary`.

**Add button**: extended button "New card" with plus, 56 dp high, `primary`, white label, radius 16, bottom right, 16 dp from the edges, elevation 3. It sits above the list and the list gets 88 dp bottom padding.

**Symbol picker cell**: grid of 4 per row on a phone (80 x 92 dp), 6 on tablet. The symbol is 52 dp, the name below in caption, 2 lines. States: normal (`surface`, 1 dp edge), selected (`primary-container` fill, 2 dp `primary` border, name Medium), pressed (overlay). Category chips above the grid scroll horizontally.

**Modifier chip**: 48 dp high pill, 32 dp badge on the left (the real MOD artwork), name in label style. States: available (`surface`, 1.5 dp `outline`), selected (`primary-container`, 2 dp `primary`, with a small number 1 or 2 showing the slot: 1 is bottom right, 2 is top right), blocked once 2 are chosen (`surface-variant`, `disabled-text`, badge faded, not tappable). Tapping a selected chip removes it. "No" (MOD-01) is not offered on DIE-13, MON-08, REL-01, REL-04, REL-05, REL-06 (FA 5.5). Modifiers are badges only and are never the main symbol.

**Buttons**: filled (`primary`, white label, 48 dp, pill, main action 56 dp), tonal (`primary-container`, `on-primary-container`), outlined (1.5 dp `outline`, `primary` label), text (`primary`; destructive text uses `danger`). Label style, 24 dp side padding. Disabled: `surface-variant` with `disabled-text`.

**Safety notice**: `warning-container` card with a 6 dp `warning` bar on the left, title (body, Medium) and text (14 sp) in `on-warning-container`, radius 12, and a filled button "I understand". Shown once at first launch, again from Settings. A shorter reminder (same look, one line, dismissable) appears when a card with the Allergy badge or in Health & emergency is saved. Wording as in FA 5.8.

## 6. Display mode (always white)
- Background `display-background`, no app bar, no buttons, no status text. Tap anywhere to close. Screen stays awake (Android); brightness raise is a Could have.
- Symbol card: one main symbol with its badges, a square, **as large as the screen allows** with an 8 dp margin (portrait: screen width minus margins; landscape: screen height minus margins), centred. Badges use the artwork slots (40 %, bottom right then top right). The symbol under No is at 60 % (guideline section 6); the six symbols drawn already crossed out are shown as drawn.
- With a photo (for example "Take me to my hotel", which uses TRA-03 Taxi, decided): symbol card on top (a square, full width minus 16 dp margins), the photo directly below with a 12 dp gap, filling the rest of the height at the width of the card, **not cropped** (letterboxed on `surface-variant` if its shape differs), radius 16. In landscape: symbol card left, photo right.
- Label only if the card's "show label" choice is on: title-large under the symbol card, `on-surface`.
- Photo only: the photo fills the screen, not cropped.

## 7. Other screens (rules only, not drawn)
App bar 56 dp with back (48 dp target) and title; one primary action per screen; forms use 56 dp fields with the label above (caption) and 16 dp spacing; lists use 56 to 72 dp rows with the 16 dp margin; Settings rows are 56 dp text rows (restore example cards, safety notice, about with the line that cards are stored only on this device). Tablet: same components, more tiles and cells per row (tile 158 dp wide, as many as fit), display mode as in section 6.

## 8. Implementation notes
- Draw artwork only through the SVG files, at any size, with no recolouring or cropping (Architecture). Badge placement and the No rule are in the guideline; the app composes them.
- Card editor has one Save only: the bottom "Save card" button (56 dp). The app bar has back and title, no Save.
- Default example cards on first launch: No peanuts, I'm allergic (favourite), Where is the toilet? (Places & directions), Can my dog come in? (PET-03, no modifier, Pets).
- Keep colours and sizes as named tokens in one theme file, so text and later languages are the only things screens change.
- Respect system font scale and screen sizes; test on the Galaxy S22 and the Xiaomi tablet. The mock-ups were checked in a desktop browser with Roboto, not on a device.
