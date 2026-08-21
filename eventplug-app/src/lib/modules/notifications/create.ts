import { db } from "@/lib/db"

interface CreateNotificationParams {
  userId: string
  title: string
  body: string
  link?: string
}

export async function createNotification({ userId, title, body, link }: CreateNotificationParams) {
  return db.notification.create({
    data: {
      userId,
      title,
      body,
      link: link ?? null,
      isRead: false,
    },
  })
}

/**
 * Notify a vendor about a new quote request
 */
export async function notifyVendorNewQuoteRequest(vendorUserId: string, customerName: string, eventType: string) {
  return createNotification({
    userId: vendorUserId,
    title: "New Quote Request",
    body: `${customerName} requested a quote for ${eventType}`,
    link: "/dashboard/vendor/quotes",
  })
}

/**
 * Notify a vendor about a new message
 */
export async function notifyVendorNewMessage(vendorUserId: string, customerName: string, conversationId: string) {
  return createNotification({
    userId: vendorUserId,
    title: "New Message",
    body: `${customerName} sent you a message`,
    link: `/dashboard/vendor/messages/${conversationId}`,
  })
}

/**
 * Notify a customer that a vendor responded to their quote
 */
export async function notifyCustomerQuoteResponse(customerUserId: string, vendorName: string, quoteRequestId: string) {
  return createNotification({
    userId: customerUserId,
    title: "Quote Received",
    body: `${vendorName} sent you a quotation`,
    link: "/dashboard/customer/quotes",
  })
}

/**
 * Notify a customer about a new message
 */
export async function notifyCustomerNewMessage(customerUserId: string, vendorName: string, conversationId: string) {
  return createNotification({
    userId: customerUserId,
    title: "New Message",
    body: `${vendorName} sent you a message`,
    link: `/dashboard/customer/messages/${conversationId}`,
  })
}

/**
 * Notify a vendor that a customer accepted their quotation
 */
export async function notifyVendorQuoteAccepted(vendorUserId: string, customerName: string) {
  return createNotification({
    userId: vendorUserId,
    title: "Quote Accepted",
    body: `${customerName} accepted your quotation`,
    link: "/dashboard/vendor/bookings",
  })
}

/**
 * Notify a vendor that a customer declined their quotation
 */
export async function notifyVendorQuoteDeclined(vendorUserId: string, customerName: string) {
  return createNotification({
    userId: vendorUserId,
    title: "Quote Declined",
    body: `${customerName} declined your quotation`,
    link: "/dashboard/vendor/quotes",
  })
}

/**
 * Notify a customer about a booking status change
 */
export async function notifyCustomerBookingUpdate(customerUserId: string, vendorName: string, newStatus: string, bookingId: string) {
  return createNotification({
    userId: customerUserId,
    title: "Booking Updated",
    body: `${vendorName} updated your booking to ${newStatus.replace(/_/g, " ").toLowerCase()}`,
    link: `/dashboard/customer/bookings/${bookingId}`,
  })
}
