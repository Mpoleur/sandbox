# Artwork Style Guideline (Travel Card, working name)

Version 0.2 (revision round 1), by Dali. Draft, not validated. Previous artwork versions are kept in `docs/design/style-proposal-1/` (first draft) and `docs/design/style-2-round-1/` (style 2, first full set). Removed symbols are in `docs/design/removed-symbols/`; the changes are listed in `docs/design/symbol-changes.md`. Scope: the artwork of the 168 library symbols and their modifier badges only. It does not cover the app interface, colours of screens or typography.

Why this style: recognition comes first. The first draft (kept in `docs/design/style-proposal-1/`) used heavy black outlines on everything and food became hard to read. This style (approved sample in `docs/design/style-proposal-2/`) draws each object as a flat silhouette in its real-world colour, as on public information panels.

## 1. Format
- SVG, square, `viewBox="0 0 64 64"`, no width/height, transparent background. One file per ID: `assets/symbols/<ID>.svg`.
- Only flat fills and plain strokes. No gradients, shadows, filters, opacity, clip paths, images or external references.
- **No text or letters, with one narrow exception.** Matthieu allows only these glyphs, each drawn as vector strokes (never `<text>`, so nothing depends on a font): the digits 1 2 3 on TIM-01; the letters S, M, L on the size badges MOD-10, MOD-13, MOD-14; M on TRA-08 Metro and PLA-10 Museum; A, T, M on MON-01 ATM; A and the character 文 on COM-04; the sign @ on COM-05; the yen sign and the dollar sign on MON-04. Nothing else may carry a letter, digit or word. Any new use needs Matthieu's approval and is added to this list. The glyphs live in `GLYPH` in `assets/_source/lib.py` (one shared set of strokes, so they stay consistent).
- Keep drawings inside a 4 px margin (4 to 60), so a badge or the "no" overlay never crops the subject.
- Must stay readable from 32 px up to full screen. Check at 32 px and, as a stress test, 24 px.

## 2. Language of the drawings
1. One idea per symbol, drawn as its **characteristic silhouette** (a drumstick has a plump body and a bone with two knobs, a bottle has a neck and a cap).
2. **Real-world colour** where it helps recognition: bread brown, chicken golden, steak deep red, ice pale blue, sugar warm cream, taxi yellow.
3. **Two tones per object**: a base colour plus a darker tone of the same hue for one detail (a side, a rim, a stripe), and a few white or light highlights. That is the only "shading", and it is flat.
4. **No outline on objects.** Exceptions: a white or very pale object gets a 3 px mid-grey edge (`#90A4AE`) so it stays visible on a white card; thin lines are allowed for things that are lines (cutlery, tubes, handles, arrows, Wi-Fi arcs).
5. Dark ink (`#212121`) is for people, wheels and small neutral details. Slate (`#455A64`, `#78909C`) and light greys (`#CFD8DC`, `#ECEFF1`) are for metal, tech and neutral objects.
6. Similar items must differ in **both shape and colour** (ice: rounded pale-blue cubes with a snowflake; sugar: sharp cream cubes with grains).
7. Level of detail: 3 to 8 shapes per symbol. If a detail disappears at 32 px, remove it.

## 3. Grid and geometry
| Item | Rule |
|---|---|
| Canvas | 64 x 64, content within 4 to 60 |
| Corner radius | 3 to 6 for small parts, 8 to 12 for large rounded squares (signs) |
| Line weight | 4 for lines, 3 minimum for fine detail, 8 for limbs of walking figures and thick tubes |
| Joins and caps | round |
| Compound symbols | Up to three small objects placed on a loose triangle or row, each at least 20 px, e.g. shellfish, cross-contamination |

## 4. Palette (meaning follows the request)
| Role | Hex values | Use |
|---|---|---|
| Red | `#D32F2F`, dark `#8E1B1B`, light `#E57373` | No, danger, emergency, red meat, ambulance |
| Orange | `#F57C00`, `#F4793A`, dark `#C5501B` | Warning and allergy, hot, shellfish |
| Green | `#2E7D32`, `#66BB6A` | Yes, OK, health, pharmacy, plants |
| Blue | `#1E88E5`, `#1565C0`, light `#BBDEFB`, `#81D4FA` | Information, transport, water, cold |
| Yellow, cream | `#FFC107`, `#F9A825`, `#FFF3E0`, `#F6DFAF` | Taxi, tickets, coins, bread inside, sugar |
| Browns | `#A9733A`, `#6D4C41`, `#D9A765` | Wood, bread crust, nuts, leather |
| Neutrals | `#212121`, `#455A64`, `#78909C`, `#CFD8DC`, `#ECEFF1`, `#FFFFFF` | Ink, tech, paper, glass |

Extra object tints used once: teal `#00ACC1` and purple `#8E24AA` (the bands of the corner shop PLA-06, deliberately not the colours of any real chain), lime greens `#9CCC65` `#7CB342` `#689F38` (the queasy face HEA-10).

Use red only for "no, danger, emergency" or for objects that really are red (apple, steak, chilli). Contrast of any colour against white background is not the only cue: shape always carries the meaning (colour-blind users).

## 5. People
Neutral pictogram figures: round head, simple body, no face, no hair, no skin tone, no gender-coded clothing except the standard dress shape on the toilet sign. Adults in dark ink, children in a colour. Walking figures use 8 px round limbs.

## 6. Modifier badges (MOD-01 to MOD-15)
- Each badge is drawn on its own 64 px canvas, as a full disc with a 3 px white ring so it separates from any symbol (MOD-03 is a white disc with a red ring). Glyphs are white, 5 to 9 px lines.
- **Slots**: the app scales a badge to **40 %** (25.6 px). Slot **A** is the bottom-right corner (x 38.4, y 38.4). Slot **B** is the top-right corner (x 38.4, y 0). They cannot collide (A starts at y 38.4, B ends at 25.6), so a symbol carries at most two badges, the maximum in the Functional Analysis.
- **"No" (MOD-01)** is a full-canvas red ring with slash and a white halo, drawn over the symbol at 100 %. It can be combined with one more badge in slot A. **Rule: a symbol under MOD-01 is displayed at 60 % of its size, centred** (scale 0.6 about the canvas centre, equivalent to `translate(12.8 12.8) scale(0.6)`), always the same factor, so every "No" card looks alike. The ring's inner opening is 70 % of the canvas, so a 60 % symbol sits inside it with a small margin even for wide drawings; it stays identifiable at full size and at 32 px (checked in the contact sheet). The scale applies to the symbol only: the MOD-01 overlay stays at 100 %, and other badges keep their corner slots and 40 % size, so the composition is one main symbol in the middle with badges orbiting its corners. The 60 % applies when the app composes a symbol with MOD-01; it does not change any file in `assets/symbols`. Symbols that are drawn already crossed out (DIE-13, MON-08, REL-01, REL-04, REL-05, REL-06) draw their object at the same 60 % inside the file, so they match the composed rule and are not scaled again by the app.
- Colours: No red, Without ink, Allergy orange cutlery in a red ring, Question, Please, How much, More, Less, Small, Medium, Big and Cold blue, Yes green, Urgent and Hot red.
- **Allergy (MOD-03)**: a fork and spoon (orange) inside a red prohibition ring, with the slash visible only at the corners. Risk: it can be read as "no food / do not eat". On "No peanuts, I'm allergic" it sits in slot A beside the big red "No" overlay, so two red rings appear; the small ring has a white disc and cutlery inside, so they stay distinct, but it is busy.
- **Please give me (MOD-05)**: an open palm-up hand receiving, with a down arrow above it. It avoids gestures with local meanings (no bow, no joined hands, no pointing).
- **Sizes**: Small, Medium, Big are the letters S, M, L, and the letter grows with the size (16, 28 and 42 units tall in the disc) so the difference is visible without reading.
- **More / Less** are a plus and a minus with a down chevron. Less is blue; Without (MOD-02) is the ink-coloured minus, so they differ by colour and chevron.
- **Hot / Cold** are two separate badges: a white flame on red, a white snowflake on blue.
- **Urgent (MOD-08)** uses an exclamation mark, a bar and a dot. The question mark (MOD-04, MOD-06) is a curve and a dot. These are signs, drawn as shapes.
- **Seek medical attention (HEA-16)** is a white medical cross inside a red heart. A red cross on white is a protected emblem and is not used anywhere; the white-on-red cross is inside a heart, not a square or a flag.
- One file per ID. Paired concepts are now separate IDs (Still / Sparkling water, More / Less, Small / Medium / Big, Hot / Cold). How much? is a coin plus a question mark.

## 7. Using a symbol in the app
- Show the file at any size; there is no 1x/2x. Keep a clear space of 1/16 of the symbol around it.
- Always on a white or very light background. On a dark background place the symbol on a white rounded card.
- Do not recolour, rotate, crop or stretch. Do not add text inside the artwork beyond the glyphs listed in section 1.
- A symbol that carries a badge keeps its position and size; the badge sits on top of it. The one exception is MOD-01 "No": the symbol shrinks to 60 % (section 6).

## 8. Needs a check by someone from that culture
These symbols touch religion or customs. (Halal and Kosher were removed in revision 1.) They are drafts of neutral, respectful artwork, **not validated**. Do not present them as validated until someone from the relevant community has reviewed them.
- REL-01 Shoes off, REL-02 Cover shoulders and knees, REL-03 Head covering
- REL-07 Church, REL-08 Mosque, REL-09 Buddhist temple, REL-10 Hindu temple, REL-11 Shinto shrine, REL-12 Synagogue, REL-13 Prayer room (neutral, not tied to a religion)
- Also advise a check of HEA-05 Police (shield) as a neutral choice, because police and national symbols differ by country. HEA-02 Hospital uses a **green** cross on purpose: the red cross is a protected emblem.

## 9. Adding a new symbol
1. Name the one idea and its colour. 2. Draw the silhouette, then add one darker tone and one highlight. 3. Check at 32 px beside its neighbours in the contact sheet. 4. Add it to `assets/_source/sym_a.py` or `sym_b.py`, run `python assets/_source/build.py`, then `python assets/_source/verify.py`.

Sources and tooling: the generator, the helper shapes and the checker are in `assets/_source/`. The contact sheet is `docs/design/symbol-contact-sheet.html`. All shapes are hand-authored for this project; no external icon set or font is used, so there is no third-party licence to track.
