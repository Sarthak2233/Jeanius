# Jeanius & Jewl Ubiquitous Language

The canonical domain glossary for the Jeanius & Jewl handmade raw denim and handcrafted artisan jewellery atelier and workshop operations.

## Commerce Models

**Order-Made (OM)**:
A made-to-order manufacturing model where garments are custom cut and assembled, or jewellery pieces are hand-forged, sized, and engraved only after customer payment.
_Avoid_: Made-to-measure, bespoke, pre-order, backorder

**DROP**:
A limited-batch, ready-to-ship product release produced in fixed physical inventory quantities before sale (e.g. 50 selvedge jackets, 25 numbered brass cuffs).
_Avoid_: In-stock item, off-the-rack, standard product

**Together**:
A restricted collection or release accessible exclusively to authenticated community members.
_Avoid_: VIP club, private portal, member's lounge

## Products & Configuration

**Product**:
An editorial denim or jewellery style in the catalog (e.g. Lot 001 Straight Raw Selvedge, Lot J01 .925 Sterling Silver Signet Ring).
_Avoid_: Item, listing, garment

**ProductOption**:
A customizable physical dimension or aesthetic choice on a Product (e.g. Waist, Inseam, Stitch Thread for denim; Ring Size, Chain Length, Metal Alloy, Finish, Engraving for jewellery).
_Avoid_: Attribute, property, parameter

**OptionValue**:
A concrete choice available for a ProductOption (e.g. '32' for Waist; 'US 10' for Ring Size; 'Oxidized' for Finish).
_Avoid_: Choice, selection, variant value

**Variant**:
A specific, purchasable combination of OptionValues with a unique SKU and pricing structure.
_Avoid_: SKU item, inventory item

## Ordering & Fulfillment

**Order**:
An immutable commercial agreement formed after a customer confirms checkout and completes payment.
_Avoid_: Purchase, transaction, booking

**CartLine**:
A customer's uncommitted intent to purchase a specific Variant with chosen configuration options.
_Avoid_: Basket item, cart entry

**ProductionJob**:
A workshop work order tracking the physical crafting of a single custom OM OrderLine through workshop stages (Tailor bench or Metalsmith bench).
_Avoid_: Task, ticket, manufacture item

**ProductionStage**:
One of the eight sequential workshop stations in the OM manufacturing lifecycle (Queued, Cutting/Forging, Sewing/Assembly, Washing/Patina, Hardware/Polishing, QC, Ready, Shipped).
_Avoid_: Step, phase, state

**ProductionPolicy**:
A domain configuration entity defining active lead times, buffer days, and holiday exclusions for workshop scheduling.
_Avoid_: SLA, timeline, schedule config

**CutTicket**:
An immutable manufacturing specification snapshot generated when denim cutting begins, containing exact pattern measurements and hardware.
_Avoid_: Work sheet, pattern sheet, spec sheet

**BenchTicket**:
An immutable manufacturing specification snapshot generated when jewellery crafting begins, containing exact ring mandrel size, metal alloy, finish, and custom engraving text.
_Avoid_: Jeweller sheet, sizing card

**CraftTicket**:
The unified domain work order interface representing either a denim `CutTicket` or a jewellery `BenchTicket`.

**Shipment**:
The physical fulfillment dispatch of packed goods assigned to an international carrier with tracking.
_Avoid_: Delivery, parcel, dispatch

**InspectionWindow**:
The strict 5-day post-delivery timeframe during which standard DROP pieces remain eligible for inspection and return.
_Avoid_: Return window, trial period, grace period

## Materials & Artisan Craft

**Patina**:
The organic, intentional aging of raw denim (indigo fading, honeycombs, whiskers) and solid silver/brass (atmospheric oxidation, highlight polishing) resulting from everyday wear.

**Hallmark**:
The official atelier purity stamp (.925, Jeanius & Jewl emblem) struck into precious metal jewellery.

**RingSize**:
Standardized US mandrel dimension (sizes 4 to 14 in half-size increments) governing bespoke band fabrication.

## Payments & Lifecycle

**PaymentIntent**:
A provider-independent domain representation of an initiated payment transaction before confirmation.
_Avoid_: Invoice, charge, transaction token

**Reconciliation**:
The automated validation ensuring external gateway settlement matches internal order totals.
_Avoid_: Audit check, balancing, tally

**ScheduledRelease**:
A product state with an automated publication timestamp where purchasing is blocked until the target date.
_Avoid_: Embargo, pre-launch, future drop

## Actors & Roles

**Customer**:
An individual who purchases garments, jewellery, or tracks an order.
_Avoid_: Client, buyer, shopper, user

**Member**:
An authenticated Customer granted access privileges to restricted Together drops.
_Avoid_: Subscriber, VIP, premium user

**Tailor**:
A workshop artisan responsible for executing denim cutting, sewing, washing, and garment hardware assembly.
_Avoid_: Worker, manufacturer, staff, maker

**Metalsmith / Jeweller**:
A workshop artisan responsible for melting, casting, forging, stone-setting, sizing, and hand-polishing at the jewellery bench.

**Artisan**:
The unified workshop craftsman role encompassing both Tailors and Metalsmiths.

**Fulfillment Operator**:
A staff member who inspects, packs, and registers shipments with couriers.
_Avoid_: Packer, shipper, dispatch worker

## Logistics & Returns

**Waybill**:
The carrier-generated bill of lading and tracking documentation attached to a physical shipment package.
_Avoid_: Shipping label, tag, docket

**CarrierTracking**:
The verified external courier telemetry updates ingested via carrier webhooks.
_Avoid_: Shipping status, package tracker

**ReturnAuthorization**:
Formal approval issued by workshop support authorizing a customer to return an eligible garment.
_Avoid_: RMA, return ticket, return pass

**RestockInspection**:
The physical warehouse quality-control assessment verifying that a returned garment is unworn, unwashed, and restockable.
_Avoid_: Return check, inwards inspection

## Access & Support

**MembershipTier**:
An authorization level determining catalog visibility and drop access privileges.
_Avoid_: User level, subscription plan, VIP tier

**TogetherDrop**:
A restricted collection or release accessible exclusively to authenticated community members.
_Avoid_: Private drop, member sale

**SupportBoundary**:
The strict separation between informal social engagement (Instagram DM) and authoritative transactional operations (Email/Platform).
_Avoid_: Helpdesk policy, support channel rule

**CustomOrderInquiry**:
A structured customer request for non-standard garment silhouettes or bespoke fabric allocations.
_Avoid_: Bespoke request, tailor ticket, custom quote

## Architecture & System Boundaries

**BoundedContext**:
An explicit boundary within which a specific domain model and ubiquitous language applies cleanly without conceptual leakage.
_Avoid_: Microservice, module, domain silo

**ServerAction**:
A secure server-side mutation function invoked directly by client UI components to enforce domain invariants.
_Avoid_: API call, RPC endpoint, mutation controller

