# magistick design system

World: Jaipur / Bagru hand-block print. An indigo shell, an indigo-tinted ground, white work panels, and one dyed "thappa" stamp per department. Operate-mode product UI: familiar controls, one family, colour only where it carries meaning.

## Tokens (tailwind.config.ts)

| Token | Value | Job |
|---|---|---|
| `nil` / `nil-2` / `nil-3` | #1B2250 / #252E66 / #323C7A | Shell: header, admin rail, matrix head, selected tab |
| `ground` (`paper`) | #F1F2F7 | Page ground |
| `panel` | #FFFFFF | Work surfaces |
| `parchment` | #E7E9F2 | Table heads, neutral chips |
| `line` | #DDE0EB | Hairlines |
| `ink` | #161A33 | Text |
| `stone-400…700` | #6F7494 … #363A56 | Secondary text (cool, indigo-leaning) |
| `ember` | #2B3A8C | Primary action, links, focus ring |
| `gold` (haldi) | #E0A526 | Active nav underline, "changed from default" dot, focus on indigo, selection |
| `ok` / `warn` / `bad` | #2F6B3B / #8A5A12 / #B3261E | States only |

Department dyes and stamp motifs live in `lib/rbac.ts` (`DEPARTMENTS`) and `components/Stamp.tsx` (`MOTIFS`). A dye means that department everywhere and nothing else.

## Type

Inter (next/font), one family. Page title 24px/600, section 17px/600, body 13.5–14px, captions 12–12.5px. Tabular numerals (`.tabular`) for counts and dates. No eyebrows, no display face.

## Components

- `Stamp`, `DeptTag`, `LevelTag`, `Avatar`, `stampBandStyle` (components/Stamp.tsx): the signature. Avatar = initials on department dye with the stamp pressed in the corner. The header band repeats the viewer's own department stamp.
- Buttons (`components/admin/ui.tsx` `btn`): primary indigo, quiet bordered, danger madder. Height 36px, radius 8px.
- Inputs: 36px, 1px `line` border, `ember` focus border.
- Lists and tables: one white panel with `divide-line`, `parchment` header row; no nested cards.
- Skeletons (`.skeleton`) for loading, dashed-border panels for empty states that say what to do next.

## Motion

State only: 150ms colour/border transitions. No entrance choreography, no smooth-scroll, respects reduced motion.
