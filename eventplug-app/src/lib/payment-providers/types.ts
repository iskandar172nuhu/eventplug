export interface PaymentInitiateRequest {
  bookingId: string
  amount: number // In pesewas (GH₵ × 100)
  currency: "GHS"
  paymentType: "FULL" | "DEPOSIT" | "BALANCE"
  customerPhone: string
  customerEmail: string
  description: string
  callbackUrl: string
  metadata?: Record<string, unknown>
}

export interface PaymentInitiateResponse {
  providerRef: string
  checkoutUrl?: string // Redirect URL for hosted payment pages
  status: "PENDING" | "SUCCESS" | "FAILED"
}

export interface PaymentVerifyResponse {
  providerRef: string
  status: "SUCCESS" | "FAILED" | "PENDING"
  amount: number
  metadata?: Record<string, unknown>
}

export interface IPaymentProvider {
  readonly name: string
  initiatePayment(request: PaymentInitiateRequest): Promise<PaymentInitiateResponse>
  verifyPayment(providerRef: string): Promise<PaymentVerifyResponse>
  processWebhook(payload: unknown, signature: string): Promise<PaymentVerifyResponse>
}
