import { z } from "zod"

// Ghana phone number: +233XXXXXXXXX or 0XXXXXXXXX (9 digits after prefix)
export const ghanaPhoneSchema = z.string().regex(
  /^(\+233|0)\d{9}$/,
  "Phone number must be in Ghana format (+233XXXXXXXXX or 0XXXXXXXXX)"
)

// Password: min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")

export const CustomerRegisterSchema = z.object({
  fullName: z.string().min(2, "Full name is required").max(100),
  email: z.string().email("Invalid email address"),
  phoneNumber: ghanaPhoneSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export const VendorRegisterSchema = z.object({
  businessName: z.string().min(2, "Business name is required").max(200),
  ownerFullName: z.string().min(2, "Owner name is required").max(100),
  email: z.string().email("Invalid email address"),
  phoneNumber: ghanaPhoneSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  primaryCategoryId: z.string().min(1, "Please select a primary category"),
  serviceLocations: z.array(z.string()).min(1, "Select at least one service location"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export type CustomerRegisterInput = z.infer<typeof CustomerRegisterSchema>
export type VendorRegisterInput = z.infer<typeof VendorRegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>

export function validatePassword(password: string): boolean {
  return passwordSchema.safeParse(password).success
}

export function validateGhanaPhone(phone: string): boolean {
  return ghanaPhoneSchema.safeParse(phone).success
}
