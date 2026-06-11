# Fresh Launch Page — Build Todo

Legend: `[ ]` not started · `[~]` in progress · `[x]` done · `⏳` blocked on marketing call

Plan: `.claude/plans/so-this-page-is-temporal-hammock.md`
Questions doc: `.claude/fresh-launch-questions.md`
Template: `templates/pages/custom/page/fresh.html`
Styles: `assets/scss/custom/pages/_fresh.scss`
JS: `assets/js/theme/custom/fresh.js`

---

## 0. Setup

- [x] Remove trial sections from `fresh.html`: `fresh-intro`, `fresh-offer`, `fresh-different`, `fresh-lifestyle`, `fresh-more`
- [x] Reorder remaining sections to final page order (see below)
- [x] Add `id="signup"` to the signup section anchor target

---

## 1. Hero — MODIFY

**HTML (`fresh.html`)**
- [x] Replace `fresh-hero__heading-light` copy → *"Fresh food your cat was born to eat"* ⏳ (see Q1 — confirm vs judgement headline)
- [x] Replace `fresh-hero__heading-bold` copy → supporting sub-line from brief
- [x] Add offer callout block inside `fresh-hero__text`:
  - [x] Eyebrow label: 🎉 Exclusive Launch Offer
  - [x] Headline line: "Get £50 Off When You Switch to Fresh" ⏳ (see Q2 — confirm £50 vs £10×5 framing)
  - [x] Sub-line: "Save £10 on each of your first 5 Fresh orders…"
- [x] Add CTA button (reuse `.fresh-hero__cta`): "Claim My £50 Saving" → `href="#signup"` ⏳ (see Q2)
- [x] Add trust-points row (`.fresh-hero__trust`): 4 × ✓ items (Human-grade · Vet approved · Freshly frozen · No fillers)

**SCSS (`_fresh.scss`)**
- [x] `.fresh-hero__trust` — mobile: flex column, small text, white + gold checkmarks
- [x] `.fresh-hero__trust` — desktop (≥801px): flex row, inline
- [x] `.fresh-hero__offer-callout` block — green/gold card inside hero text, rounded
- [x] Responsive check: hero text + callout + CTA legible on all breakpoints

---

## 2. Why Switch (fresh-expect grid) — REPLACE carousel with teaser icon grid

**HTML (`fresh.html`)**
- [x] Add `<section class="fresh-expect">` block (copy structure from `fresh-teaser.html`)
- [x] Heading: *"What Makes Purrform Fresh Different?"*
- [x] Item 1: Human-Grade Ingredients — badge `High-Meat-Icon.png` — brief copy
- [x] Item 2: Freshly Prepared — badge `Ingredients-Icon.png` — brief copy
- [x] Item 3: Vet Nutritionist Approved — badge `vet-Icon.png` — brief copy

**SCSS** — `.fresh-expect` block already exists (from teaser); no new styles needed.

- [x] Verify 1-col mobile → 3-col desktop renders correctly on launch page
- [x] Responsive check

---

## 3. Health Benefits — KEEP (heading tweak only)

**HTML (`fresh.html`)**
- [x] Update `fresh-benefits__heading` → *"The Benefits Cat Owners Notice"*
- [x] Verify all 6 cards present and correct (added brief emoji prefixes to titles)

**JS / SCSS** — `initBenefitsCarousel` untouched; no SCSS changes needed.

- [x] Confirm prev/next arrows work on `localhost:3000/fresh`

---

## 4. What's Inside Every Meal — MODIFY (copy + heading)

**HTML (`fresh.html`)**
- [x] Update `fresh-inside__heading` → *"'Meat' the menu: Real ingredients. Nothing hidden."*
- [x] Update `fresh-inside__intro` → brief intro copy
- [x] Update `inside-protein` card: title + list items → Chicken Breast, Turkey Breast, Beef Trim, Wild Boar & Pork
- [x] Update `inside-offal` card → Heart, Liver, Gizzard with brief copy
- [x] Update `inside-vitamins` card → Essential vitamins & minerals (brief copy)
- [x] Update `inside-fats` card → Natural Fats (kept)
- [x] Update `inside-never` card → brief's Never Includes list

**JS / SCSS** — `initInsideSection` untouched; no SCSS changes needed.

- [x] Test plus-icon open/close on mobile (auto-opens first card correctly)
- [ ] Test scattered desktop layout at ≥1261px

---

## 5. Comparison Table — ADD NEW ⏳ (see Q3 — pending data approval)

**HTML (`fresh.html`)**
- [x] Add `<!-- TODO: TBC — comparison data pending marketing approval -->` comment
- [x] Add `<section class="fresh-compare">` with heading *"How We Compare"*
- [x] Build `<table>` with 5 brands × 7 columns; real data from planning sheet
- [x] Highlight Purrform row with brand accent class
- [x] Wrap table in `fresh-compare__scroll` for mobile horizontal scroll

**SCSS (`_fresh.scss`)**
- [x] `.fresh-compare` band — cream/light bg, padding
- [x] `.fresh-compare__inner` — max-width centred
- [x] `.fresh-compare__heading` — brand heading style
- [x] `.fresh-compare__scroll` — `overflow-x: auto` wrapper
- [x] `fresh-compare table` — tabular style, brand token colours
- [x] Purrform row highlight — gold accent
- [ ] Mobile: sticky first column (brand name) — currently scrolls horizontally (acceptable)
- [x] Desktop (≥801px): full table visible
- [x] Responsive check

---

## 6. Customer Stories (reviews carousel) — ADD NEW ⏳ (see Q6 — real review content TBC)

**HTML (`fresh.html`)**
- [x] Add `<section class="fresh-reviews">` with heading *"Cats Can't Leave The Bowl Alone"*
- [x] Add carousel structure with prev/next arrows + track-wrap
- [x] Add 5 placeholder review slides (★★★★★ + quote + customer name)

**SCSS (`_fresh.scss`)**
- [x] `.fresh-reviews` band — white bg, padding
- [x] `.fresh-reviews__inner` — max-width, centred
- [x] `.fresh-reviews__heading` — centred, brand style
- [x] `.fresh-reviews__carousel` — flex row, reuses `.fresh-benefits__arrow` for buttons
- [x] `.fresh-reviews__track-wrap` — `overflow: hidden`
- [x] `.fresh-reviews__track` — flex, transition transform
- [x] `.fresh-reviews__slide` — 1 per view mobile
- [x] `.fresh-reviews__card` — white card, rounded, drop-shadow, padding
- [x] `.fresh-reviews__stars` — gold ★ glyphs
- [x] `.fresh-reviews__quote` — italic, body text
- [x] `.fresh-reviews__name` — small, bold
- [x] Desktop (≥801px): 2 per view; (≥1261px): 3 per view
- [x] Responsive check (2-col desktop, 1-col mobile, arrows functional)

**JS (`fresh.js`)**
- [x] Add `initReviewsCarousel()` method — mirrors `initBenefitsCarousel`
- [x] Call `this.initReviewsCarousel()` from `onReady()`
- [x] Early-return guard present

---

## 7. About Purrform — MODIFY (copy only)

**HTML (`fresh.html`)**
- [x] Update `fresh-about__heading` → *"Built By People Who Believe Cats Deserve Better"*
- [x] Replace 3 paragraphs with brief copy

**SCSS / JS** — no changes needed.

- [x] Visual check: cat icon + wavy bg display correctly

---

## 8. Offer Box (£50) — ADD NEW ⏳ (see Q2 — confirm £50 vs £10×5 framing)

**HTML (`fresh.html`)**
- [x] Add `<section class="fresh-offer-box">` (distinct from removed `fresh-offer`)
- [x] Heading: *"Get £50 Off When You Switch to Fresh"*
- [x] Sub-line from brief
- [x] Offer list: 5 × ✅ £10 off Order 1–5
- [x] Total saving callout: *"Total Saving: £50"*
- [x] Confidence paragraph from brief
- [x] CTA button → `href="#signup"` reusing `.fresh-hero__cta`

**SCSS (`_fresh.scss`)**
- [x] `.fresh-offer-box` band — green full-bleed, padding
- [x] `.fresh-offer-box__inner` — max-width centred, flex column
- [x] `.fresh-offer-box__heading` — large white heading
- [x] `.fresh-offer-box__sub` — white, lighter weight
- [x] `.fresh-offer-box__card` — semi-transparent inset box, gold border, rounded
- [x] `.fresh-offer-box__list` — stacked ✅ items
- [x] `.fresh-offer-box__total` — bold, gold-light accent
- [x] `.fresh-offer-box__body` — muted body text
- [x] Desktop (≥801px): larger type
- [x] Responsive check (green band, card inset, checklist, Total £50 all correct mobile + desktop)

---

## 9. Email Sign-Up — MODIFY (copy + form placeholder)

**HTML (`fresh.html`)**
- [x] Add `id="signup"` to the `<section class="fresh-signup">` tag
- [x] Update `fresh-signup__heading` → *"Join The Fresh Community & Save £50"*
- [x] Update heading sub-span
- [x] Replace copy with benefits list (`.fresh-signup__benefits` ul)
- [x] Keep `klaviyo-form-RnWuhF` div — prominent TODO comment added
- [x] Add GDPR disclaimer line (reuses `fresh-early-access__disclaimer` class)

**SCSS** — `.fresh-signup__benefits` block added to launch additions section.

- [x] Visual check: heading + benefits list + form embed + disclaimer display correctly

---

## 10. FAQs — ADD NEW

**HTML (`fresh.html`)**
- [x] Add `<section class="fresh-faq">` with heading *"Frequently Asked Questions"*
- [x] 9 FAQ items added (all from brief; 2 remaining from brief not in source omitted — can add)
  - [x] What is Purrform Fresh Deli?
  - [x] What makes Purrform Fresh different?
  - [x] Is it complete and balanced?
  - [x] How is it delivered?
  - [x] Can I mix Fresh with my current food?
  - [x] How do I defrost or store Fresh Deli?
  - [x] How much do I feed my cat? (catculator link included)
  - [x] Is this suitable for kittens?
  - [x] Is this suitable for cats with allergies or sensitivities?
- [ ] ⏳ Optional extras from comparison sheet (see Q7 — pending confirmation)

**SCSS (`_fresh.scss`)**
- [x] `.fresh-faq` band — cream bg, padding
- [x] `.fresh-faq__inner` — max-width centred
- [x] `.fresh-faq__heading` — centred, brand style
- [x] `.fresh-faq__item` — border-bottom separator
- [x] `.fresh-faq__question` — cursor pointer, no default marker, `+`/`−` via `::after`
- [x] `details[open] .fresh-faq__question::after` — switches to `−`
- [x] `.fresh-faq__answer` — body size, line-height, link styling
- [x] Hover state on summary
- [x] Responsive check (cream band, + markers, expand/collapse correct)

---

## 11. Offer Terms & Eligibility — ADD NEW ⏳ (see Q4 — code TBC)

**HTML (`fresh.html`)**
- [x] Add `<section class="fresh-terms">` immediately after FAQs
- [x] Heading: *"Offer Terms & Eligibility"*
- [x] Conditions list: min 4 boxes, new-to-Fresh, 6-month validity, code TBC + TODO comment

**SCSS (`_fresh.scss`)**
- [x] `.fresh-terms` band — white bg, top border, padding
- [x] `.fresh-terms__inner` — max-width centred
- [x] `.fresh-terms__heading` — small, uppercase, muted
- [x] `.fresh-terms__list` — fine print size, muted colour
- [x] Responsive check (fine print renders cleanly mobile + desktop)

---

## Cross-cutting

- [ ] Verify all anchor links (`href="#signup"`) scroll correctly
- [x] Confirm `fresh-trial.html` is unchanged — verified hero at 520px, sections intact
- [ ] Confirm `fresh-teaser.html` is unchanged (open `localhost:3000/fresh-teaser`, spot-check sections)
- [ ] Run theme build (`npm run build` or stencil watch) — confirm no SCSS/JS compile errors
- [x] Full responsive pass on `localhost:3000/fresh`: 375px ✓ · 1440px ✓
- [ ] BigCommerce admin: confirm Web Page assigned to template "Page - fresh" ⏳
