import { z } from "zod";

export const standardSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});

export const studentSchema = z.object({
  studentCode: z.string().min(2),
  fullName: z.string().min(2),
  standardId: z.string().min(1),
  guardianName: z.string().min(2),
  contactNumber: z.string().optional().or(z.literal("")),
  whatsappNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  admissionDate: z.string().min(1),
  status: z.string().min(1),
  notes: z.string().optional(),
  customFeeAmount: z.coerce.number().int().positive().optional().or(z.literal("")),
});

export const feeStructureSchema = z.object({
  standardId: z.string().min(1),
  feeType: z.string().min(2),
  amount: z.coerce.number().int().positive(),
  billingCycle: z.string().min(2),
});

export const paymentSchema = z.object({
  studentId: z.string().min(1),
  feeType: z.string().min(2),
  feePeriod: z.string().min(2),
  amountReceived: z.coerce.number().int().positive(),
  paymentDate: z.string().min(1),
  paymentMode: z.string().min(2),
  receivedBy: z.string().min(2),
  notes: z.string().optional(),
});

export const settingsSchema = z.object({
  className: z.string().min(2),
  address: z.string().optional(),
  contactNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  invoicePrefix: z.string().min(1).max(8),
  currency: z.string().min(3).max(3),
  logoUrl: z.string().optional(),
});
