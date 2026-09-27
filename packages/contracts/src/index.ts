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
  stage: z.enum([
    'QUEUED',
    'CUTTING',
    'SEWING',
    'WASHING',
    'HARDWARE',
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
  productCategory: z.enum(['BOTTOMS', 'TOPS', 'ACCESSORIES']),
  desiredFabricWeight: z.string().optional(),
  description: z.string().min(20, 'Please describe your custom request in detail'),
  referenceImageUrls: z.array(z.string().url()).optional(),
});

export type ActorRoleDto = z.infer<typeof ActorRoleSchema>;
export type CommerceModelDto = z.infer<typeof CommerceModelSchema>;
export type MoneyDto = z.infer<typeof MoneySchema>;
export type AddressDto = z.infer<typeof AddressSchema>;
export type AddToCartDto = z.infer<typeof AddToCartSchema>;
export type CreateCheckoutDto = z.infer<typeof CreateCheckoutSchema>;
export type TransitionProductionStageDto = z.infer<typeof TransitionProductionStageSchema>;
export type CancelOrderDto = z.infer<typeof CancelOrderSchema>;
export type CustomOrderInquiryDto = z.infer<typeof CustomOrderInquirySchema>;
