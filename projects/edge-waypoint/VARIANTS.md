# Site variants - pick one, deploy one

Three complete, separately deployable versions of the Edge Waypoint site now live in this folder. Same copy, same funnel, same calculator; different visual character.

| Folder | Style | Character |
|---|---|---|
| `site/` | **Field Guide** (v1) | Print-shop crisp: hairlines, hard shadows, mono labels, inline SVG trail map. No external art needed |
| `site-c-sketchbook/` | **Sketchbook Journey** | Cream paper, hand-wobbled borders, handwritten margin notes (Caveat), the doodle strip as a sticky spine beside the process, ink sketches as story beats |
| `site-a-gallery/` | **Gallery Print** | Museum monograph: pure white, typography-led, artwork as captioned plates inside mats ("Plate I. The workshop"), numbered editorial steps, one gradient brand stroke at the top of the page |

## To preview the two new variants with your art

Both expect five PNGs in their `assets/art/` folder (names listed in `assets/art/README.md`):
`logo.png`, `portrait.png`, `journey-strip.png`, `sketch-workshop.png`, `sketch-calm.png`

Drop the files in, open `index.html`, done. The ink sketches don't need their
backgrounds removed - the sketchbook variant blends them onto the paper, the
gallery variant frames them as-is.

## Where each artwork lives

| Artwork | Sketchbook (C) | Gallery (A) |
|---|---|---|
| Logo | Header, all pages | Header, all pages |
| Workshop sketch | Home hero, beside the headline, captioned "this is the 90 minutes (it's free)" in handwriting | Home, full-width Plate I with mat and mono caption |
| Journey doodle strip | Sticky left spine beside the process steps (home + how-it-works) | Quiet right margin rail beside the engagement steps (how-it-works) |
| Meditating-in-clouds sketch | End of the engagement walk, captioned "you, after week four" | Plate II before the kill-clause band: "The owner, week four" |
| Halftone portrait | About hero, wobble-framed, captioned "halftone me. the real one shows up in person." | About, Plate III in a museum mat: "The consultant, halftone. The original shows up in person." |

## Choosing

- Pick **Sketchbook** if you want the site to feel like the workshop: warm, hand-made, disarming. Strongest match for the v2 copy voice and the personal-touch positioning.
- Pick **Gallery** if your client base skews professional-services (law, accounting, finance) and you want maximum credibility with the lightheartedness carried by the captions and copy alone.
- Either way, the launch checklist in `site/README.md` applies (swaps, calendar embed, tel/mailto links, meta descriptions, Google Business Profile).

Delete the variants you don't use before deploying, or keep them in the repo and deploy only the chosen folder.
