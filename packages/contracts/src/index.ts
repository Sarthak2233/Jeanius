/**
 * @jeanius/contracts
 * Zod schemas and boundary validation contracts.
 */
import { z } from 'zod';

export const ActorRoleSchema = z.enum([
  'GUEST',
  'CUSTOMER',
  'MEMBER',
  'JEWELLER',
  'FULFILLMENT',
  'SUPPORT',
  'ADMIN',
]);

export const ProductCategorySchema = z.string().min(1);

export const CategorySchema = z.object({
  id: z.string().uuid(),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(100),
  description: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters').max(100),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().max(500).optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const UpdateCategorySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  description: z.string().max(500).optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

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
  stage: z.enum(['QUEUED', 'CASTING', 'SETTING', 'PATINA', 'POLISHING', 'QC', 'READY', 'SHIPPED']),
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
export const MeasurementUnitSchema = z.enum(['INCHES', 'CM']);

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

export const CraftFocusSchema = z.enum(['GARMENT', 'JEWELLERY', 'DUAL_CRAFT']);

export const UpdateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  jewelleryPreferences: JewelleryPreferencesSchema.nullable().optional(),
});

export const UpdateJewelleryPreferencesSchema = z.object({
  jewelleryPreferences: JewelleryPreferencesSchema.nullable(),
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
export type MeasurementUnitDto = z.infer<typeof MeasurementUnitSchema>;
export type ContentPageStatusDto = z.infer<typeof ContentPageStatusSchema>;
export type AnnouncementTypeDto = z.infer<typeof AnnouncementTypeSchema>;
export type ContentPageDto = z.infer<typeof ContentPageSchema>;
export type CreateContentPageDto = z.infer<typeof CreateContentPageSchema>;
export type UpdateContentPageDto = z.infer<typeof UpdateContentPageSchema>;
export type AnnouncementDto = z.infer<typeof AnnouncementSchema>;
export type CreateAnnouncementDto = z.infer<typeof CreateAnnouncementSchema>;
export type UpdateAnnouncementDto = z.infer<typeof UpdateAnnouncementSchema>;
export type UpdateJewelleryPreferencesDto = z.infer<typeof UpdateJewelleryPreferencesSchema>;
export type CraftFocusDto = z.infer<typeof CraftFocusSchema>;

// ================= Catalog Discovery & Filtering (JN-168 → JN-179) =================
export const ProductSortOptionSchema = z.enum([
  'FEATURED',
  'PRICE_ASC',
  'PRICE_DESC',
  'NEWEST',
  'TITLE_ASC',
]);

export const CatalogFilterCriteriaSchema = z.object({
  category: z.enum(['ALL', 'BOTTOMS', 'TOPS', 'JEWELLERY', 'ACCESSORIES']).default('ALL'),
  commerceModel: z.enum(['ALL', 'OM', 'DROP']).default('ALL'),
  status: z.enum(['ALL', 'PUBLISHED', 'SOLD_OUT', 'SCHEDULED']).default('ALL'),
  minPrice: z.number().int().nonnegative().optional(),
  maxPrice: z.number().int().nonnegative().optional(),
  searchQuery: z.string().optional(),
  sortBy: ProductSortOptionSchema.default('FEATURED'),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(50).default(12),
});

export const ProductImageDtoSchema = z.object({
  id: z.string().optional(),
  url: z.string().min(1),
  altText: z.string(),
  position: z.number().int().default(0),
  isPrimary: z.boolean().default(false),
  width: z.number().int().optional(),
  height: z.number().int().optional(),
});

export const ProductCardDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  basePriceAmount: z.number().int(),
  basePriceCurrency: z.string(),
  commerceModel: z.enum(['OM', 'DROP', 'CUSTOM_ORDER', 'PRE_ORDER']),
  category: ProductCategorySchema,
  status: ProductStatusSchema,
  publishAt: z.string().optional(),
  primaryImage: ProductImageDtoSchema.optional(),
  images: z.array(ProductImageDtoSchema).default([]),
});

export const CategoryCountDtoSchema = z.object({
  category: ProductCategorySchema,
  count: z.number().int().nonnegative(),
});

export const CatalogPageDtoSchema = z.object({
  products: z.array(ProductCardDtoSchema),
  totalCount: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
  categoryCounts: z.array(CategoryCountDtoSchema),
  selectedCategory: z.string(),
  selectedCommerceModel: z.enum(['ALL', 'OM', 'DROP']),
  selectedSort: ProductSortOptionSchema,
});

export type CategoryDto = z.infer<typeof CategorySchema>;
export type CreateCategoryDto = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof UpdateCategorySchema>;
export type ProductSortOptionDto = z.infer<typeof ProductSortOptionSchema>;
export type CatalogFilterCriteriaDto = z.infer<typeof CatalogFilterCriteriaSchema>;
export type ProductImageDto = z.infer<typeof ProductImageDtoSchema>;
export type ProductCardDto = z.infer<typeof ProductCardDtoSchema>;
export type CategoryCountDto = z.infer<typeof CategoryCountDtoSchema>;
export type CatalogPageDto = z.infer<typeof CatalogPageDtoSchema>;

// --- State 10: Product Detail & Configurator Contracts (JN-180 - JN-198) ---

export const OptionValueDtoSchema = z.object({
  id: z.string(),
  code: z.string(),
  label: z.string(),
  priceDeltaAmount: z.number().int().default(0),
  priceDeltaCurrency: z.string().default('USD'),
  isAvailable: z.boolean().default(true),
  position: z.number().int().default(0),
});

export const ProductOptionDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  position: z.number().int().default(0),
  isRequired: z.boolean().default(true),
  values: z.array(OptionValueDtoSchema).default([]),
});

export const ProductVariantDtoSchema = z.object({
  id: z.string(),
  sku: z.string(),
  options: z.record(z.string(), z.string()),
  additionalPriceAmount: z.number().int().default(0),
  additionalPriceCurrency: z.string().default('USD'),
  inventoryCount: z.number().int().default(0),
  status: VariantStatusSchema,
});

export const ProductDetailDtoSchema = ProductCardDtoSchema.extend({
  options: z.array(ProductOptionDtoSchema).default([]),
  variants: z.array(ProductVariantDtoSchema).default([]),
  leadTimeDays: z.number().int().optional(),
  leadTimeDaysMin: z.number().int().optional(),
  leadTimeDaysMax: z.number().int().optional(),
  inputSpecifications: z.record(z.string(), z.unknown()).optional(),
  priceRules: z.array(z.record(z.string(), z.unknown())).optional(),
  craftSpecs: z.record(z.string(), z.string()).optional(),
});

export const ConfiguratorSelectionSchema = z.object({
  productId: z.string().uuid(),
  selectedOptions: z.record(z.string(), z.string()).default({}),
  customSpecifications: z.record(z.string(), z.unknown()).optional(),
  quantity: z.number().int().positive().max(10).default(1),
});

export const ResolvedVariantDtoSchema = z.object({
  variantId: z.string().uuid(),
  sku: z.string(),
  unitPriceAmount: z.number().int(),
  unitPriceCurrency: z.string(),
  isAvailable: z.boolean(),
  inventoryCount: z.number().int(),
  selectedOptions: z.record(z.string(), z.string()),
});

export const AddToCartInputSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  sku: z.string(),
  productTitle: z.string(),
  productSlug: z.string(),
  unitPriceAmount: z.number().int().nonnegative(),
  unitPriceCurrency: z.string().default('USD'),
  selectedOptions: z.record(z.string(), z.string()).default({}),
  customSpecifications: z.record(z.string(), z.unknown()).optional(),
  commerceModel: z.enum(['OM', 'DROP', 'CUSTOM_ORDER', 'PRE_ORDER']).default('OM'),
  imageUrl: z.string().optional(),
  quantity: z.number().int().positive().max(10).default(1),
});

export const CartItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  variantId: z.string().optional(),
  sku: z.string(),
  title: z.string(),
  slug: z.string(),
  commerceModel: z.enum(['OM', 'DROP', 'CUSTOM_ORDER', 'PRE_ORDER']).default('OM'),
  unitPriceAmount: z.number().int().nonnegative(),
  unitPriceCurrency: z.string().default('USD'),
  selectedOptions: z.record(z.string(), z.string()).default({}),
  customSpecifications: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
    .optional(),
  imageUrl: z.string().optional(),
  quantity: z.number().int().positive().max(10).default(1),
});

export const CartDtoSchema = z.object({
  id: z.string(),
  customerId: z.string().nullable().optional(),
  items: z.array(CartItemSchema),
  totalCount: z.number().int().nonnegative(),
  subtotalAmount: z.number().int().nonnegative(),
  currency: z.string().default('USD'),
  updatedAt: z.string(),
});

export const SyncCartInputSchema = z.object({
  items: z.array(CartItemSchema),
});

export const MergeCartInputSchema = z.object({
  guestItems: z.array(CartItemSchema),
});

export type OptionValueDto = z.infer<typeof OptionValueDtoSchema>;
export type ProductOptionDto = z.infer<typeof ProductOptionDtoSchema>;
export type ProductVariantDto = z.infer<typeof ProductVariantDtoSchema>;
export type ProductDetailDto = z.infer<typeof ProductDetailDtoSchema>;
export type ConfiguratorSelectionDto = z.infer<typeof ConfiguratorSelectionSchema>;
export type ResolvedVariantDto = z.infer<typeof ResolvedVariantDtoSchema>;
export type AddToCartInputDto = z.infer<typeof AddToCartInputSchema>;
export type CartItemDto = z.infer<typeof CartItemSchema>;
export type CartDto = z.infer<typeof CartDtoSchema>;
export type SyncCartInputDto = z.infer<typeof SyncCartInputSchema>;
export type MergeCartInputDto = z.infer<typeof MergeCartInputSchema>;
