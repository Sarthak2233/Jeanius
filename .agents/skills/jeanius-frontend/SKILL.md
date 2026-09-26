---
name: jeanius-frontend
description: Reproduce, extend, and maintain the frontend design system and UX patterns for Jeanius.
disable-model-invocation: true
---

# Jeanius Frontend Skill

## 1. Mission

Build frontend work that feels like the same product family as Jeanius rather
than a generic ecommerce template.

The reference site is a refined, editorial/minimal jewelry storefront. Its
information architecture combines:

- a persistent global brand/navigation shell;
- utility actions for search, login, and cart;
- content pages for About/Guide, Sizing, and Contact;
- an order-made (OM) product catalog;
- a Drop catalog with access/member gating;
- a Together/community area that can be externally linked or access-controlled;
- product detail pages with highly configurable made-to-order options;
- legal/footer information.

The public crawl shows the same header/navigation structure repeated across the
homepage, About/Guide, Sizing, Contact, and product pages. The product detail
experience includes product imagery, title, USD price, option selectors,
quantity/stock state, Buy Now/Add to Cart actions, descriptive content, reviews,
questions, and related products.

Do not copy the site mechanically. Reproduce its visual language, information
hierarchy, interaction principles, spacing discipline, and ecommerce behavior
while keeping implementation original.

---

# 2. Reference observations

## Global shell

The site consistently exposes:

- brand/logo link: `Jeanius`;
- `ABOUT/GUIDE`;
- `SHOP(OM)`;
- `DROP`;
- `TOGETHER`;
- `SIZING`;
- `CONTACT`;
- an `X` social link;
- Search;
- Log In;
- Cart.

The crawl also shows repeated versions of the navigation/header, which indicates
responsive or duplicated layout variants. Treat this as one logical navigation
system with desktop/mobile renderings, not as separate product concepts.

The homepage currently contains an operational notice about OM made-to-order
production, shipping timing, custom requests, option changes, and military-base
address restrictions. Notices of this kind should be implemented as a visually
distinct but restrained announcement/information block.

## Content architecture

Observed public pages:

- `/` — storefront/home shell and announcements;
- `/about` — About / Guide;
- `/sizing` — ring and wrist sizing guidance;
- `/contact` and `/contactt` — contact variants;
- `/hasspace` — HAS SPACE/community-style content;
- `/product/...` — product detail pages.

`/drop` and `/together` can currently redirect to a permission/login page, so
frontend implementations must support a member-gated state.

## Brand/content direction

The About/Guide describes the brand as handmade, one-on-one sterling silver
(925), based in South Korea, with worldwide shipping. The brand story emphasizes
strength, resilience, justice, intention, and authenticity.

The frontend should therefore communicate:

- premium but not flashy;
- handmade rather than mass-market;
- editorial rather than sales-heavy;
- monochrome/neutral unless actual product imagery supplies color;
- high contrast and clear typography;
- generous whitespace;
- product imagery as a primary visual asset;
- concise UI chrome around the product.

Do not turn this into a loud luxury-fashion landing page with gradients,
excessive shadows, oversized promotional badges, or decorative animations.

---

# 3. Design principles

## 3.1 Minimal editorial composition

Prefer:

- white/off-white or very light neutral page surfaces;
- black/dark text;
- thin borders;
- compact controls;
- large areas of negative space;
- strong alignment;
- restrained type scale;
- image-led product presentation.

Avoid:

- heavy card shadows;
- rounded-everything UI;
- excessive pill buttons;
- gradients;
- glassmorphism;
- large colored backgrounds;
- unnecessary decorative icons;
- autoplay video unless explicitly requested.

## 3.2 Product first

For commerce screens, the object being sold should dominate the visual hierarchy.

Desktop product detail:

1. image gallery / product media;
2. product identity;
3. price;
4. option configuration;
5. stock/quantity;
6. purchase actions;
7. product facts;
8. detailed description;
9. reviews/questions;
10. related products.

Do not bury product configuration beneath marketing content.

## 3.3 Functional restraint

Controls should look practical.

A selector should communicate:

- what is being selected;
- whether it is required;
- selected value;
- unavailable/sold-out values;
- any price delta;
- whether changing it changes the resulting product.

Avoid decorative controls that resemble buttons but have no obvious state.

---

# 4. Visual system

When exact CSS values are unavailable, use these as implementation targets,
not claims about the source site's literal CSS.

## 4.1 Color tokens

Use a restrained neutral palette:

```css
:root {
  --color-bg: #ffffff;
  --color-surface: #fafafa;
  --color-text: #111111;
  --color-text-muted: #6b6b6b;
  --color-text-subtle: #8a8a8a;
  --color-border: #dedede;
  --color-border-strong: #bdbdbd;
  --color-disabled: #a8a8a8;
  --color-inverse: #ffffff;
  --color-inverse-bg: #111111;
}
```

If the actual project already has a palette, preserve it rather than replacing
it. The key rule is neutrality and high legibility.

## 4.2 Typography

Use a clean grotesk/sans-serif system.

Recommended fallback:

```css
font-family:
  Inter,
  "Helvetica Neue",
  Helvetica,
  Arial,
  sans-serif;
```

For English text, ensure an English-capable system fallback:

```css
font-family:
  Inter,
  "Apple SD Gothic Neo",
  "Malgun Gothic",
  Arial,
  sans-serif;
```

Typography hierarchy:

- utility/navigation: small, compact, medium weight;
- page title: clear but not oversized;
- product title: prominent;
- price: visually strong but not oversized;
- body copy: readable and relatively relaxed line-height;
- metadata: smaller and muted;
- labels: concise and aligned with their control.

Do not use highly ornamental serif typography unless the actual project
specifically introduces it.

## 4.3 Borders

Prefer 1px neutral borders over shadows.

Use borders for:

- header separators;
- selectors;
- quantity controls;
- cart rows;
- product information sections;
- legal/content separators.

## 4.4 Radius

Use little or no radius by default.

If the implementation uses radius, keep it subtle:

```css
--radius-sm: 2px;
--radius-md: 4px;
```

Do not make the site look like a modern SaaS dashboard.

## 4.5 Spacing

Use an 8px base rhythm:

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
```

Large editorial sections can use 64–120px vertical spacing depending on viewport.

---

# 5. Layout system

## 5.1 Global container

Use a fluid page with a sensible max width.

Recommended:

```css
.page-container {
  width: min(100% - 32px, 1440px);
  margin-inline: auto;
}
```

For very wide editorial layouts, allow the media gallery to approach the viewport
edges while keeping text/control columns constrained.

## 5.2 Header

Desktop conceptual structure:

```text
┌──────────────────────────────────────────────────────────┐
│ brand       primary navigation                 utilities │
│             ABOUT / SHOP / DROP / ...       search login cart
└──────────────────────────────────────────────────────────┘
```

Required behaviors:

- brand is always a home link;
- navigation links have obvious hover/focus states;
- active route is distinguishable without excessive decoration;
- search opens/focuses a search interface;
- login navigates to authentication;
- cart shows current item count if applicable;
- header remains usable on narrow screens.

Do not make the header unnecessarily tall.

## 5.3 Mobile header

Collapse navigation into a compact mobile pattern.

Suggested structure:

```text
[menu]        HardihooderWW        [search] [cart]
```

The exact iconography may vary, but the actions must remain immediately
discoverable.

Use a drawer/overlay for the primary navigation. The drawer should include
all top-level routes and any secondary/social links.

## 5.4 Footer

Footer should remain quiet and informational.

Include:

- Terms of Use;
- Privacy Policy;
- company/legal information;
- owner/company name where appropriate;
- contact channel;
- copyright if used by the new implementation.

Do not turn the footer into a large marketing section.

---

# 6. Navigation and routing

Use route-aware navigation.

Suggested route model:

```ts
type NavItem = {
  label: string;
  href: string;
  external?: boolean;
  requiresAuth?: boolean;
};

const navigation: NavItem[] = [
  { label: "ABOUT/GUIDE", href: "/about" },
  { label: "SHOP(OM)", href: "/shop" },
  { label: "DROP", href: "/drop", requiresAuth: true },
  { label: "TOGETHER", href: "/together", requiresAuth: true },
  { label: "SIZING", href: "/sizing" },
  { label: "CONTACT", href: "/contact" },
  { label: "X", href: "EXTERNAL_URL", external: true },
];
```

Never hard-code route names throughout individual components.

Create a single navigation configuration.

---

# 7. Announcement / notice component

The homepage currently prioritizes a detailed OM ordering/shipping notice.
Implement notices as reusable components.

```ts
type Announcement = {
  id: string;
  title?: string;
  body: string;
  tone?: "neutral" | "warning" | "info";
  dismissible?: boolean;
  href?: string;
};
```

Visual rules:

- compact typography;
- strong readability;
- neutral background;
- optional thin border;
- preserve line breaks when the copy contains multiple operational rules;
- avoid aggressive alert colors unless there is a genuine danger/error state.

For long operational notices, consider:

- collapsible summary on mobile;
- expandable detail;
- link to About/Guide.

Do not hide critical purchase conditions behind an inaccessible interaction.

---

# 8. Product listing / shop UI

The OM catalog is a made-to-order shop. Product listing cards should be
minimal.

Recommended card:

```text
┌─────────────────────────────┐
│                             │
│        product image        │
│                             │
├─────────────────────────────┤
│ Product Name                │
│ 180.00 USD                  │
│ Made to order / status      │
└─────────────────────────────┘
```

Rules:

- use large product imagery;
- maintain consistent image ratios;
- avoid excessive card chrome;
- show price clearly;
- show availability when useful;
- use product name as a link;
- make the entire media/card area clickable if that improves usability;
- preserve accessible keyboard focus.

Responsive grid:

- desktop: 3–4 columns depending on viewport and image density;
- tablet: 2–3 columns;
- mobile: 2 columns only if images/text remain comfortably readable; otherwise 1.

Do not force a fixed 4-column grid on small screens.

---

# 9. Product detail page

The product detail page is the most important reusable frontend pattern.

## 9.1 Desktop composition

Use a two-region or gallery-plus-sidebar layout:

```text
┌───────────────────────────┬────────────────────────────┐
│                           │ Product title              │
│                           │ Price                      │
│     large image gallery   │ Shipping                   │
│                           │ Option selectors           │
│     additional images     │ Quantity / stock           │
│                           │ BUY NOW                    │
│                           │ ADD TO CART                │
│                           │                            │
│                           │ Product facts              │
└───────────────────────────┴────────────────────────────┘
```

The purchase/configuration column should remain easy to scan.

## 9.2 Product media

Observed product pages can contain many images, so the media component must
support:

- multiple images;
- large primary image;
- thumbnails or selectable media;
- keyboard navigation;
- alt text;
- loading/lazy loading;
- zoom/lightbox if desired;
- responsive stacking.

Suggested component:

```tsx
<ProductGallery
  images={product.images}
  aspectRatio="1 / 1"
  fit="contain"
/>
```

For jewelry photography, avoid aggressive `object-fit: cover` cropping unless
the source art direction requires it.

## 9.3 Product identity

```text
Hardihooder Snake Bracelet S Clasp
500.00 USD
Shipping -
```

Use a compact hierarchy:

- title;
- price;
- shipping information;
- optional SKU/availability metadata.

Do not insert unnecessary ratings above the purchase controls.

---

# 10. Product option architecture

The reference product experience can expose multiple dependent options, such as:

- Ring Size (US);
- Wrist Size (inch);
- Chaintype;
- Polishing.

The agent must treat options as structured state rather than unrelated dropdowns.

```ts
type ProductOption = {
  id: string;
  label: string;
  type: "select" | "radio" | "swatch";
  required: boolean;
  values: ProductOptionValue[];
};

type ProductOptionValue = {
  id: string;
  label: string;
  available: boolean;
  priceDelta?: number;
};
```

Use:

```ts
const selectedOptions: Record<string, string> = {};
```

Validate required options before purchase.

## 10.1 Selectors

Every selector must have:

- visible label;
- selected value;
- placeholder;
- unavailable state;
- focus state;
- keyboard support;
- validation message.

Example:

```text
Ring Size (US)
[ Please choose an option. ▼ ]
```

If a value is unavailable:

```text
5     Sold Out
6     Sold Out
7     Sold Out
```

Visually distinguish unavailable options but do not make disabled text unreadable.

## 10.2 Dependent options

Some combinations may be unavailable even when each individual value is
available.

Implement combination-aware availability:

```ts
isAvailable({
  wristSize: "7",
  chaintype: "Logo",
  polishing: "High",
});
```

When a selection invalidates another option:

1. preserve the valid selection where possible;
2. mark incompatible values unavailable;
3. explain the dependency;
4. never silently submit an invalid combination.

---

# 11. Quantity and inventory states

Observed product pages expose:

- quantity;
- total price;
- Out of Stock;
- Buy Now;
- Add to Cart.

Implement a reusable state machine:

```ts
type PurchaseState =
  | "available"
  | "requires-options"
  | "out-of-stock"
  | "loading"
  | "error";
```

Examples:

### Available

```text
Quantity   [-] 1 [+]
Total price 500 USD

[ BUY NOW ]
[ ADD TO CART ]
```

### Missing options

```text
Please choose Ring Size.
```

Keep purchase actions disabled until required configuration is complete.

### Out of stock

Show:

```text
Out of Stock
```

Disable purchase actions and optionally offer:

```text
Notify me when available
```

The reference product page also exposes a restock notification form with a phone
number input. If implemented, validate and clearly label the field.

---

# 12. Purchase actions

The two primary actions are:

- `BUY NOW`
- `ADD TO CART`

Rules:

- Buy Now should lead directly into checkout/purchase flow;
- Add to Cart should update cart state without unexpectedly navigating away;
- show clear success feedback;
- preserve selected configuration;
- show the exact configured item in cart;
- prevent double submission;
- support loading state;
- surface API/payment errors without destroying selections.

Do not use ambiguous copy such as “Continue” for a purchase action.

---

# 13. Product information sections

The product page includes concise product facts such as:

- width;
- material;
- handmade status;
- polishing note;
- sizing recommendation;
- made-to-order status;
- link/reference to production and shipping guidance.

Model these as structured facts:

```ts
const facts = [
  ["Width", "15mm Cuban Link"],
  ["Material", "Silver925 (Sterling Silver)"],
  ["Craft", "Handmade Sterling Silver"],
];
```

Then render a reusable information block.

For detailed description content, support:

- headings;
- paragraphs;
- links;
- images;
- lists;
- localized text.

Keep content width readable rather than spanning the entire viewport.

---

# 14. Reviews, questions, and related products

The observed product page has sections/tabs for:

- detailed description;
- reviews;
- questions;
- related products.

Implement these as modular sections:

```tsx
<ProductTabs
  tabs={[
    { id: "description", label: "Description" },
    { id: "reviews", label: "Reviews" },
    { id: "questions", label: "Questions" },
  ]}
/>
```

Rules:

- selected tab has a clear visual state;
- tab changes should not unexpectedly reset product options;
- deep-linking to a tab is useful;
- on mobile, tabs may become an accordion if horizontal space is insufficient.

Related products should use the same product-card language as the catalog.

---

# 15. Content pages

## About / Guide

The About/Guide page is information-heavy and should feel editorial.

Recommended structure:

```text
ABOUT HARDIHOODER
[brand story]

SHIPPING
[shipping overview]

SHOP (OM — Order Made)
[production / shipping rules]

DROP (Non order made)
[shipping / refund rules]

RETURN / EXCHANGE / REFUND
[policy sections]
```

Use:

- strong section headings;
- readable paragraph width;
- generous vertical spacing;
- clear links to relevant shopping areas;
- no oversized hero graphics unless assets exist.

## Sizing

The sizing page provides ring and wrist sizing guidance and imagery.

Use:

```text
RING SIZE
short explanatory text
[large sizing image]

WRIST SIZE
[large sizing image]
```

Images should be responsive and never overflow horizontally.

Provide descriptive alt text.

## Contact

Contact is deliberately simple.

Support:

- Instagram Direct Message;
- email;
- explanatory restrictions around which requests are accepted.

Do not invent a complex contact form if the business does not use one.

---

# 16. Access-controlled pages

The current `/drop` and `/together` routes can return a permission page saying
the user must log in and that the page is limited to a specific member level.

Implement an explicit access state:

```tsx
<ProtectedPage
  requiresAuth
  requiredRole="member"
/>
```

States:

1. unauthenticated;
2. authenticated but insufficient permission;
3. authorized;
4. loading;
5. error.

Unauthenticated:

```text
Please log in before using it.

[ GO TO LOGIN ]
```

Do not leak protected product/content data into the HTML or client bundle if
the backend considers it private.

---

# 17. Search

The global shell exposes search.

Search requirements:

- trigger from header;
- focus input immediately;
- support Enter;
- support Escape;
- show loading state;
- show empty state;
- show no-results state;
- preserve query in URL when appropriate;
- make result items keyboard accessible.

Suggested mobile behavior:

```text
[ Search products...                     ]
```

Results should use the same product cards as the catalog.

---

# 18. Authentication

The global navigation exposes Log In / 로그인.

Frontend must support:

- unauthenticated navigation;
- login loading state;
- authentication errors;
- successful redirect;
- logout;
- session restoration;
- protected route handling.

Do not expose sensitive account details in the header.

---

# 19. Cart

Cart UI must support:

```ts
type CartLine = {
  productId: string;
  title: string;
  image?: string;
  quantity: number;
  unitPrice: number;
  selectedOptions: Record<string, string>;
};
```

Cart line should clearly display configured options because made-to-order products
can have many variants.

Required states:

- empty cart;
- populated cart;
- updating;
- item removed;
- unavailable item;
- pricing error;
- checkout unavailable;
- network error.

Show totals with currency formatting.

Do not silently change a configured item's options.

---

# 20. Internationalization

The observed UI mixes English and Korean labels, for example:

- `LOG IN 로그인`;
- `Search 검색`;
- `Cart 장바구니`.

Support localization without embedding translations directly in JSX.

```ts
const messages = {
  en: {
    login: "Log In",
    cart: "Cart",
    search: "Search",
  },
  ko: {
    login: "로그인",
    cart: "장바구니",
    search: "검색",
  },
};
```

If bilingual labels are intentionally part of the design, render both in a
consistent typographic hierarchy.

Do not randomly mix languages.

---

# 21. Responsive behavior

Design mobile-first, then enhance.

## Breakpoints

Use project-native breakpoints when available. Otherwise:

```css
--bp-sm: 640px;
--bp-md: 768px;
--bp-lg: 1024px;
--bp-xl: 1280px;
```

## Mobile rules

- collapse global nav;
- keep brand visible;
- keep search/cart accessible;
- stack product information under the gallery;
- make option controls full-width;
- make purchase buttons large enough for touch;
- reduce horizontal padding;
- keep images edge-to-edge where appropriate;
- avoid tiny metadata;
- convert multi-column content to one column;
- ensure long notices remain readable.

## Tablet

Use intermediate layouts rather than simply choosing desktop or mobile.

## Desktop

Allow generous negative space and larger media.

---

# 22. Interaction and motion

The site language should feel calm.

Use only subtle transitions:

```css
transition:
  color 160ms ease,
  background-color 160ms ease,
  border-color 160ms ease,
  opacity 160ms ease,
  transform 160ms ease;
```

Acceptable:

- image hover opacity;
- subtle underline;
- drawer slide/fade;
- modal fade;
- cart success feedback.

Avoid:

- bouncing UI;
- springy ecommerce cards;
- parallax everywhere;
- scroll-jacking;
- aggressive page transitions.

Respect:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

# 23. Accessibility

Accessibility is part of the visual implementation.

Required:

- semantic landmarks;
- one logical `h1` per page;
- correct heading hierarchy;
- visible keyboard focus;
- labels for every input;
- alt text for product images;
- `aria-current` for active navigation;
- `aria-expanded` for menus;
- `aria-live` for cart/async feedback;
- disabled controls must be understandable;
- sufficient text contrast;
- minimum touch targets around 44×44px;
- keyboard-accessible product gallery;
- no color-only stock indicators.

Example focus:

```css
:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 3px;
}
```

Do not remove browser focus outlines without replacing them.

---

# 24. Image strategy

Jewelry product photography is a core part of the experience.

Rules:

- serve responsive image sizes;
- use modern formats where supported;
- provide width/height or aspect-ratio to prevent layout shift;
- lazy-load below-the-fold media;
- eagerly load the main product image;
- use meaningful alt text;
- do not upscale small source images unnecessarily.

Recommended:

```css
.product-media {
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: #f7f7f7;
}

.product-media img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
```

Use `cover` only when the intended art direction requires cropping.

---

# 25. Loading, empty, and error states

Every data-driven component must define all states.

## Product grid

```text
Loading → skeleton
Success → product grid
Empty → “No products found”
Error → retry message
```

## Product detail

```text
Loading → gallery + metadata skeleton
Success → full product
Not found → product unavailable page
Error → retry
```

## Protected route

```text
Loading → access skeleton
Unauthorized → login CTA
Forbidden → permission message
Success → content
```

Skeletons should use subtle neutral blocks, not colorful placeholders.

---

# 26. Component architecture

Recommended component tree:

```text
App
├── SiteHeader
│   ├── Brand
│   ├── DesktopNav
│   ├── MobileNav
│   ├── SearchTrigger
│   ├── AuthAction
│   └── CartAction
├── AnnouncementBanner
├── PageContainer
│   └── RouteContent
├── SiteFooter
└── GlobalOverlays
    ├── SearchOverlay
    ├── CartDrawer
    ├── LoginModal/Page
    └── MobileNavDrawer
```

Commerce:

```text
ShopPage
├── ShopHeader
├── Filter/SortControls (only if required)
└── ProductGrid
    └── ProductCard

ProductPage
├── ProductGallery
├── ProductPurchasePanel
│   ├── ProductIdentity
│   ├── Price
│   ├── Shipping
│   ├── ProductOptionGroup[]
│   ├── QuantityControl
│   ├── PurchaseActions
│   └── StockState
├── ProductFacts
├── ProductDescription
├── ProductTabs
└── RelatedProducts
```

Content:

```text
AboutGuidePage
├── BrandStory
├── ShippingGuide
├── OMGuide
├── DropGuide
└── ReturnPolicy

SizingPage
├── RingSizing
└── WristSizing

ContactPage
└── ContactMethods
```

---

# 27. Data architecture

Separate content from presentation.

Example:

```ts
type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  currency: "USD";
  images: ProductImage[];
  options: ProductOption[];
  stockStatus: "available" | "sold-out" | "preorder";
  madeToOrder: boolean;
  shippingNote?: string;
  facts: ProductFact[];
  description: RichText;
};
```

Never write product-specific option logic inside a generic button component.

Use configuration-driven rendering.

---

# 28. Forms and validation

For all ecommerce forms:

- validate on submit;
- provide useful inline feedback;
- preserve user selections after validation failure;
- do not clear the form on API failure;
- show field-specific errors;
- prevent double submission.

For option validation:

```ts
function validateProductSelection(
  product: Product,
  selection: Record<string, string>,
) {
  const errors: Record<string, string> = {};

  for (const option of product.options) {
    if (option.required && !selection[option.id]) {
      errors[option.id] = `${option.label} is required.`;
    }
  }

  return errors;
}
```

---

# 29. SEO and metadata

Each product page should have:

- unique title;
- unique description;
- canonical URL;
- product structured data where appropriate;
- Open Graph metadata;
- social image;
- meaningful headings.

Content pages should also have unique metadata.

Do not expose member-only content through SEO metadata.

---

# 30. Performance

Target:

- minimal JS for static content;
- responsive images;
- route-level code splitting;
- lazy-loaded secondary galleries;
- no layout shift;
- fast initial header rendering;
- server rendering/static generation where the framework supports it;
- avoid shipping an icon library if only a few icons are used.

For ecommerce, prioritize:

1. main product image;
2. product title/price;
3. option controls;
4. purchase actions;
5. secondary media.

---

# 31. Implementation rules for an agent

When modifying this project:

1. Inspect existing routes, components, styles, and tokens before creating new
   ones.
2. Reuse existing primitives before introducing another button/input/card style.
3. Keep the global header/footer consistent across every route.
4. Treat product configuration as data/state, not page-specific markup.
5. Preserve bilingual labels when they are part of the existing UI.
6. Preserve the minimalist neutral visual language.
7. Prefer borders and whitespace over shadows and decorative effects.
8. Make every ecommerce state explicit: loading, available, unavailable,
   sold-out, error, success.
9. Keep protected/member content behind the appropriate access boundary.
10. Never hard-code sensitive credentials, customer data, or payment information.
11. Do not change business policies or shipping/refund terms merely to improve UX;
    present the configured business rules clearly.
12. If a requested visual change conflicts with the established system, prefer
    the established system unless the user explicitly asks for a redesign.

---

# 32. Definition of done

A frontend task matching this skill is complete only when:

### Visual
- [ ] neutral editorial aesthetic is preserved;
- [ ] spacing is consistent;
- [ ] typography hierarchy is coherent;
- [ ] borders/shadows follow the restrained system;
- [ ] product imagery is prominent;
- [ ] desktop and mobile layouts are intentionally designed.

### Navigation
- [ ] global header works at every viewport;
- [ ] active route is clear;
- [ ] search/login/cart are accessible;
- [ ] mobile navigation works;
- [ ] external links are identified appropriately.

### Commerce
- [ ] product cards are consistent;
- [ ] product gallery is responsive;
- [ ] required options validate;
- [ ] unavailable values are clear;
- [ ] quantity and totals update correctly;
- [ ] Buy Now/Add to Cart states work;
- [ ] out-of-stock state works;
- [ ] configured options persist into cart.

### Content
- [ ] About/Guide hierarchy is readable;
- [ ] sizing images are responsive;
- [ ] contact information is easy to find;
- [ ] legal links are present.

### Access
- [ ] protected routes have loading/unauthorized/forbidden states;
- [ ] private data is not leaked.

### Accessibility
- [ ] keyboard navigation works;
- [ ] focus states are visible;
- [ ] form controls have labels;
- [ ] images have useful alt text;
- [ ] contrast is sufficient;
- [ ] reduced motion is respected.

### Performance
- [ ] main images are optimized;
- [ ] below-fold media is lazy loaded;
- [ ] no avoidable layout shift;
- [ ] no unnecessary client-side JavaScript.

---

# 33. Anti-patterns

Never introduce these unless the user explicitly requests a redesign:

- colorful SaaS-style dashboards;
- excessive gradients;
- glass cards;
- huge rounded pills;
- excessive drop shadows;
- oversized animated CTAs;
- generic Bootstrap-looking product cards;
- random font combinations;
- inconsistent button shapes;
- arbitrary icon substitutions;
- inaccessible custom dropdowns;
- hidden stock/availability information;
- destructive navigation after Add to Cart;
- fake testimonials/reviews;
- invented shipping/refund policies;
- exposing protected Drop/Together content;
- hard-coded product-option combinations;
- replacing real product photography with generic stock imagery.

---

# 34. Quick visual checklist

Before shipping, compare the implementation against this mental model:

```text
MINIMAL
──────────────
Brand
Navigation                         Search / Login / Cart
──────────────────────────────────────────────────────

[ operational notice / concise information ]

                     PRODUCT / CONTENT
       generous whitespace + strong image hierarchy

──────────────────────────────────────────────────────
quiet informational footer
```

For product pages:

```text
IMAGE GALLERY              PRODUCT CONFIGURATION
                           title
                           price
                           shipping
                           option 1
                           option 2
                           option 3
                           quantity
                           BUY NOW
                           ADD TO CART

PRODUCT FACTS
DESCRIPTION
REVIEWS / QUESTIONS
RELATED PRODUCTS
```

If a new component does not visually fit these structures, refactor it before
adding more styling.

---

# 35. Source-of-truth note

This skill is derived from public inspection of HardihooderWW pages and product
content. The public crawler confirmed the global navigation, content routes,
sizing layout, About/Guide information architecture, protected-route behavior,
and detailed product purchase structure.

Some pages are currently member/password protected and some product URLs can
become unavailable; therefore exact pixel dimensions, private content, hidden
inventory, and implementation-level CSS must not be assumed from this skill.

When working against the actual codebase, prefer the repository's existing
tokens/components/assets over these fallback recommendations.

