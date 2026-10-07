/**
 * @jeanius/contracts
 * Zod schemas and boundary validation contracts.
 */
import { z } from 'zod';

export const ActorRoleSchema = z.enum([
  'GUEST',
  'CUSTOMER',
  'MEMBER',
  'TAILOR',
  'JEWELLER',
  'FULFILLMENT',
  'SUPPORT',
  'ADMIN',
]);

export const ProductCategorySchema = z.enum(['BOTTOMS', 'TOPS', 'JEWELLERY', 'ACCESSORIES']);

export const CommerceModelSchema = z.enum(['OM', 'DROP', 'CUSTOM_ORDER']);

export const ProductStatusSchema = z.enum([
  'DRAFT',
  'SCHEDULED',
  'PUBLISHED',
  'SOLD_OUT',
  'ARCHIVED',
]);

export const VariantStatusSchema = z.enum([
  'AVAILABLE',
  'LOW_STOCK',
  'SOLD_OUT',
  'DISABLED',
  'ARCHIVED',
]);

export const PaymentStatusSchema = z.enum([
  'INITIATED',
  'PENDING',
  'PAID',
  'FAILED',
  'EXPIRED',
  'REFUNDED',
  'PARTIALLY_REFUNDED',
]);

export const MoneySchema = z.object({
  amount: z.number().int().nonnegative(),
  currency: z.enum(['USD', 'NPR']).or(z.string().min(3).max(3)),
});

export const AddressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  addressLine1: z.string().min(3, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  stateOrProvince: z.string().optional(),
  postalCode: z.string().min(2, 'Postal code is required'),
  country: z.string().min(2, 'Country code is required'),
  phone: z.string().min(6, 'Valid phone number is required'),
});

export const AddToCartSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid(),
  quantity: z.number().int().positive().max(10),
  selectedOptions: z.record(z.string()),
  customSpecifications: z.record(z.union([z.string(), z.number()])).optional(),
});

export const CreateCheckoutSchema = z.object({
  cartId: z.string().uuid(),
  customerEmail: z.string().email(),
  shippingAddress: AddressSchema,
});

export const TransitionProductionStageSchema = z.object({
  jobId: z.string().uuid(),
  stage: z.enum([
    'QUEUED',
    'CUTTING',
    'SEWING',
    'WASHING',
    'HARDWARE',
    'CASTING',
    'SETTING',
    'PATINA',
    'POLISHING',
    'QC',
    'READY',
    'SHIPPED',
  ]),
  notes: z.string().optional(),
});

export const CancelOrderSchema = z.object({
  orderId: z.string().uuid(),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
});

export const CustomOrderInquirySchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  productCategory: ProductCategorySchema,
  desiredFabricWeight: z.string().optional(),
  desiredMetalAlloy: z.string().optional(),
  customSpecifications: z.record(z.union([z.string(), z.number()])).optional(),
  description: z.string().min(20, 'Please describe your custom request in detail'),
  referenceImageUrls: z.array(z.string().url()).optional(),
});

export const DropReturnRequestSchema = z.object({
  orderId: z.string().uuid(),
  orderLineId: z.string().uuid(),
  customerEmail: z.string().email(),
  reason: z.string().min(10, 'Please explain the reason for your return'),
  unwornConfirmation: z.literal(true, {
    errorMap: () => ({
      message:
        'You must confirm the item is unworn and in original condition with security tags and packaging intact',
    }),
  }),
});

export const UpdateVariantStatusSchema = z.object({
  variantId: z.string().uuid(),
  status: VariantStatusSchema,
});

export const ShipmentStatusSchema = z.enum([
  'PENDING',
  'PACKED',
  'SHIPPED',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'ATTEMPTED_DELIVERY',
  'RETURNED_TO_SENDER',
  'RETURNED',
  'LOST',
]);

export const ShipmentItemSchema = z.object({
  orderLineId: z.string().uuid(),
  sku: z.string().min(3),
  quantity: z.number().int().positive(),
});

export const CreateShipmentSchema = z.object({
  orderId: z.string().uuid(),
  items: z.array(ShipmentItemSchema).min(1),
  shippingAddress: AddressSchema,
  carrier: z.string().optional(),
});

export const UpdateShipmentTrackingSchema = z.object({
  shipmentId: z.string().uuid(),
  carrier: z.string().min(2),
  trackingNumber: z.string().min(5),
  status: ShipmentStatusSchema,
});

export const ReturnStatusSchema = z.enum([
  'REQUESTED',
  'APPROVED',
  'REJECTED',
  'IN_TRANSIT',
  'QC_INSPECTION',
  'RESTOCKED',
  'SCRAPPED',
  'REFUND_PROCESSING',
  'COMPLETED',
]);

export const ApproveReturnSchema = z.object({
  returnId: z.string().uuid(),
  returnWaybillNumber: z.string().optional(),
  notes: z.string().optional(),
});

export const RejectReturnSchema = z.object({
  returnId: z.string().uuid(),
  rejectionReason: z.string().min(10, 'Rejection reason must be at least 10 characters'),
});

export const AccessLevelSchema = z.enum(['PUBLIC', 'AUTHENTICATED', 'MEMBER', 'ADMIN']);

export const SupportChannelSchema = z.enum(['INSTAGRAM_DM', 'EMAIL', 'CUSTOM_ORDER_FORM']);

export const CustomOrderInquiryStatusSchema = z.enum([
  'INQUIRY_RECEIVED',
  'QUOTED',
  'APPROVED',
  'REJECTED',
  'CONVERTED_TO_ORDER',
]);

export const SignUpSchema = z.object({
  email: z.string().email('Valid email address is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email('Valid email address is required'),
  password: z.string().min(1, 'Password is required'),
});

export const RequestPasswordResetSchema = z.object({
  email: z.string().email('Valid email address is required'),
});

export const ResetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const GenderProfileSchema = z.enum(['MEN', 'WOMEN', 'UNISEX']);
export const MeasurementMethodSchema = z.enum(['GARMENT_FLAT', 'BODY_ANATOMICAL']);
export const MeasurementUnitSchema = z.enum(['INCHES', 'CM']);
export const StomachProfileSchema = z.enum(['FLAT', 'AVERAGE', 'ROUNDED', 'STOUT']);
export const SeatProfileSchema = z.enum(['FLAT', 'AVERAGE', 'ROUNDED', 'STOUT']);
export const RisePreferenceSchema = z.enum(['HIGH_RISE', 'MID_RISE', 'LOW_RISE']);

export const BottomsMeasurementsSchema = z.object({
  gender: GenderProfileSchema.optional(),
  measurementMethod: MeasurementMethodSchema.optional(),
  waistInches: z.number().min(20).max(60).optional(),
  waistFlatInches: z.number().min(10).max(30).optional(),
  naturalWaistInches: z.number().min(20).max(60).optional(),
  hipsInches: z.number().min(26).max(70).optional(),
  hipsFlatInches: z.number().min(13).max(35).optional(),
  thighInches: z.number().min(14).max(42).optional(),
  thighFlatInches: z.number().min(7).max(21).optional(),
  kneeInches: z.number().min(10).max(32).optional(),
  kneeFlatInches: z.number().min(5).max(16).optional(),
  legOpeningInches: z.number().min(8).max(30).optional(),
  legOpeningFlatInches: z.number().min(4).max(15).optional(),
  inseamInches: z.number().min(20).max(45).optional(),
  outseamInches: z.number().min(28).max(55).optional(),
  frontRiseInches: z.number().min(7).max(20).optional(),
  backRiseInches: z.number().min(10).max(25).optional(),
  crotchTotalInches: z.number().min(18).max(40).optional(),
  silhouette: z
    .enum(['STRAIGHT', 'SLIM_TAPERED', 'WIDE_LEG', 'RELAXED_TAPERED', 'BOOTCUT'])
    .optional(),
  risePreference: RisePreferenceSchema.optional(),
  fitCut: z.enum(['SLIM', 'NORMAL', 'LOOSE']).optional(),
  stomachProfile: StomachProfileSchema.optional(),
  seatProfile: SeatProfileSchema.optional(),
  hemAllowanceInches: z.number().min(0).max(4).optional(),
});

export const TopsMeasurementsSchema = z.object({
  gender: GenderProfileSchema.optional(),
  measurementMethod: MeasurementMethodSchema.optional(),
  chestInches: z.number().min(28).max(65).optional(),
  chestFlatInches: z.number().min(14).max(32.5).optional(),
  bustInches: z.number().min(28).max(65).optional(),
  underBustInches: z.number().min(24).max(55).optional(),
  breastPointInches: z.number().min(7).max(18).optional(),
  waistPointInches: z.number().min(12).max(25).optional(),
  frontBustWidthInches: z.number().min(12).max(28).optional(),
  naturalWaistInches: z.number().min(20).max(55).optional(),
  stomachInches: z.number().min(24).max(60).optional(),
  shoulderWidthInches: z.number().min(13).max(30).optional(),
  shoulderSeamInches: z.number().min(4).max(12).optional(),
  sleeveLengthInches: z.number().min(18).max(38).optional(),
  shortSleeveLengthInches: z.number().min(6).max(18).optional(),
  bicepInches: z.number().min(9).max(26).optional(),
  wristInches: z.number().min(5).max(12).optional(),
  armholeInches: z.number().min(14).max(30).optional(),
  collarInches: z.number().min(11).max(24).optional(),
  neckInches: z.number().min(11).max(24).optional(),
  backLengthInches: z.number().min(18).max(42).optional(),
  fitPreference: z.enum(['SLIM', 'REGULAR', 'BOXY', 'OVERSIZED']).optional(),
});

export const DenimPreferencesSchema = z.object({
  bottoms: BottomsMeasurementsSchema.optional(),
  tops: TopsMeasurementsSchema.optional(),
  // Flat / legacy compatibility
  waistInches: z.number().min(20).max(60).optional(),
  inseamInches: z.number().min(20).max(45).optional(),
  silhouette: z
    .enum(['STRAIGHT', 'SLIM_TAPERED', 'WIDE_LEG', 'RELAXED_TAPERED', 'BOOTCUT'])
    .optional(),
  hemAllowanceInches: z.number().min(0).max(4).optional(),
});

export const RingMeasurementsSchema = z.object({
  ringSizeUs: z.string().optional(),
  insideDiameterMm: z.number().min(13).max(28).optional(),
  insideCircumferenceMm: z.number().min(40).max(85).optional(),
  ringMandrelMm: z.number().min(12).max(28).optional(),
  knuckleClearanceMm: z.number().min(12).max(32).optional(),
  bandWidthMm: z.number().min(1).max(20).optional(),
  comfortFit: z.boolean().optional(),
  dominantHand: z.enum(['LEFT', 'RIGHT']).optional(),
  preferredFinger: z.enum(['INDEX', 'MIDDLE', 'RING', 'PINKY', 'THUMB']).optional(),
});

export const WristMeasurementsSchema = z.object({
  wristCircumferenceInches: z.number().min(4.5).max(11).optional(),
  wristBreadthMm: z.number().min(35).max(95).optional(),
  wristThicknessMm: z.number().min(25).max(75).optional(),
  cuffGapMm: z.number().min(15).max(50).optional(),
  braceletFit: z.enum(['SNUG', 'COMFORT', 'LOOSE']).optional(),
});

export const NecklaceMeasurementsSchema = z.object({
  neckCircumferenceInches: z.number().min(11).max(26).optional(),
  preferredChainLengthInches: z.number().min(14).max(36).optional(),
  chainStyle: z.enum(['CABLE', 'CURB', 'ROPE', 'BOX', 'FIGARO']).optional(),
  pendantDropMm: z.number().min(0).max(100).optional(),
});

export const MetalPreferencesSchema = z.object({
  preferredAlloy: z
    .enum(['STERLING_SILVER_925', 'SOLID_BRASS', 'GOLD_18K', 'WHITE_GOLD_14K'])
    .optional(),
  preferredFinish: z
    .enum(['HIGH_POLISH', 'SATIN_MATTE', 'OXIDIZED_PATINA', 'HAMMERED_RAW'])
    .optional(),
});

// ================= Content & CMS Schemas =================

export const ContentPageStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);
export const AnnouncementTypeSchema = z.enum(['INFO', 'WARNING', 'ALERT', 'PROMO']);

export const ContentPageSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  title: z.string().min(1),
  contentMarkdown: z.string(),
  metaDescription: z.string().optional(),
  status: ContentPageStatusSchema,
  isPublished: z.boolean(),
  publishedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateContentPageSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  title: z.string().min(1, 'Title is required'),
  contentMarkdown: z.string().min(1, 'Content cannot be empty'),
  metaDescription: z.string().optional(),
  status: ContentPageStatusSchema.default('DRAFT'),
});

export const UpdateContentPageSchema = z.object({
  title: z.string().min(1).optional(),
  contentMarkdown: z.string().min(1).optional(),
  metaDescription: z.string().optional(),
  status: ContentPageStatusSchema.optional(),
});

export const AnnouncementSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  message: z.string().min(1),
  type: AnnouncementTypeSchema,
  startDate: z.date(),
  endDate: z.date().optional(),
  priority: z.number().int(),
  createdAt: z.date(),
});

export const CreateAnnouncementSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  type: AnnouncementTypeSchema.default('INFO'),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  priority: z.number().int().default(0),
});

export const UpdateAnnouncementSchema = CreateAnnouncementSchema.partial();

export const JewelleryPreferencesSchema = z.object({
  rings: RingMeasurementsSchema.optional(),
  wrists: WristMeasurementsSchema.optional(),
  necklaces: NecklaceMeasurementsSchema.optional(),
  metals: MetalPreferencesSchema.optional(),
  // Flat / legacy compatibility
  ringSizeUs: z.string().optional(),
  ringMandrelMm: z.number().min(12).max(26).optional(),
  wristCircumferenceInches: z.number().min(4.5).max(11).optional(),
  preferredAlloy: z
    .enum(['STERLING_SILVER_925', 'SOLID_BRASS', 'GOLD_18K', 'WHITE_GOLD_14K'])
    .optional(),
  preferredFinish: z
    .enum(['HIGH_POLISH', 'SATIN_MATTE', 'OXIDIZED_PATINA', 'HAMMERED_RAW'])
    .optional(),
});

export const AutoFillContextSchema = z.object({
  category: ProductCategorySchema,
  subcategory: z.string().optional(),
});

export const ResolvedCustomizationDefaultsSchema = z.object({
  category: ProductCategorySchema,
  subcategory: z.string().optional(),
  measurements: z.record(z.union([z.string(), z.number(), z.boolean()])),
  materialPreferences: z.record(z.string()),
  isComplete: z.boolean(),
  missingFields: z.array(z.string()),
  appliedFromVault: z.boolean(),
});

export const UpdateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  denimPreferences: DenimPreferencesSchema.optional(),
  jewelleryPreferences: JewelleryPreferencesSchema.optional(),
});

export const CreateAddressInputSchema = AddressSchema.extend({
  isDefaultShipping: z.boolean().default(false),
  isDefaultBilling: z.boolean().default(false),
});

export type ActorRoleDto = z.infer<typeof ActorRoleSchema>;
export type ProductCategoryDto = z.infer<typeof ProductCategorySchema>;
export type CommerceModelDto = z.infer<typeof CommerceModelSchema>;
export type ProductStatusDto = z.infer<typeof ProductStatusSchema>;
export type VariantStatusDto = z.infer<typeof VariantStatusSchema>;
export type PaymentStatusDto = z.infer<typeof PaymentStatusSchema>;
export type MoneyDto = z.infer<typeof MoneySchema>;
export type AddressDto = z.infer<typeof AddressSchema>;
export type AddToCartDto = z.infer<typeof AddToCartSchema>;
export type CreateCheckoutDto = z.infer<typeof CreateCheckoutSchema>;
export type TransitionProductionStageDto = z.infer<typeof TransitionProductionStageSchema>;
export type CancelOrderDto = z.infer<typeof CancelOrderSchema>;
export type CustomOrderInquiryDto = z.infer<typeof CustomOrderInquirySchema>;
export type DropReturnRequestDto = z.infer<typeof DropReturnRequestSchema>;
export type UpdateVariantStatusDto = z.infer<typeof UpdateVariantStatusSchema>;
export type ShipmentStatusDto = z.infer<typeof ShipmentStatusSchema>;
export type ShipmentItemDto = z.infer<typeof ShipmentItemSchema>;
export type CreateShipmentDto = z.infer<typeof CreateShipmentSchema>;
export type UpdateShipmentTrackingDto = z.infer<typeof UpdateShipmentTrackingSchema>;
export type ReturnStatusDto = z.infer<typeof ReturnStatusSchema>;
export type ApproveReturnDto = z.infer<typeof ApproveReturnSchema>;
export type RejectReturnDto = z.infer<typeof RejectReturnSchema>;
export type AccessLevelDto = z.infer<typeof AccessLevelSchema>;
export type SupportChannelDto = z.infer<typeof SupportChannelSchema>;
export type CustomOrderInquiryStatusDto = z.infer<typeof CustomOrderInquiryStatusSchema>;
export type SignUpDto = z.infer<typeof SignUpSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
export type RequestPasswordResetDto = z.infer<typeof RequestPasswordResetSchema>;
export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;
export type BottomsMeasurementsDto = z.infer<typeof BottomsMeasurementsSchema>;
export type TopsMeasurementsDto = z.infer<typeof TopsMeasurementsSchema>;
export type DenimPreferencesDto = z.infer<typeof DenimPreferencesSchema>;
export type RingMeasurementsDto = z.infer<typeof RingMeasurementsSchema>;
export type WristMeasurementsDto = z.infer<typeof WristMeasurementsSchema>;
export type NecklaceMeasurementsDto = z.infer<typeof NecklaceMeasurementsSchema>;
export type MetalPreferencesDto = z.infer<typeof MetalPreferencesSchema>;
export type JewelleryPreferencesDto = z.infer<typeof JewelleryPreferencesSchema>;
export type AutoFillContextDto = z.infer<typeof AutoFillContextSchema>;
export type ResolvedCustomizationDefaultsDto = z.infer<typeof ResolvedCustomizationDefaultsSchema>;
export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;
export type CreateAddressInputDto = z.infer<typeof CreateAddressInputSchema>;
export type GenderProfileDto = z.infer<typeof GenderProfileSchema>;
export type MeasurementMethodDto = z.infer<typeof MeasurementMethodSchema>;
export type MeasurementUnitDto = z.infer<typeof MeasurementUnitSchema>;
export type StomachProfileDto = z.infer<typeof StomachProfileSchema>;
export type SeatProfileDto = z.infer<typeof SeatProfileSchema>;
export type RisePreferenceDto = z.infer<typeof RisePreferenceSchema>;
export type ContentPageStatusDto = z.infer<typeof ContentPageStatusSchema>;
export type AnnouncementTypeDto = z.infer<typeof AnnouncementTypeSchema>;
export type ContentPageDto = z.infer<typeof ContentPageSchema>;
export type CreateContentPageDto = z.infer<typeof CreateContentPageSchema>;
export type UpdateContentPageDto = z.infer<typeof UpdateContentPageSchema>;
export type AnnouncementDto = z.infer<typeof AnnouncementSchema>;
export type CreateAnnouncementDto = z.infer<typeof CreateAnnouncementSchema>;
export type UpdateAnnouncementDto = z.infer<typeof UpdateAnnouncementSchema>;
