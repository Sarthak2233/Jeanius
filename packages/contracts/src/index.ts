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
  'FULFILLMENT',
  'SUPPORT',
  'ADMIN',
]);

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
});

export const CreateCheckoutSchema = z.object({
  cartId: z.string().uuid(),
  customerEmail: z.string().email(),
  shippingAddress: AddressSchema,
});

export const TransitionProductionStageSchema = z.object({
  jobId: z.string().uuid(),
  stage: z.enum(['QUEUED', 'CUTTING', 'SEWING', 'WASHING', 'HARDWARE', 'QC', 'READY', 'SHIPPED']),
  notes: z.string().optional(),
});

export const CancelOrderSchema = z.object({
  orderId: z.string().uuid(),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
});

export const CustomOrderInquirySchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  productCategory: z.enum(['BOTTOMS', 'TOPS', 'ACCESSORIES']),
  desiredFabricWeight: z.string().optional(),
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
      message: 'You must confirm the garment is unworn and unwashed with tags intact',
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

export type ActorRoleDto = z.infer<typeof ActorRoleSchema>;
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
