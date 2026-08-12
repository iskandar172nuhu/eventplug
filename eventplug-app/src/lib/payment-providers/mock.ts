import {
  IPaymentProvider,
  PaymentInitiateRequest,
  PaymentInitiateResponse,
  PaymentVerifyResponse,
} from "./types"

export class MockPaymentProvider implements IPaymentProvider {
  readonly name = "MOCK"

  async initiatePayment(
    req: PaymentInitiateRequest
  ): Promise<PaymentInitiateResponse> {
    // Amounts ending in .99 (pesewas mod 100 === 99) simulate failure
    const willFail = req.amount % 100 === 99
    return {
      providerRef: `MOCK-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      status: willFail ? "FAILED" : "SUCCESS",
    }
  }

  async verifyPayment(providerRef: string): Promise<PaymentVerifyResponse> {
    return { providerRef, status: "SUCCESS", amount: 0 }
  }

  async processWebhook(
    payload: unknown,
    _signature: string
  ): Promise<PaymentVerifyResponse> {
    return { providerRef: "MOCK-webhook", status: "SUCCESS", amount: 0 }
  }
}
