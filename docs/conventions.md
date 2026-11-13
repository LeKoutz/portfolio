# Conventions: Portfolio

Frontend design should follow [penpot](https://design.penpot.app/?screen=viewer&file-id=b4b906dd-9024-819c-8008-f06245427fab&page-id=504a244f-bd15-8073-8008-f06f41a7e38f&section=interactions&index=0&share-id=b835a5b8-80cb-494f-a4fa-2d1b6cd7a738).

## Branches, pull requests and commits

- Branch off the latest `dev`. Name the branch `<issue-number>-<short-title>`, for
  example `12-project-card`.
- Open a pull request into `dev` and ask for a review. PR title: `(#N) - Title`, where N
  is the issue number.
- While the work is in progress, commit freely.
- When it's done, squash the commits into one, with this message:

  ```
  Resolves #N - 1 line description

  - A few bullet points
  - describing what changed
  ```

## CSS

The full reasoning is in ADR decision 9.

- Colors, spacing, radius and fonts come only from the custom properties in
  `tokens.css`. No raw hex values or pixel spacing in component CSS.
- Mobile first: base styles for phones, then `@media (min-width: 768px)` for desktop.
- Layout and spacing use the property classes in `utilities.css` (`.flex`, `.gap-2`).
  Add a utility only when a second place needs it.
- Each component has one class (`.card`), with element classes for its parts
  (`.card__title`).
- Variants are `data-` attributes that only set the component's own custom properties
  (`.tag[data-category="tool"]`). No modifier classes that repeat the same rules.

## JavaScript

- Each component the JS builds is one render function (`renderCard(repo)`), so its
  markup is written in one place.
- Every link gets `target="_blank"` and `rel="noopener"` (ADR decision 8).
