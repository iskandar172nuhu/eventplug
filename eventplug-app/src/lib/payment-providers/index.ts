import { IPaymentProvider } from "./types"
import { MockPaymentProvider } from "./mock"

export function getPaymentProvider(): IPaymentProvider {
  const provider = process.env.PAYMENT_PROVIDER ?? "MOCK"
  switch (provider) {
    case "MOCK":
    default:
      return new MockPaymentProvider()
  }
}
