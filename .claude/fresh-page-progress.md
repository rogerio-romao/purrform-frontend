# Fresh Landing Page — Build Progress

Plan: ~/.claude/plans/in-this-page-we-bright-simon.md
Page template: templates/pages/custom/page/fresh.html
Styles: assets/scss/custom/pages/_fresh.scss

Legend: [ ] not started · [~] in progress · [x] approved

## Sections (mobile → desktop per section)

- [x] 1. Hero (sage-green band, headline + lifestyle photo)
  - [x] mobile
  - [x] desktop
- [x] 2. Intro copy (cream bg, single paragraph)
  - [x] mobile
  - [x] desktop
- [~] 3. Exclusive Early Bird Offer (green card, two gold CTAs, bird/tree art)
  - [~] mobile
  - [ ] desktop
- [ ] 4. About Purrform (green band, cat icon + copy)
  - [ ] mobile
  - [ ] desktop
- [ ] 5. What Makes Purrform Fresh Different (3 gold-border cards w/ badge PNGs)
  - [ ] mobile
  - [ ] desktop
- [ ] 6. Health Benefits of Fresh Cat Food (green band, 2 cards, scroll-snap on mobile)
  - [ ] mobile
  - [ ] desktop
- [ ] 7. What's Inside Every Meal (cream bg, pouch + callout pills)
  - [ ] mobile
  - [ ] desktop
- [ ] 8. And that's not all... (green band, 4-pack row, support line)
  - [ ] mobile
  - [ ] desktop
- [ ] 9. £25 Trial Pack signup form (gold band, Klaviyo embed)
  - [ ] mobile
  - [ ] desktop

## Deferred / pending input

- [ ] Top trust-pill row ("Made with love in the UK" / "Natural Ingredients & Grain Free" / "Recommended by Vets")
- [x] Klaviyo form ID for the £25 trial signup → `klaviyo-form-RnWuhF`
- [ ] Final lifestyle / product / illustration assets → drop into assets/img/fresh/
- [ ] BigCommerce admin: confirm a Web Page is assigned to template "Page - fresh"

## Notes

- Scoping class: `.fresh-page` (all SCSS lives under this)
- Tokens: `$marketing-brand-bg`, `$color-brand-primary`, `$color-brand-dark`, `$color-gold`, `$color-gold-light`, `$marketing-brand-text`, `$marketing-brand-radius`, `$marketing-brand-transition`
- Full-bleed bands: `width: 100vw; margin-left: calc(-50vw + 50%);`
- Badge PNGs: `assets/img/badges/100-human-grade.png`, `finest-ingredients.png`, `vet-approved.png`
