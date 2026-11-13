# Étienne Culot — V6 design direction

## Scope and working rule

Build and refine locally, with mobile as the primary experience. Do not use ChatGPT Sites or publish, deploy or push to hosting without an explicit user request. See `AGENTS.md`.

This is an independent creative proposal, informed by the user’s “Un peu de culot” direction, Claude’s inspected source and the references below. The EC monogram now comes from the official Instagram profile. The surrounding palette, typography and copy remain implementation choices rather than asserted official brand standards.

## Reference evidence

References were studied on 13 November 2026. Research captures and detailed notes live in the task's `work/etienne-v3/references/` directory.

| Reference | Observed evidence | Transfer to this project |
| --- | --- | --- |
| [LDgenX](https://www.ldgenx.fr/) | Desktop screenshot and public CSS inspected; local atlas/journey source read without execution. Immersive subject-led hero, contextual selection, persistent story stages, strong dark/light rhythm. | One selected product changes the scene and its story together; short workshop chapters; restrained depth; stable framing. Do not copy its scientific map, particles, colours or long mobile journey. |
| [The Porters](https://porters.fr/) | Public desktop capture inspected by the parent task and reviewed here. Large serif headline, light editorial field against a dark field, offset portrait image with subtle layered framing, clear action hierarchy. Exact mobile motion/timing is not established by that screenshot. | Large expressive typography, deliberate image layering and stronger composition. Adapt the principle to complete pastry photos and a warm food identity. |
| [Cédric Grolet Opéra](https://cedric-grolet.com/opera/en/) | Official mobile page capture at 390 × 844 and HTML inspected in the food-reference study. Quiet navigation, strong whole-product photography, compact index and photo detail sliders. A cookie panel obscured part of the top section. | Let actual products create the impact; short labels and an explicit photo-detail view. Do not invent missing angles or cross-sections. |
| [Dandelion Chocolate](https://www.dandelionchocolate.com/) | Official mobile capture at 390 × 844 plus HTML/CSS inspected in the food-reference study. Large food imagery, light/dark editorial chapters, partial next-product cue, draggable rail declared in markup. Gesture timing was not tested there. | Photo-led hierarchy, clear discovery cues and a purposeful progression from product to craft to place. Avoid unnecessary commerce categories or a long retail footer. |
| Claude's supplied project | Source inspected separately; no install, build or visual preview was performed. Masked title entrance, photo curtain, full-screen native-dialog menu, compact header and progressive reveals are explicit in the code. | Adapt those small CSS/JS techniques to the current static site, retaining the complete originals and product interactions. No framework migration is required. |

## Own visual system

These are the V6 values used by the local draft; the logo is sourced, while the typeface match and surrounding styling are proposed.

| Token | Value / role |
| --- | --- |
| Plum | `#30242b` — immersive hero, full-screen menu, footer, selected controls |
| Paper | `#f4eee4` — editorial surface and photo frames |
| Cream | `#f7eada` — text and details on plum |
| Ink | `#34282e` — light-surface text |
| Muted | `#786b6c` — supporting copy |
| Sage | `#e5e7d8` — workshop and values surface |
| Product tone | Eight accents stored with the source-backed creations in `dist/content.js`; the active photograph colours the orbit ambience |
| Structural line | Ink at 18% opacity; cream at restrained opacity on dark fields |
| Text family | Locally served Manrope; Arial/sans-serif fallback |
| Expressive family | Locally served upright Cormorant Garamond, a visual match for the fine serif announcements; the brand’s exact typeface is unverified. Display `em` remains upright. |
| Brand mark | Untouched official EC profile image, `assets/brand-ec.jpg`, 746 × 746; header, hero, menu, footer and favicon |
| Written name | Lowercase upright, widely tracked “etienne culot”, recreated in Manrope from the observed artwork composition; not claimed as an official vector wordmark |
| Main ease | `cubic-bezier(.22, 1, .36, 1)` |
| Curtain ease | `cubic-bezier(.76, 0, .24, 1)` |
| Container | Maximum 1440px; 22px phone gutters, 36px tablet, 60px desktop |

Use fine, deliberate type and quiet structural details. Circular product frames are consistent across the hero, collection, orbit and thumbnails, as requested by the user. Vary scale, arrangement and motion to give each section its own purpose and rhythm.

## Visitor progression and state

1. **Invitation / hero.** Eight choices feed a floating scene. Only the active creation and its immediate neighbours occupy the foreground. Ingredient labels, complete pastries within circular frames, layered shadows and CSS perspective provide discovery without numeric counters or swipe instructions. Selecting the active photograph opens its detail view.
2. **Les gourmandises.** All eight creations are visibly presented in a photo collection: two columns on phones, three from the tablet breakpoint and four on desktop. Cards reveal progressively and open the shared photo dialog. The collection replaces the previous single-photo tasting explorer; older source dates do not imply current availability.
3. **Un peu de culot.** `.culot-experience` replaces the three overlapping paper cards with eight frames travelling through a circular 3D orbit. A sticky stage sits inside 270 svh on phones and 280 svh on larger screens, subject to minimum heights. Native page scrolling drives the camera progression; no vertical scroll interception is required. Direct thumbnails, horizontal gestures and keyboard selection use the shortest circular path. Scroll movement continues relative to a manual choice rather than snapping back to an old bounded position. Pedestals, rings, layered words, ambient product colour and desktop pointer tilt reinforce depth. Reduced motion and no JavaScript present a static collection. This is CSS 3D photography, not reconstructed pastry models.
4. **Dans l’atelier.** “Le savoir-faire” and “L’équipe” change the real workshop photograph and caption in a stable 4:3 frame, with decoded crossfades and a sliding phone selector. Desktop also links the chapters to native scrolling beside a sticky image.
5. **Championnet / boutique.** A new photographic window opens with scroll-driven shutters. Two source photographs can be selected and enlarged in a complete-photo dialog. The adjacent address ticket provides copyable address, directions, phone and Instagram. The bottom mobile shortcut yields while this section or the orbit is in view, keeping local interactions unobstructed.

Content is centralised in `dist/content.js`; structure is in `dist/index.html`, presentation in `dist/style.css`, and behaviour in `dist/app.js`.

## Motion and interaction contract

- Present the actual EC monogram with the tracked lowercase brand name. Keep the photo curtain coordinated without a loading screen. Hero choices remain deliberate; idle floating never automatically changes the selected pastry.
- Keep the floating header and full-screen plum native-dialog menu usable with keyboard focus and Escape. Animated closure must still finish native dialog cleanup and focus restoration.
- The values ribbon and hero float only while relevant and visible; page visibility and the shared motion preference suspend decorative movement.
- Horizontal gestures distinguish direction before capture, preserve native vertical phone scrolling, and suppress accidental taps after a swipe.
- Product and shop view changes decode the incoming original before transitioning. Circular product previews may crop surrounding scenery, while the actual pastry stays whole. Detail dialogs show the complete original photograph by default; a deliberate detail view may enlarge it. Product changes reset zoom.
- Respect the operating system’s reduced-motion setting and the persistent global preference exposed by “Pause” and the footer control. Cancel active Web Animations as well as CSS loops. The orbit becomes a static collection and the shop shutters cease to obscure its photographs.
- Below-fold progressive reveals must not hide the first screen, no-JavaScript content or printed content.

## Identity evidence

The official [Instagram profile](https://www.instagram.com/etienneculotpatisserie/?hl=fr) supplies the EC monogram. The actual 746 × 746 profile image was downloaded as `dist/assets/brand-ec.jpg` and retained without retouching; the logo is not a generated SVG or a script-font reconstruction.

The announcement artwork shows fine editorial serif typography and an upright, widely tracked lowercase written name. The Instagram interface type is not evidence for the business’s typography. `dist/assets/cormorant.woff2` matches the preparation pack’s Cormorant Garamond Latin file; its SIL OFL license is included. This establishes the local font’s identity and license, not the exact font used in the announcement raster. The site uses it upright and treats the Manrope wordmark setting as a composition guided by that artwork.

## Photography and content

- Eight product originals, all 1440 px wide and 1734–1920 px high, come from official archive posts: [5 September](https://www.instagram.com/p/Dc5S23ziKEH/), [12 September](https://www.instagram.com/p/DdLR10kCBoB/), [26 September](https://www.instagram.com/p/Ddve2PyCHdF/), [3 October](https://www.instagram.com/p/DeBZIswCKwc/) and [24 October](https://www.instagram.com/p/De3gPjOCGGA/). The additions supply different colours, textures and shapes without inventing products.
- Workshop originals are 1600 × 1200, from [Le Dauphiné](https://www.ledauphine.com/economie/2026/08/26/on-va-aller-plus-loin-dans-la-creativite-le-patissier-etienne-culot-monte-en-gamme), credited to Clément Berthet.
- Two boutique originals come from the OCF supplier post; the principal view is 2016 × 1512. Preserve complete framing in the window and enlarged view.
- Circular product previews use a square `object-fit: cover` crop, preserving the pastry itself while trimming background and plate edges. Use `50% 65%` for the brioche (product index 1) and `50% 38%` for the tall tropézienne (index 6); other subjects use the centred crop. Keep all source files unchanged. Product detail dialogs and workshop photographs retain `object-fit: contain`. Do not invent missing angles, cross-sections, recipes, bestseller rankings or live availability.
- This remains an independent proposal. Photo permissions and business content require validation for a commercial launch; provenance is recorded in `SOURCES.txt`.

## Validation boundary

The preceding V5 was inspected at 320, 390, 600 and 1440 px. Verified eight-product access and viewer wrapping, native scroll after a manual orbit choice, direct choices, a horizontal gesture without accidental opening, both boutique views and enlargement, Escape and focus return, and reduced-motion restoration of card tab stops. Address copying was not triggered. These checks do not establish physical-device performance or universal browser accessibility. Reference links are provenance, not claims of an exact recreation.

The V6 logo, typography and circular framing require their own responsive visual check. Do not treat the earlier V5 checks as validation of those new changes.

V6 sizing refinement: hero photo discs reduced by about 10.7% (mobile75vw/298px maximum; desktop326px), with shorter stage spacing. The real logo retains its original proportions. Browser checks covered320/390/600/1440px, circular geometry, loaded746pxlogo, menu fit and complete-original detail viewing. No physical-device performance claim.
