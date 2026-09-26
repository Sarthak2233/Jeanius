/**
 * @jeanius/contracts
 * Zod schemas and boundary validation contracts.
 */
import { z } from 'zod';

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

export type MoneyDto = z.infer<typeof MoneySchema>;
export type AddressDto = z.infer<typeof AddressSchema>;
export type AddToCartDto = z.infer<typeof AddToCartSchema>;
export type CreateCheckoutDto = z.infer<typeof CreateCheckoutSchema>;
export type TransitionProductionStageDto = z.infer<typeof TransitionProductionStageSchema>;
