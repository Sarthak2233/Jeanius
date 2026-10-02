Jeanius & Jewl — FULL PRODUCT SPECIFICATION
Research-backed product specification for rebuilding and extending the frontend + commerce platform
Document status: Product/engineering specification
Research basis: public Jeanius & Jewl atelier documentation and commerce requirements.
Important: This document describes the product experience, dual-vertical catalog (handmade raw denim and handcrafted artisan jewellery), hidden inventory, private Drop/Together content, payment provider configuration, and administrator workflows.
1. Executive Summary
Jeanius & Jewl is an international direct-to-consumer atelier storefront uniting handmade raw denim and handcrafted precious metal jewellery. The primary commercial model is OM (Order Made): a customer selects a denim garment or jewellery piece and one or more physical/customization options (fit, waist, inseam, ring size, metal alloy, finish, engraving), places an order, and bespoke workshop production begins after payment. The site also defines a separate DROP model for small-batch, numbered, ready-to-ship products (denim jackets, sculptural brass cuffs, accessories).
The experience is intentionally editorial and minimal: product photography and product configuration dominate the interface, while brand story, sizing, shipping, return/refund rules, and contact information reduce purchase uncertainty.
The site therefore combines five systems: (1) brand/content website, (2) dual-vertical product catalog, (3) configurable ecommerce, (4) member/access-control layer, and (5) order/fulfillment/customer-support operations.
2. Product Goals
Sell handmade raw denim and handcrafted artisan jewellery worldwide with a premium, minimal brand presentation.
Support made-to-order products whose configuration affects workshop manufacturing and fulfillment (tailor and metalsmith benches).
Clearly communicate production times, shipping expectations, and restrictive return/refund rules before purchase.
Allow ready-to-ship DROP products to operate under different inventory and refund rules.
Support protected/member-only experiences such as DROP and TOGETHER.
Give customers product education through sizing, material, craft, shipping, and care/return information.
Provide a lightweight customer-support path centered on Instagram DM and email.
Keep the frontend fast, image-led, accessible, responsive, and visually restrained.
3. Product Scope
4. User Types / Actors
5. Brand & UX Principles
Minimal editorial aesthetic: neutral backgrounds, dark typography, thin borders, generous whitespace.
Product photography is the primary visual asset; avoid generic ecommerce-card clutter.
Controls are practical and compact; avoid excessive pills, shadows, gradients, or animation.
Product configuration must be more prominent than marketing copy on purchase screens.
Business rules are explicit. Never hide made-to-order timing or restrictive refund rules.
Use consistent English labels where the existing product does so.
Mobile is a first-class purchase experience: large touch targets, stacked configuration, persistent access to cart/search.
Accessibility is part of the design system: keyboard focus, labels, alt text, contrast, reduced motion.
6. Information Architecture
7. Global Header Specification
7.1 Desktop
The public shell exposes the brand plus ABOUT/GUIDE, SHOP(OM), DROP, TOGETHER, SIZING, CONTACT, X, Search, Log In, and Cart. This is the primary wayfinding system.
Brand always links home.
Current route has an accessible active state.
Search opens a dedicated search interaction.
Login changes to account state when authenticated.
Cart displays item count and/or cart access.
Protected navigation may remain visible but should communicate authentication requirements.
7.2 Mobile
Collapse primary navigation behind a menu/drawer.
Keep brand, search, and cart reachable without opening the drawer.
Drawer contains all primary routes and external/social links.
Preserve active route and authentication state.
Trap focus while drawer is open and close on Escape.
8. Homepage Specification
8.1 Announcement / Operational Notice
The current homepage prominently explains OM production, refund limitations after production begins, shipping timing, military-base address restrictions, custom-order requests, and option-change consequences. This is a critical commerce component, not decorative copy.
Admin-editable announcement content.
Optional publish/expiry dates.
Optional severity/tone: informational, warning, urgent.
Responsive text wrapping.
Optional expand/collapse on mobile for long notices.
Link to About/Guide.
Never remove legally/operationally important information solely for visual simplicity.
8.2 Homepage content
Brand/product hero or featured visual.
OM shopping entry.
Featured/new products where applicable.
Brand statement/story teaser.
Operational shipping notice.
Footer/legal/contact.
9. Product Catalog
9.1 OM Catalog
OM means Order Made. Production begins after an order is placed in the Nepal workshop. The public Guide states an expected production period of 7–14 days, excluding Nepali holidays, followed by shipping. Exact timing must be content-configurable rather than hard-coded.
Product grid with image, name, price, availability.
Product filters/sorting if catalog size warrants it.
Category support defining the breadth of the brand: Bottoms (Jeans, Shorts, Skirts, Overalls), Tops (Denim Jackets, Vests, Shirts), and Accessories (Denim Tote Bags, Hats/Caps, Aprons).
Made-to-order badge or metadata.
Product status: available, sold out, hidden, scheduled.
Related products.
9.2 DROP Catalog
DROP is described as non-order-made: items ship immediately after purchase. The Guide says DROP items used for a project are non-refundable, so the catalog must visibly distinguish this model from OM.
Ready-to-ship inventory.
Drop-specific shipping/refund messaging.
Optional release schedule.
Optional member restriction.
Inventory scarcity/stock state.
Drop landing page with campaign/project context.
10. Product Detail Specification
10.1 Product Header
Product name
Price + currency
Shipping note
Availability
Made-to-order / ready-to-ship state
10.2 Product Gallery
Primary high-resolution image.
Thumbnail/secondary image navigation.
Responsive image sizing.
Alt text.
Lazy-load secondary images.
Optional zoom/lightbox.
Maintain aspect ratio to avoid layout shift.
10.3 Product Facts
Observed product pages expose facts such as denim weight (oz), material (selvedge, stretch), handmade status, wash note, recommended sizing, and made-to-order status. These should be structured fields.
11. Product Options & Configuration
This is a core feature. The observed product configurations vary widely. Option values can be sold out independently.
11.1 Data model
ProductOption: id, label, type, required, sort order.
OptionValue: id, label, availability, price delta, SKU/variant reference.
Variant/combination: exact option combination, stock state, SKU, price adjustment, optional image.
Validation rules for incompatible combinations.
11.2 Examples
To prove the flexibility of the ProductOption architecture across a comprehensive denim brand:
Example A (Bottoms - Jeans): Fit (Slim/Straight/Relaxed), Waist (28-36), Inseam (30-34), Wash, Custom Hem.
Example B (Tops - Denim Jacket): Size (XS-XXL), Wash (Raw/Vintage/Acid), Hardware (Brass/Silver buttons), Custom Embroidery (Back Panel/Pocket).
Example C (Accessories - Tote Bag): Size (Standard/Oversized), Strap Drop, Monogramming (Up to 3 letters).
11.3 Interaction
Customer opens product.
Required options display with placeholder state.
Customer chooses first option.
System recalculates compatible values.
Unavailable combinations become disabled/sold out.
Customer completes required options.
Quantity control becomes actionable.
Price is recalculated if option price deltas exist.
Buy Now/Add to Cart validates the complete configuration.
Exact option selections are persisted into the cart line and order.
12. Custom Order
The homepage states that customers may request a product not listed in the options as a custom order and that additional costs apply. This should be implemented as a controlled request flow rather than silently accepting arbitrary order changes.
Custom request entry point from relevant product/Contact/Instagram instructions.
Capture requested product, desired option, reference images if allowed, quantity, contact information.
Create a support/custom-order request, not an immediately payable product unless admin approves.
Admin quotes additional cost and lead time.
Customer receives a payment link or approved custom product.
Persist approved specification to the final order.
13. Quantity / Stock
Quantity increment/decrement.
Minimum/maximum purchase limits where configured.
Real-time availability validation at cart/checkout.
Variant-level stock.
Out-of-stock state disables purchase.
Optional restock notification.
Prevent race-condition overselling by server-side validation at order creation.
Sixshop documentation supports inventory management, multi-option products, restock notification, related products, scheduled sales and purchase limits; these should be treated as platform capabilities, not assumptions about which exact settings the current store has enabled. citeturn1search6turn0search12
14. Purchase Actions
15. Cart
Line item image, name, configured options, quantity, unit price, line total.
Edit/remove item.
Revalidate stock and price.
Persist guest cart where appropriate.
Merge guest cart after login according to explicit policy.
Show subtotal, shipping estimate if calculable, discounts if supported, total.
Proceed to checkout.
Handle expired/unavailable variants without silently replacing them.
Sixshop documents a mini-cart model where selected option combinations can appear together and multiple option selections can be added to cart; the implementation should preserve the same conceptual behavior if rebuilding independently. citeturn0search15turn0search16
16. Checkout
16.1 Checkout steps
Review cart.
Customer/contact details.
Shipping address.
Shipping method/cost.
Order notes/custom information if allowed.
Payment method.
Final review of product options and production/shipping rules.
Payment authorization/capture.
Order confirmation.
16.2 Critical validation
Do not allow military-base addresses if the current shipping policy excludes them.
Display OM production time before payment.
Display DROP return/refund terms separately.
Confirm exact size/options before payment.
Validate country/region and shipping availability.
Prevent checkout if a product became unavailable.
Use server-side price and variant validation.
Use idempotency for payment/order creation.
16.3 Payment
Payment architecture must be provider-agnostic and optimized for a Nepal-based international ecommerce business with full abstraction maintained. It must support international payments (Visa/Mastercard/Apple Pay) and Nepal domestic payments (eSewa/Khalti/Fonepay) through a common Payment Orchestrator. Customer-facing display currency (e.g. USD) and merchant settlement currency (e.g. NPR) must be modeled separately. Payment success must be determined server-side using verified provider webhooks. citeturn1search6
17. Order Lifecycle
Sixshop's documented order model includes payment pending, paid, preparing shipment, shipped, delivered, cancellation and return states, plus shipment tracking and bulk order operations. citeturn1search7
18. OM Fulfillment Workflow
Customer selects exact configuration.
Payment succeeds.
Order is locked as a production specification.
Production work order is created.
Estimated production deadline is calculated from current lead time + business-calendar rules.
Items enter the manufacturing pipeline: Cutting, Sewing, Washing, Hardware (Rivets/Buttons/Assembling bags).
Quality check.
Pack and assign shipment.
Tracking number recorded.
Customer receives shipping notification.
Carrier status is synchronized.
Delivered order becomes eligible for review/support according to policy.
The current Guide says OM production is generally 5–25 days and excludes Korean holidays; the product system should therefore model production lead time as configuration/content rather than a UI-only string. citeturn1search5
19. DROP Fulfillment Workflow
Customer purchases in-stock item.
Inventory is reserved/decremented.
Order enters fulfillment.
Pack and ship without production queue.
Tracking is provided.
Refund/return policy follows DROP rules, which differ from OM.
The current Guide states DROP is shipped immediately after purchase and describes a five-day post-delivery refund window for DROP, subject to the stated shipping/refund conditions. Policies must be configurable and legally reviewed before implementation. citeturn1search5
20. Shipping
Worldwide shipping is a core promise shown in the public site.
Shipping cost may be free or policy-dependent; the current homepage advertises Free Worldwide Shipping.
Production time and carrier transit time must be displayed separately.
Tracking number and carrier are stored on the order.
Delivery status is displayed in account/order detail.
Returned-to-sender handling must support reshipping fee logic.
Country/address restrictions must be validated before payment.
Military-base address restriction must be represented as an address validation rule if it remains current.
The Guide currently says worldwide shipping, 3–10 days typical delivery after shipment, and special handling for returned packages; these statements are operational policy and should be editable rather than embedded in code. citeturn1search5
21. Returns / Exchanges / Refunds
The site deliberately has different policies for OM and DROP. OM jeans are customized after payment (hemmed, embroidered) and are generally non-returnable internationally due to logistics costs, except for defects; DROP has a stated refund window. Pre-order and domestic cases also have special rules. The product system must never apply one universal return policy.
These are current site statements, not legal advice. Before launch, have the operator/legal advisor confirm that the policy language is compliant with the target markets. citeturn1search5
22. Account & Membership
Sign up/login/logout.
Password/account recovery.
Profile/contact/shipping addresses.
Order history.
Order detail/tracking.
Review eligibility.
Q&A history.
Membership level.
Protected-page authorization.
Optional social login depending on provider.
Sixshop supports member levels and social login as platform capabilities. The current presence of login-gated DROP/TOGETHER indicates an authorization layer, but the exact membership hierarchy should be confirmed. citeturn1search6
23. Protected DROP / TOGETHER
Current public crawling can reach these routes but encounters an access/login restriction. The frontend must support public, authenticated-but-forbidden, and authorized states.
Do not leak protected product/content metadata into HTML, JSON endpoints, client bundles, search indexes, or image URLs.
24. Search
Global search trigger in header.
Search products by name/slug/category.
Optional content search.
Autocomplete suggestions if catalog size warrants it.
Result count.
Empty/no-result state.
Sold-out products can remain searchable but clearly marked.
Keyboard navigation and Escape-to-close.
Search query persisted in URL.
25. Reviews
Product review functionality is supported by the underlying platform and product pages can expose reviews. Sixshop documents product-specific review boards and optional member/non-member write permissions. citeturn0search14
Rating and/or written review according to configured schema.
Optional image/video review if platform tier supports it.
Review list on product detail.
Best-review pinning if enabled.
Verified purchase marker recommended.
Moderation/report workflow.
Pagination or lazy loading.
Review eligibility based on completed purchase.
26. Product Q&A
The platform supports product-specific questions and answers. Sixshop documents private questions, anonymous display, categories, and configurable write permissions. citeturn0search14
Question creation.
Optional category: size, shipping, material, customization, etc.
Private/secret question option.
Admin answer.
Notification to customer.
Question list on product detail.
Moderation and spam prevention.
27. Sizing
The current Sizing page explicitly covers measurements for a full denim brand and recommends professional measurement tools. Product-level sizing guidance should link back to this page. citeturn0search2
Tops/Jackets: Chest, Shoulder-to-Shoulder, Sleeve Length, Center Back Length.
Bottoms: Waist, Inseam, Rise (Front/Back), Thigh, Leg Opening.
Non-Apparel: Bag Dimensions (Width, Height, Depth, Strap Drop).
Visual instructional images for measuring favorite jeans or jackets.
Product-specific size recommendation.
Clear distinction between measurement and recommended finished size.
Mobile-friendly instructional imagery.
28. Contact & Support
The current Contact page says inquiries are accepted through Instagram Direct Message or email. A second contact route specifies that email should be used for shipping inquiries/order issues and not custom inquiries. These instructions should be centralized into one canonical support policy to avoid contradictory public pages. citeturn1search0turn1search1
Instagram DM link.
Support email link.
Shipping/order issue instructions.
Custom-order request instructions.
Order number capture for support.
Expected-response notice recommended.
FAQ/Guide links before direct contact.
29. Content Management
Recommended admin-managed content types:
Homepage announcements.
About/brand story.
Shipping guide.
OM policy.
DROP policy.
Return/refund policy.
Sizing guide.
Contact instructions.
Legal pages.
Campaign/drop pages.
Product descriptions and facts.
Content should be versionable/publishable and should not require a developer for normal policy copy changes.
30. Product Admin
Create/edit/archive product.
Upload/reorder images.
Set price/currency.
Set product type: OM / DROP / pre-order.
Configure options and option values.
Configure variant SKU and stock.
Set availability/scheduled release.
Set product access level.
Set related products.
Set shipping policy.
Set product-specific facts.
Manage SEO metadata.
Preview before publishing.
Sixshop's product documentation supports product registration, categories, inventory, multi-option configuration, per-option stock/price, common product information, related products and access restrictions. citeturn0search10turn0search12
31. Inventory
Variant-level stock.
Stock reservation during checkout.
Stock decrement on successful order.
Release stock on cancellation/refund according to policy.
Manual adjustment with audit log.
Low-stock threshold.
Sold-out UI.
Restock notification.
Inventory import/export.
If OM products are intentionally not stock-limited, represent them as make-to-order rather than faking infinite physical inventory.
32. Order Administration
Order search by order number/customer/product.
Order detail with exact options.
Payment status.
Production status.
Shipping status.
Carrier/tracking.
Customer/address.
Internal notes.
Cancellation/refund/return actions.
Bulk fulfillment updates.
CSV/Excel export.
Audit history.
Sixshop documents order search, bulk actions, spreadsheet export, tracking, cancellation, returns, partial cancellation, and detailed order information. citeturn1search7
33. Customer Service Operations
Customer lookup by email/order number.
View order configuration.
View production state.
View shipment/tracking.
Record support notes.
Escalate manufacturing issue.
Initiate approved refund/return workflow.
Send customer update.
Maintain audit trail.
34. Notifications
Exact SMS/Kakao/email channels depend on configured platform integrations. Sixshop publicly lists automated messaging capabilities, including Kakao/SMS/email in applicable plans. citeturn1search6
35. Analytics
Homepage view.
Product view.
Search performed.
Option selection.
Add to cart.
Buy Now.
Checkout started.
Payment success/failure.
Purchase.
Refund/cancellation.
Protected-page login attempt.
Restock signup.
Review submitted.
Q&A submitted.
Campaign/drop conversion.
Recommended funnel: Product View → Option Complete → Add to Cart/Buy Now → Checkout → Payment → Order → Shipment → Delivered → Review.
36. SEO
Unique title/description per page.
Canonical URL.
Product structured data.
Open Graph metadata.
Product images with alt text.
XML sitemap.
Robots rules.
Index public content only.
Noindex protected/member-only pages.
Fast image delivery and minimal layout shift.
Sixshop publicly documents SEO capabilities including sitemap/meta support; exact implementation should be validated in the rebuilt stack. citeturn0search6turn1search6
37. Accessibility
Semantic header/nav/main/footer.
Keyboard-accessible menu, gallery, selectors, cart, and checkout.
Visible :focus-visible states.
Labels for every form field.
Screen-reader announcements for cart changes.
Meaningful product image alt text.
Do not rely only on color for stock/validation state.
Minimum ~44px touch targets.
Respect prefers-reduced-motion.
Error messages tied to fields.
Logical heading order.
38. Responsive Specification
39. Data Model
Recommended core entities:
User(id, email, status, membershipLevel, profile)
Address(id, userId, country, postalCode, region, city, line1, line2, phone)
Product(id, slug, type, title, description, price, currency, status, accessLevel)
ProductImage(id, productId, url, alt, sortOrder)
ProductOption(id, productId, label, type, required, sortOrder)
OptionValue(id, optionId, label, priceDelta, status)
Variant(id, productId, sku, optionCombination, price, stock, status)
Cart(id, userId/sessionId, currency)
CartLine(id, cartId, variantId, quantity, selectedOptions, priceSnapshot)
Order(id, userId, status, paymentStatus, fulfillmentStatus, currency, totals)
OrderLine(id, orderId, productId, variantId, selectedOptions, quantity, priceSnapshot)
ProductionJob(id, orderId, status, startedAt, dueAt, completedAt)
Shipment(id, orderId, carrier, trackingNumber, status)
Review(id, productId, userId, orderId, rating, body, media, status)
Question(id, productId, userId, category, body, private, status)
Answer(id, questionId, adminId, body)
RestockSubscription(id, productId/variantId, contact, status)
CustomOrderRequest(id, customer, request, status, quotedPrice, quotedLeadTime)
ContentPage(id, slug, title, body, locale, status)
Announcement(id, title, body, startsAt, endsAt, status)
40. API / Service Boundaries
41. Security
Never trust client-provided price, stock, membership, or variant availability.
Authorize every order/account/protected-content request server-side.
Use secure session cookies or equivalent.
Protect admin endpoints with strong RBAC.
Validate file uploads and image types.
Rate-limit login, search, review/Q&A, and support forms.
Use payment-provider webhooks with signature verification.
Use idempotency keys for checkout/payment/order creation.
Audit admin changes to prices, stock, policy, refunds, and access levels.
Do not expose private Drop/Together data through public APIs.
42. Edge Cases
Product sells out while customer is on product page.
Option combination becomes unavailable after selection.
Price changes between page view and checkout.
Cart contains a discontinued product.
Payment succeeds but client times out.
Payment webhook arrives twice.
Customer refreshes confirmation page.
Customer changes country after shipping quote.
Address is invalid or restricted.
Package is returned to sender.
OM production is delayed.
Customer requests prohibited OM refund.
Customer requests a custom size not listed.
Member loses access while viewing protected content.
Review submitted without eligible purchase.
Customer uploads unsupported image.
Search returns no products.
External Instagram/email support link fails.
Shipment has tracking number but carrier has not scanned it.
43. Acceptance Criteria — Customer
User can understand what OM means before purchasing.
User can distinguish OM from DROP.
User can view product images and facts.
User can select required options.
Unavailable combinations cannot be purchased.
Exact configuration appears in cart and order.
User sees production/shipping expectations before payment.
User cannot accidentally purchase a sold-out variant.
User receives an order confirmation.
User can view order status/tracking.
User can access sizing guidance.
User can find support instructions.
Protected pages do not expose private content.
44. Acceptance Criteria — Admin
Admin can create a product with multiple options.
Admin can assign variant-level price/stock.
Admin can mark product OM/DROP/pre-order.
Admin can update lead time/policy copy without code.
Admin can process orders through production and shipping.
Admin can update tracking.
Admin can process permitted cancellations/refunds.
Admin can manage reviews/Q&A.
Admin can manage member access.
Admin can export/search orders.
All sensitive changes are auditable.
45. Recommended MVP vs Phase 2
46. Product KPIs
Product detail → add-to-cart conversion.
Product detail → purchase conversion.
Checkout completion rate.
Payment failure rate.
Option validation error rate.
Cart abandonment.
Average order value.
Repeat purchase rate.
Refund/cancellation rate by OM vs DROP.
Production SLA adherence.
Shipment delivery time.
Support contact rate per order.
Review rate.
Protected-area login conversion.
47. Open Questions to Verify Before Engineering
Exact payment provider(s) and currencies supported.
Whether guest checkout is enabled.
Exact membership tiers and which routes/products each tier can access.
Exact contents of DROP and TOGETHER behind authentication.
Current inventory strategy for OM variants.
Whether option combinations have independent SKUs.
Exact shipping rates by country.
Carrier(s) used.
Tax/VAT/duty handling.
Custom-order workflow and approval authority.
Restock notification channel.
Review/Q&A permissions.
Canonical Contact route: /contact vs /contactt.
Current legal policy text for each target market.
Whether X/Instagram integrations are simply external links or embedded feeds.
Exact admin roles and staff permissions.
48. Research Evidence / Sources
1. HardihooderWW homepage — current OM operational notice, Free Worldwide Shipping, legal/company footer, hosting information. citeturn1search4
2. HardihooderWW About/Guide — brand story, South Korea location, OM 5–25 day production statement, DROP ready-to-ship model, shipping/return/refund rules. citeturn1search5
3. HardihooderWW Sizing — sizing guidance framework adapted for denim. citeturn0search2
4. HardihooderWW product pages — configurable examples, prices, size/customization options, sold-out states, material and made-to-order facts, Buy Now/Add to Cart. citeturn1search2turn1search3
5. HardihooderWW Contact pages — Instagram/email support and custom-order/shipping inquiry distinctions. citeturn1search0turn1search1
6. Sixshop product documentation — products, inventory, options, variants, related products, access restrictions and purchase limits. citeturn0search10turn0search12
7. Sixshop reviews/Q&A documentation — product review boards, question boards, permissions, private questions, anonymous display and categories. citeturn0search14
8. Sixshop order documentation — order states, tracking, cancellation, returns, refunds, bulk operations and exports. citeturn1search7
9. Sixshop public pricing/features — member levels, social login, restock notifications, scheduled sales, payment/order, analytics and messaging capabilities. citeturn1search6
10. Sixshop mini-cart / option documentation — multiple option selections and cart behavior. citeturn0search15turn0search16
49. Final Product Definition
The product should be treated as a premium, global, made-to-order denim commerce system rather than a static marketing website. Its defining capability is the safe translation of a customer's exact jeans configuration into a payable, auditable production order while clearly communicating manufacturing lead time and restrictive returns. The second major capability is separating that model from ready-to-ship DROP inventory and access-controlled community/member experiences.
The frontend should make this operational model obvious without sacrificing the brand's minimal aesthetic: the customer should always know what the product is, how it is configured, whether it is available, when it will ship, what happens after purchase, and where to get help.
For engineering, the highest-risk areas are variant/option correctness, inventory concurrency, payment idempotency, order state transitions, OM production timing, shipping restrictions, refund policy branching, and protected content. These should receive more implementation and testing attention than decorative frontend effects.