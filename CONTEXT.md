# Project 925 Ubiquitous Language

The canonical domain glossary for **Project 925** handcrafted .925 sterling silver artisan jewellery and Kathmandu workshop operations.

---

## Commerce Models

**Order-Made (OM)**:  
A made-to-order manufacturing model where precious metal jewellery pieces are custom cast, sized, engraved, and hand-finished only after customer payment at the Kathmandu Workshop.  
*Avoid*: Made-to-measure, bespoke, pre-order, backorder

**DROP**:  
A limited-batch, ready-to-ship product release produced in fixed physical inventory quantities before sale (e.g. 25 numbered talisman pendants, 15 solid .925 cuffs).  
*Avoid*: In-stock item, off-the-rack, standard product

**Together**:  
A restricted collection or co-commissioning release accessible exclusively to authenticated community members.  
*Avoid*: VIP club, private portal, member's lounge

---

## Products & Configuration

**Product**:  
An editorial jewellery style in the catalog (e.g. *Lot J01 .925 Sterling Silver Signet Ring*, *Lot P01 Repoussé Talisman Pendant*).  
*Avoid*: Item, listing, garment

**Category**:  
A dynamic classification of jewellery items (e.g. *Rings*, *Pendants*, *Cuffs*, *Chains*) managed via Admin with real-time storefront reflection.  
*Avoid*: Tag, collection type, group

**ProductOption**:  
A customizable physical dimension or aesthetic choice on a Product (e.g. Ring Size, Wide Shank Compensator, Wrist Circumference & Gap, Chain Drape Length, Metal Alloy, Surface Patina, Inside-Band Engraving).  
*Avoid*: Attribute, property, parameter

**OptionValue**:  
A concrete choice available for a ProductOption (e.g. 'US 10' for Ring Size; 'Antiqued Sulfur Patina' for Surface Patina; 'Solid .925 Sterling Silver' for Alloy).  
*Avoid*: Choice, selection, variant value

**Variant**:  
A specific, purchasable combination of OptionValues with a unique SKU, stock state, and pricing structure.  
*Avoid*: SKU item, inventory item

---

## Ordering & Fulfillment

**Order**:  
An immutable commercial agreement formed after a customer confirms checkout and completes payment.  
*Avoid*: Purchase, transaction, booking

**CartLine**:  
A customer's uncommitted intent to purchase a specific Variant with chosen configuration options.  
*Avoid*: Basket item, cart entry

**ProductionJob**:  
A workshop work order tracking the physical crafting of a single custom OM OrderLine through 8 jewellery bench stages in Kathmandu.  
*Avoid*: Task, ticket, manufacture item

**ProductionStage**:  
One of the eight sequential workshop stations in the OM jewellery lifecycle (Queued, Casting, Setting, Patina, Polishing, QC, Ready, Shipped).  
*Avoid*: Step, phase, state

**ProductionPolicy**:  
A domain configuration entity defining active lead times, buffer days, and holiday exclusions for workshop scheduling.  
*Avoid*: SLA, timeline, schedule config

**BenchTicket**:  
An immutable manufacturing specification snapshot generated when jewellery casting begins, containing exact ring mandrel size, wide shank compensator, metal alloy, finish, and custom engraving inscription.  
*Avoid*: Jeweller sheet, sizing card, spec sheet

**CraftTicket**:  
The unified domain work order interface representing an active atelier `BenchTicket`.

**Shipment**:  
The physical fulfillment dispatch of packed goods assigned to an international carrier with tracking (HS Code 7113.11).  
*Avoid*: Delivery, parcel, dispatch

**InspectionWindow**:  
The strict 5-day post-delivery timeframe during which standard DROP pieces remain eligible for inspection and return.  
*Avoid*: Return window, trial period, grace period

---

## Materials & Artisan Craft

**FineSilverGrain**:  
Certified .999 pure silver grain alloyed with copper in the Kathmandu Workshop to produce .925 sterling silver for casting.

**LostWaxCasting**:  
The ancient investment casting technique where carved or 3D-printed wax masters are invested in plaster flasks, burned out in a kiln, and filled with molten sterling silver.

**Repoussé**:  
The traditional Kathmandu Newar metalsmithing technique of hammering malleable sheet silver from the reverse side to create intricate raised relief talisman motifs.

**Patina**:  
The intentional, controlled surface oxidization of sterling silver using liver of sulfur to create deep shadow contrasts in engravings, complemented by high-mirror relief polishing.

**Hallmark**:  
The official atelier purity stamp (`.925`, `PROJECT 925` emblem) struck into precious metal jewellery.

**RingMandrel**:  
The calibrated steel sizing tool governing bespoke ring fabrication across US sizes (3 to 16 in quarter-size increments).

**WideShankCompensator**:  
The algorithmic sizing adjustment (+0.5 size) applied automatically to ring bands measuring 6mm or wider to ensure fit comfort.

**WristGap**:  
The open terminal spacing (typically 1.0"–1.5") engineered into heavy solid silver cuffs to allow ergonomic wear.

---

## Payments & Lifecycle

**PaymentIntent**:  
A provider-independent domain representation of an initiated payment transaction before confirmation.  
*Avoid*: Invoice, charge, transaction token

**Reconciliation**:  
The automated validation ensuring external gateway settlement matches internal order totals.  
*Avoid*: Audit check, balancing, tally

**ScheduledRelease**:  
A product state with an automated publication timestamp where purchasing is blocked until the target date.  
*Avoid*: Embargo, pre-launch, future drop

---

## Actors & Roles

**Customer**:  
An individual who purchases jewellery pieces or tracks an order.  
*Avoid*: Client, buyer, shopper, user

**Member**:  
An authenticated Customer granted access privileges to restricted Together drops and advance purchase windows.  
*Avoid*: Subscriber, VIP, premium user

**Jeweller / Metalsmith**:  
A Kathmandu workshop artisan responsible for wax carving, flask burnout, centrifugal casting, mandrel sizing, stone setting, patina oxidization, and rouge polishing at the jewellery bench.  
*Avoid*: Tailor, worker, manufacturer, maker

**Artisan**:  
The canonical title for a Kathmandu workshop metalsmith.

**Fulfillment Operator**:  
A staff member who inspects, packs into wooden presentation boxes, and registers shipments with couriers.  
*Avoid*: Packer, shipper, dispatch worker

---

## Logistics & Returns

**Waybill**:  
The carrier-generated bill of lading and tracking documentation attached to a physical shipment package.  
*Avoid*: Shipping label, tag, docket

**CarrierTracking**:  
The verified external courier telemetry updates ingested via carrier webhooks.  
*Avoid*: Shipping status, package tracker

**ReturnAuthorization**:  
Formal approval issued by workshop support authorizing a customer to return an eligible DROP piece within the 5-day window.  
*Avoid*: RMA, return ticket, return pass

**RestockInspection**:  
The physical warehouse quality-control assessment verifying that a returned piece is unworn, scratch-free, and restockable.  
*Avoid*: Return check, inwards inspection

---

## Access & Support

**MembershipTier**:  
An authorization level determining catalog visibility and drop access privileges.  
*Avoid*: User level, subscription plan, VIP tier

**TogetherDrop**:  
A restricted collection or co-commissioning release accessible exclusively to authenticated community members.  
*Avoid*: Private drop, member sale

**SupportBoundary**:  
The strict separation between informal social engagement (Instagram DM) and authoritative transactional operations (Email/Platform).  
*Avoid*: Helpdesk policy, support channel rule

**CustomOrderInquiry**:  
A structured customer request for non-standard jewellery commissions (bespoke family crest signets, deep repoussé motifs).  
*Avoid*: Bespoke request, tailor ticket, custom quote

---

## Architecture & System Boundaries

**BoundedContext**:  
An explicit boundary within which a specific domain model and ubiquitous language applies cleanly without conceptual leakage.  
*Avoid*: Microservice, module, domain silo

**ServerAction**:  
A secure server-side mutation function invoked directly by client UI components to enforce domain invariants.  
*Avoid*: API call, RPC endpoint, mutation controller
