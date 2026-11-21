# Symbol changes, revision round 1

By Dali, for updating the Symbol List afterwards (the Symbol List itself has not been edited). Total stays 168: 168 - 6 removed + 6 added. Previous artwork: `docs/design/style-2-round-1/`. Removed files: `docs/design/removed-symbols/`.

## Removed (6)
| ID | Name | Note |
|---|---|---|
| DIE-11 | Halal | Removed at Matthieu's request |
| DIE-12 | Kosher | Removed at Matthieu's request |
| DIE-14 | Cross-contamination | Removed |
| HEA-06 | Pain location | Removed; HEA-08 now shows the whole body with the pain on the stomach |
| HEA-14 | Theft | Removed |
| HEA-15 | Embassy | Removed |

## Added or split (6 new IDs, 4 existing IDs renamed)
| ID | New name | Meaning (what the card says) | Change |
|---|---|---|---|
| FOO-06 | Still bottled water | Still (non-sparkling) bottled water | Renamed from "Bottled water"; artwork unchanged |
| FOO-22 | Sparkling bottled water | Sparkling bottled water | New; same bottle as FOO-06 with visible bubbles |
| MOD-09 | More | Quantity up | Renamed from "More / less"; plus badge |
| MOD-12 | Less | Quantity down | New; minus with a down chevron |
| MOD-10 | Small | Small size or portion | Renamed from "Small / big"; letter S, small |
| MOD-13 | Medium | Medium size or portion | New; letter M, medium |
| MOD-14 | Big | Big size or portion | New; letter L, large |
| MOD-11 | Hot | Hot food, drink or water | Renamed from "Hot / cold"; white flame on red |
| MOD-15 | Cold | Cold food, drink or water | New; white snowflake on blue |
| HEA-16 | Seek medical attention | I need medical care, take me to a doctor | New; white medical cross inside a red heart (not a red cross, a protected emblem) |

The modifier count is now 15 (was 11), so any place that says "11 modifiers" needs updating. Paired modifiers are no longer paired.

## Redrawn (same ID and meaning, new artwork)
| ID | Name | What changed |
|---|---|---|
| MOD-03 | Allergy | Orange fork and spoon inside a red prohibition ring (replaces the warning triangle with a heart) |
| MOD-05 | I want / please give me | Open palm-up hand receiving, down arrow above |
| BAS-02 | Drinking water | Droplet falling into a glass of water |
| BAS-05 | I don't understand | Confused face with a finger at the corner of the lips, question mark |
| FOO-14 | Noodles | Bowl heaped with noodles |
| DIE-06 | Shellfish | A prawn only |
| DIE-13 | No alcohol | Smaller wine glass, visible behind the No sign |
| TRA-03 | Taxi | Black-and-white checker strip and roof sign |
| TRA-08 | Metro | White M on a blue square |
| TRA-21 | Directions | Question mark added |
| ACC-07 | Hot water | Shower and a flame |
| ACC-08 | Towel | Hanging striped towel |
| HEA-08 | Stomach ache | Whole body, pain on the stomach |
| HEA-09 | Fever | Head as in HEA-07, thermometer in place of the red star |
| HEA-10 | Nausea | Queasy green face |
| MON-01 | ATM | Letters ATM on the machine |
| MON-04 | Currency exchange | Yen sign on one coin, dollar sign on the other |
| MON-08 | No bag | Smaller bag behind the No sign |
| PLA-06 | Convenience store | Bright banded corner shop with glass doors (own colours, no real brand) |
| PLA-07 | Supermarket | A shopping cart with groceries only |
| PLA-10 | Museum | M on the pediment |
| REL-01, REL-04, REL-05, REL-06 | Shoes off, Quiet please, No photos, Do not touch | Object smaller behind the No sign |
| COM-03 | Power adapter | Adapter just before being plugged into an outlet |
| COM-04 | Translate app | Two speech bubbles with A and 文 |
| COM-05 | Email | Envelope with an @ |
| TIM-01 | Numbers | The digits 1 2 3 |

All other symbols are byte-identical to `docs/design/style-2-round-1/`.

## For the Symbol List update
- Rename and add the rows above, remove the six rows, set the new rows' Source to Artwork.
- The Functional Analysis, section 5.2, describes the 11 modifiers and the paired ones (More / less, Small / big, Hot / cold); that now changes through Guillaume.
- DIE-11 and DIE-12 leave the religious-check list; the remaining religious symbols are REL-01 to REL-03 and REL-07 to REL-13.
