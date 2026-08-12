# Implementation Plan: Ghana Events Marketplace

## Overview

A two-sided marketplace for event services and rentals in Ghana. Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Prisma, and NextAuth.js v5. The plan follows the 20-group order specified by the user, from project setup through final polish, with property-based tests (fast-check) covering all 13 correctness properties defined in the design.

---

## Tasks

- [x] 1. Project setup and design system
  - [x] 1.1 Initialise Next.js 14 App Router project with TypeScript and configure `tsconfig.json`, `next.config.ts`, `.env.example`, and root `src/` directory structure as per design architecture
    - Create all directory stubs: `src/app`, `src/lib`, `src/components`, `src/actions`
    - _Requirements: 20.1, 20.8_
  - [x] 1.2 Install and configure Tailwind CSS with the Ghana-inspired brand colour palette (`brand.primary`, `brand.secondary`, `brand.accent`) and responsive breakpoints (320px, 768px, 1280px)
    - Apply design-system token values from `tailwind.config.ts` in design.md
    - _Requirements: 20.1, 20.8_
  - [x] 1.3 Install and configure shadcn/ui; add core primitives: Button, Card, Input, Select, Checkbox, Dialog, Dropdown, Badge, Tabs, Skeleton, Toast (Sonner), Form, Calendar, Separator
    - _Requirements: 20.2, 20.4, 20.5_
  - [x] 1.4 Set up Prisma with PostgreSQL: initialise `prisma/schema.prisma` with all enums and models from the design data model section
    - Include all enums: Role, VendorStatus, VendorType, BookingStatus, QuoteStatus, PaymentType, PaymentStatus, PaymentMethod, PricingPeriod, DisputeType, DisputeStatus, DisputeOutcome, MessageReadStatus, AvailabilityState
    - _Requirements: 4.1, 10.1, 12.1_
  - [x] 1.5 Configure NextAuth.js v5 with JWT strategy in `src/lib/auth/config.ts`; define session model encoding `userId`, `role`, and `vendorProfileId`; add `src/lib/auth/guards.ts` with `requireAuth(role?)` helper
    - _Requirements: 1.5, 1.10, 1.11_
  - [x] 1.6 Create `src/lib/errors.ts` with `AppError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `InsufficientInventoryError`, and `BookingConflictError` classes
    - _Requirements: 10.1, 4.6_
  - [x] 1.7 Create `src/middleware.ts` enforcing auth and role-based route protection for `/dashboard/customer/*`, `/dashboard/vendor/*`, `/dashboard/admin/*`
    - _Requirements: 1.10, 1.11_
  - [x] 1.8 Set up Vitest and fast-check: install dependencies, create `vitest.config.ts`, add `src/__tests__/` directory, and verify test runner with a trivial passing test
    - _Requirements: (testing infrastructure)_

- [x] 2. Database schema and seed data
  - [x] 2.1 Run `prisma migrate dev --name init` to create the initial database migration from the schema defined in task 1.4; verify all tables, indexes, and constraints are created correctly
    - _Requirements: 4.1, 4.2_
  - [x] 2.2 Create `prisma/seed.ts` with idempotent seed script: admin account, 22 categories (SERVICE and RENTAL), 6 approved vendor accounts across Accra/Kumasi/Cape Coast, service packages, rental items with inventory, 3 customer accounts, 2+ completed bookings with payments and reviews
    - Seed business: Kwame's Decor Studio, Ama Photography Co., Adom Event Planners, Akosua's Kitchen, Gold Coast Furniture Hire, AccraBeat Sound & Lights
    - Create demonstration inventory: 500 chairs total, 300 reserved on 2025-12-20
    - Use `upsert` throughout for idempotency
    - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5, 21.6_
  - [x] 2.3 Create `src/lib/db/index.ts` exporting a singleton Prisma client; create `src/lib/db/helpers.ts` with common query helpers (paginate, buildOrderBy)
    - _Requirements: (infrastructure)_

- [x] 3. Authentication
  - [x] 3.1 Create Zod validation schemas in `src/lib/validations/auth.ts`: `CustomerRegisterSchema` (fullName, email, phone, password), `VendorRegisterSchema` (businessName, ownerFullName, email, phone, password, primaryCategoryId, serviceLocations), `LoginSchema`; enforce password policy (8 chars, uppercase, lowercase, digit)
    - _Requirements: 1.2, 1.3, 1.8_
  - [ ]* 3.2 Write property test for password validation (Property 2)
    - **Property 2: Password Validation Is Universal**
    - Test that the password validator accepts a string if and only if it meets all four criteria (length ≥ 8, has uppercase, has lowercase, has digit); use `fc.string()` with custom generators for valid and invalid passwords
    - **Validates: Requirements 1.8**
  - [ ]* 3.3 Write property test for duplicate email registration rejection (Property 1)
    - **Property 1: Duplicate Email Registration Rejected**
    - Use `fc.emailAddress()` to generate emails; assert that registering the same email twice returns a duplicate-email error on the second call
    - **Validates: Requirements 1.4**
  - [x] 3.4 Create `src/actions/auth.ts` with `registerCustomerAction`, `registerVendorAction` (sets vendor status to PENDING and sends admin notification), and `loginAction` server actions; wire NextAuth `signIn` / `signOut`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.7, 1.9_
  - [x] 3.5 Build registration and login pages: `src/app/(auth)/register/customer/page.tsx`, `src/app/(auth)/register/vendor/page.tsx`, `src/app/(auth)/login/page.tsx` with React Hook Form + Zod resolver, inline field validation, and post-login redirect support (`?callbackUrl`)
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.6, 1.9_
  - [x] 3.6 Implement role-based redirect after login: Customers → `/dashboard/customer`, Vendors → `/dashboard/vendor`, Admins → `/dashboard/admin`
    - _Requirements: 1.5, 1.11_
  - [ ]* 3.7 Write property test for Ghana phone number validation (Property 12)
    - **Property 12: Ghana Phone Number Validation**
    - Generate strings matching `(+233|0)[0-9]{9}` and assert acceptance; generate strings not matching (wrong prefix, wrong length, non-digits) and assert rejection
    - **Validates: Requirements 20.7**

- [x] 4. Public homepage
  - [x] 4.1 Create shared layout components: `src/components/shared/CurrencyDisplay.tsx` (formats GH₵), `src/components/shared/PhoneInput.tsx` (+233/0 format), `src/components/shared/SkeletonCard.tsx`, `src/components/shared/EmptyState.tsx`, `src/components/shared/ConfirmDialog.tsx`, `src/components/shared/ToastProvider.tsx`
    - _Requirements: 20.2, 20.3, 20.4, 20.5, 20.6, 20.7_
  - [x] 4.2 Build `src/components/marketing/HeroSearch.tsx` (client component): event location select, event date picker, category select, submit navigates to `/vendors` with pre-populated query params
    - _Requirements: 17.2_
  - [x] 4.3 Build homepage sections as server components: PopularCategories (from active categories), FeaturedVendors (isFeatured=true, up to 6), PopularRentalCategories (up to 8), HowItWorks, ValuePropositions, TestimonialsPlaceholder, VendorCTA, Footer with required links
    - _Requirements: 17.1, 17.3, 17.4, 17.5_
  - [x] 4.4 Assemble `src/app/(marketing)/page.tsx` wiring all homepage sections in the correct order; add loading skeleton for FeaturedVendors and PopularCategories
    - _Requirements: 17.1, 20.2_

- [x] 5. Vendor marketplace listing page
  - [x] 5.1 Implement `src/lib/modules/search/vendor-search.ts` with `searchVendors(params)`: build Prisma `where` clause from `VendorSearchParams`, filter out unapproved vendors and vendors with no active listings, exclude vendors unavailable on the requested date, apply ordering and pagination (20/page)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.3_
  - [x] 5.2 Build `src/components/marketplace/VendorCard.tsx`: business name, cover/logo image, primary category, service locations, starting price (GH₵), average star rating, review count, verification badge, availability status
    - _Requirements: 7.1_
  - [x] 5.3 Build `src/components/marketplace/FilterSidebar.tsx`: category filter, location filter, price range, min rating, verified status, date availability; client component that updates URL search params
    - _Requirements: 6.1, 6.5_
  - [x] 5.4 Build `src/components/marketplace/VendorGrid.tsx` with pagination control (load-more or page numbers)
    - _Requirements: 7.3_
  - [x] 5.5 Assemble `src/app/(marketplace)/vendors/page.tsx` as a server component that reads URL search params, calls `searchVendors`, renders `VendorGrid` + `FilterSidebar`; include empty state when no results
    - _Requirements: 6.6, 7.1, 7.3, 20.3_

- [x] 6. Vendor profile pages
  - [x] 6.1 Build `src/components/vendor-profile/ProfileHeader.tsx`: cover image, logo, business name, verification badge, average rating, review count, completed booking count, location, areas served, and CTA buttons (Request Quote, Book Now, Message)
    - Unauthenticated users clicking CTAs are redirected to login with `?callbackUrl` back to the profile
    - _Requirements: 8.1, 8.5, 8.6_
  - [x] 6.2 Build `src/components/vendor-profile/ServicePackageCard.tsx`, `src/components/vendor-profile/PortfolioGallery.tsx`, `src/components/vendor-profile/ReviewsList.tsx` (10 most recent approved reviews), `src/components/vendor-profile/AvailabilityCalendar.tsx` (3-state, 3-month rolling window)
    - _Requirements: 8.2, 8.3, 8.4, 5.3_
  - [x] 6.3 Assemble `src/app/(marketplace)/vendors/[slug]/page.tsx` as a server component: fetch vendor by slug, render ProfileHeader, ServicePackageCards, PortfolioGallery, ReviewsList, AvailabilityCalendar; return 404 for unknown slugs or unapproved vendors
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 7. Rental marketplace
  - [x] 7.1 Implement `src/lib/modules/search/rental-search.ts` with `searchRentalItems(params)`: filter by category, location, active status, approved vendor; join `RentalInventory` for date-based availability; filter by `minQuantity` when date and quantity provided
    - _Requirements: 6.7, 6.8_
  - [x] 7.2 Build `src/components/marketplace/RentalItemCard.tsx`: item image, item name, vendor name, location, price per unit (GH₵), pricing period, available quantity, delivery availability indicator
    - _Requirements: 7.2_
  - [x] 7.3 Build `src/components/marketplace/RentalGrid.tsx` with pagination (20/page)
    - _Requirements: 7.3_
  - [x] 7.4 Assemble `src/app/(marketplace)/rentals/page.tsx` as a server component: reads URL params, calls `searchRentalItems`, renders `RentalGrid` with filter controls; empty state when no results
    - _Requirements: 6.7, 7.2, 7.3, 20.3_
  - [x] 7.5 Build `src/app/(marketplace)/rentals/[id]/page.tsx`: all item images, full description, vendor details, pricing, delivery options, available quantity for a selected date; Add to Cart button
    - _Requirements: 7.4, 7.5_

- [x] 8. Quote system
  - [x] 8.1 Create Zod schemas in `src/lib/validations/quote.ts`: `QuoteRequestSchema` (eventType, eventDate, eventLocation, guestCount, description, budget, notes, up to 5 inspirationUrls), `QuotationSchema` (totalPrice, itemisedDetails, extras, travelFee, depositRequired, paymentNotes, expiresAt)
    - _Requirements: 9.1, 9.3_
  - [x] 8.2 Create `src/actions/quote.ts`: `submitQuoteRequestAction` (creates QuoteRequest + Conversation, notifies vendor), `submitQuotationAction` (Vendor creates Quotation, notifies customer), `acceptQuotationAction` (creates Booking with AWAITING_DEPOSIT status, notifies vendor), `declineQuotationAction` (sets Quotation to DECLINED, notifies vendor)
    - _Requirements: 9.2, 9.4, 9.6, 9.8_
  - [x] 8.3 Implement quotation expiry job in `src/lib/modules/quote/expire-quotations.ts`: find all SENT quotations where `expiresAt < now()`, set status to EXPIRED, notify customers; this function is called by a cron route `/api/cron/expire-quotations`
    - _Requirements: 9.7_
  - [ ]* 8.4 Write property test for expired quotation status transition (Property 7)
    - **Property 7: Expired Quotations Transition Correctly**
    - Use `fc.date()` with dates in the past; assert that any non-ACCEPTED quotation with `expiresAt` in the past is set to EXPIRED by the expiry function
    - **Validates: Requirements 9.7**
  - [x] 8.5 Build `src/components/forms/QuoteRequestForm.tsx` and `src/components/forms/QuotationForm.tsx` with React Hook Form + Zod
    - _Requirements: 9.1, 9.3_
  - [x] 8.6 Build quote comparison view in `src/app/dashboard/customer/quotes/[id]/compare/page.tsx`: side-by-side display of up to 3 quotations for the same event date and category
    - _Requirements: 9.5_

- [x] 9. Booking system
  - [x] 9.1 Implement `src/lib/modules/booking/status-machine.ts`: define `ALLOWED_TRANSITIONS` map and `assertValidTransition(from, to)` function that throws `BookingConflictError` on invalid transitions; cover all statuses from the state machine diagram
    - _Requirements: 10.1, 10.8_
  - [ ]* 9.2 Write property test for invalid booking status transitions (Property 8)
    - **Property 8: Invalid Booking Status Transitions Are Rejected**
    - Generate all `(fromStatus, toStatus)` pairs not in the allowed-transition map using `fc.constantFrom`; assert each call to `assertValidTransition` throws `BookingConflictError`
    - **Validates: Requirements 10.1, 10.8**
  - [x] 9.3 Create `src/actions/booking.ts`: `updateBookingStatusAction` (calls `assertValidTransition`, applies update, notifies parties), `cancelBookingAction` (Customer-initiated, allowed in PENDING/AWAITING_DEPOSIT without approval; CONFIRMED triggers vendor notification and admin flag for vendor-initiated), `markBookingCompleteAction` (Vendor marks complete, unlocks review)
    - _Requirements: 10.2, 10.4, 10.5, 10.6, 10.7, 10.8_
  - [x] 9.4 Implement auto-transition job `src/lib/modules/booking/auto-transitions.ts`: find all CONFIRMED bookings where `eventDate <= today`, transition to IN_PROGRESS; called by cron route `/api/cron/booking-transitions`
    - _Requirements: 10.3_
  - [x] 9.5 Create `src/app/api/bookings/route.ts` and `src/app/api/bookings/[id]/route.ts` implementing GET and PATCH endpoints per the API route table in the design
    - _Requirements: 10.7_

- [x] 10. Rental cart and checkout
  - [x] 10.1 Implement client-side cart state using React Context + localStorage in `src/lib/cart/cart-context.tsx`: add item (eventDate, quantity, delivery preference), remove item, clear cart; validate availability before add
    - _Requirements: 11.1, 11.2_
  - [x] 10.2 Build `src/components/forms/RentalCartForm.tsx`: cart summary showing all rental items, quantities, unit prices, delivery charges, total (GH₵); quantity and delivery preference controls
    - _Requirements: 11.3_
  - [x] 10.3 Create `createRentalBookingAction` in `src/actions/booking.ts`: group cart items by vendorId, create one Booking per vendor with associated BookingItems; call `reserveInventory` inside a Prisma transaction for each booking
    - _Requirements: 11.4, 11.5_
  - [x] 10.4 Build checkout page `src/app/dashboard/customer/cart/page.tsx`: renders `RentalCartForm`, proceed-to-checkout button calls `createRentalBookingAction`, navigates to payment on success
    - _Requirements: 11.1, 11.3, 11.4_

- [x] 11. Inventory management
  - [x] 11.1 Implement `src/lib/modules/inventory/reserve.ts` with `reserveInventory(tx, rentalItemId, eventDate, quantity)` and `releaseInventory(tx, rentalItemId, eventDate, quantity)` using `RentalInventory` upsert + atomic increment/decrement within a Prisma transaction; throw `InsufficientInventoryError` when available < requested
    - _Requirements: 4.3, 4.4, 4.5, 4.6_
  - [ ]* 11.2 Write property test for inventory initialisation (Property 3)
    - **Property 3: Rental Item Initialises With Full Availability**
    - Use `fc.integer({ min: 1, max: 10000 })` for totalQuantity; assert that newly created rental items have `reservedQty = 0` for all event dates
    - **Validates: Requirements 4.2**
  - [ ]* 11.3 Write property test for available quantity formula (Property 4)
    - **Property 4: Available Quantity Formula Is Consistent**
    - Use `fc.integer` for totalQuantity and `fc.array` of booking quantities; assert `availableQty = totalQuantity - sum(confirmedBookingQtys)`
    - **Validates: Requirements 4.5**
  - [ ]* 11.4 Write property test for inventory round-trip (Property 5)
    - **Property 5: Inventory Round-Trip — Reserve Then Release**
    - Use `fc.integer({ min: 1, max: 1000 })` for totalQuantity and booking quantity; assert that reserve increases `reservedQty` by exactly `q`, then release decreases it by exactly `q` restoring original
    - **Validates: Requirements 4.3, 4.4**
  - [ ]* 11.5 Write property test for overbooking prevention (Property 6)
    - **Property 6: Overbooking Is Never Permitted**
    - Use `fc.array` of booking requests on a single event date; assert that `reservedQty ≤ totalQuantity` holds after any accepted or rejected sequence
    - **Validates: Requirements 4.6**
  - [x] 11.6 Create `src/actions/vendor.ts` functions `createRentalItemAction` and `updateRentalInventoryAction`; initialise `RentalInventory.reservedQty = 0` on item creation
    - _Requirements: 4.1, 4.2_
  - [x] 11.7 Build vendor inventory dashboard page `src/app/dashboard/vendor/inventory/page.tsx`: table of rental items with current reserved/available quantities per date; add/edit/delete rental item forms
    - _Requirements: 4.1, 4.7_

- [ ] 12. Checkpoint — inventory and booking core
  - Ensure all Vitest unit tests and property tests added so far pass. Verify seed data loads without error. Ask the user if questions arise.

- [x] 13. Payment mock
  - [x] 13.1 Create `src/lib/payment-providers/types.ts` with `IPaymentProvider` interface, `PaymentInitiateRequest`, `PaymentInitiateResponse`, `PaymentVerifyResponse` types as specified in the design
    - _Requirements: 12.4_
  - [x] 13.2 Create `src/lib/payment-providers/mock.ts` with `MockPaymentProvider`: amounts ending in `.99` (pesewas mod 100 === 99) return FAILED; all others return SUCCESS with a `MOCK-{timestamp}` reference
    - _Requirements: 12.3, 12.4_
  - [x] 13.3 Create `src/lib/payment-providers/index.ts` with `getPaymentProvider()` factory reading `PAYMENT_PROVIDER` env var, defaulting to `MockPaymentProvider`
    - _Requirements: 12.4_
  - [x] 13.4 Create `src/actions/payment.ts` with `initiatePaymentAction`: create PENDING Payment record, call provider `initiatePayment`, update Payment and Booking on SUCCESS/FAILED; handle deposit, full, and balance payment types
    - _Requirements: 12.1, 12.2, 12.5, 12.6_
  - [ ]* 13.5 Write property test for payment record completeness (Property 9)
    - **Property 9: Payment Record Completeness**
    - Use `fc.record` to generate valid payment inputs; assert every SUCCESS payment row has non-null bookingId, positive amount, valid paymentType, valid paymentMethod, non-null timestamp, and `status = SUCCESS`
    - **Validates: Requirements 12.5**
  - [x] 13.6 Build payment page `src/app/dashboard/customer/payments/[bookingId]/page.tsx`: show booking summary, payment type selector (deposit/full/balance), GH₵ amount, mock payment button; call `initiatePaymentAction`; display success/failure toast
    - _Requirements: 12.1, 12.2, 12.3, 12.6_

- [x] 14. Messaging system
  - [x] 14.1 Implement `src/lib/modules/messaging/conversations.ts`: `getOrCreateConversation(customerId, vendorId)` that checks for an existing conversation before creating a new one (deduplication); `createQuoteConversation(quoteRequestId)` and `createDirectConversation(customerId, vendorId)`
    - _Requirements: 13.1, 13.5_
  - [x] 14.2 Create `src/actions/message.ts` with `sendMessageAction` (record sender, conversationId, body, sentAt, readStatus=UNREAD) and `markConversationReadAction` (set all messages from other party to READ when user opens conversation)
    - _Requirements: 13.2, 13.3_
  - [x] 14.3 Implement `getUnreadCount(userId)` in `src/lib/modules/messaging/unread.ts` using the aggregate query from the design
    - _Requirements: 13.4_
  - [ ]* 14.4 Write property test for conversation read-all on open (Property 13)
    - **Property 13: Opening a Conversation Marks All Its Messages as Read**
    - Use `fc.array(fc.record(...))` to generate conversations with varying numbers of UNREAD messages from the other participant; assert that after `markConversationReadAction` every message has `readStatus = READ`
    - **Validates: Requirements 13.3**
  - [x] 14.5 Create API routes `src/app/api/messages/conversations/route.ts` and `src/app/api/messages/conversations/[id]/route.ts` for GET (list conversations, get messages with `?after=` param) and POST (send message); design supports future real-time upgrade without model changes
    - _Requirements: 13.2, 13.6_
  - [x] 14.6 Build messaging UI pages: `src/app/dashboard/customer/messages/page.tsx` and `src/app/dashboard/vendor/messages/page.tsx` — conversation list with unread badge; `src/app/dashboard/customer/messages/[id]/page.tsx` — message thread with polling (5-second refetch interval)
    - _Requirements: 13.4, 13.5_

- [x] 15. Reviews and ratings
  - [x] 15.1 Create Zod schema `ReviewSchema` in `src/lib/validations/review.ts`: rating (1–5 integer), reviewText; attach bookingId and submission date server-side
    - _Requirements: 14.2_
  - [x] 15.2 Implement `src/actions/review.ts` `submitReviewAction`: verify booking is COMPLETED and no prior review exists for this booking by this customer; create Review record; atomically update `VendorProfile.averageRating` and `totalReviews` using aggregate recalculation
    - _Requirements: 14.1, 14.2, 14.3, 14.6_
  - [ ]* 15.3 Write property test for vendor rating arithmetic mean (Property 10)
    - **Property 10: Vendor Rating Is the Arithmetic Mean of All Reviews**
    - Use `fc.array(fc.integer({ min: 1, max: 5 }), { minLength: 1 })` for ratings; assert `averageRating === sum(ratings)/n` and `totalReviews === n` after recording all reviews
    - **Validates: Requirements 14.3**
  - [ ]* 15.4 Write property test for duplicate review rejection (Property 11)
    - **Property 11: Duplicate Reviews Are Rejected**
    - Use a COMPLETED booking fixture; assert that submitting a second review for the same booking by the same customer returns an error
    - **Validates: Requirements 14.6**
  - [x] 15.5 Build `src/components/forms/ReviewForm.tsx` and wire it to the customer booking detail page; show form only when booking is COMPLETED and no review exists
    - _Requirements: 14.1, 14.2_

- [x] 16. Dispute management
  - [x] 16.1 Create Zod schema `DisputeSchema` in `src/lib/validations/dispute.ts`: disputeType (enum), description, up to 5 evidenceUrls; validate booking is in CONFIRMED, IN_PROGRESS, or COMPLETED status
    - _Requirements: 15.1, 15.2_
  - [x] 16.2 Create `src/actions/dispute.ts` `raiseDisputeAction`: create Dispute record, transition Booking to DISPUTED via `assertValidTransition`, notify Admin; create `resolveDisputeAction` (Admin only): record resolutionNote, outcome, transition Booking to COMPLETED or CANCELLED
    - _Requirements: 15.1, 15.2, 15.3, 15.5_
  - [x] 16.3 Build `src/components/forms/DisputeForm.tsx` and wire it to the booking detail page (visible for CONFIRMED, IN_PROGRESS, COMPLETED bookings)
    - _Requirements: 15.1, 15.2_
  - [x] 16.4 Build Admin dispute management page `src/app/dashboard/admin/disputes/page.tsx`: list all open disputes with booking details, dispute type, description, evidence; resolve/escalate/close actions
    - _Requirements: 15.4, 15.5_

- [x] 17. Customer dashboard
  - [x] 17.1 Create `src/app/dashboard/customer/layout.tsx` with sidebar navigation: Overview, My Bookings, Quote Requests, Messages (unread badge), Favourites, Payments, Reviews, Profile
    - _Requirements: 18.1, 13.4_
  - [x] 17.2 Build `src/app/dashboard/customer/page.tsx` (Overview): active bookings count, pending quotes count, unread messages count, upcoming events within 30 days; use `StatCard` components
    - _Requirements: 18.2_
  - [x] 17.3 Build `src/app/dashboard/customer/bookings/page.tsx`: list all bookings with `BookingStatusBadge`; detail page `[id]/page.tsx` showing full booking info, payment history, review form (if COMPLETED), dispute button (if applicable), and cancel button (PENDING/AWAITING_DEPOSIT)
    - _Requirements: 18.4, 12.7, 10.5_
  - [x] 17.4 Build `src/app/dashboard/customer/quotes/page.tsx`: list all quote requests and received quotations; link to comparison view; accept/decline quotation actions
    - _Requirements: 9.5, 9.6, 9.8_
  - [x] 17.5 Build `src/app/dashboard/customer/favourites/page.tsx`: list saved vendors; implement `saveFavouriteAction` and toggle button on vendor profile page
    - _Requirements: 18.3_
  - [x] 17.6 Build `src/app/dashboard/customer/profile/page.tsx`: edit full name, phone number, profile photo with Uploadthing
    - _Requirements: 18.5_

- [x] 18. Vendor dashboard
  - [x] 18.1 Create `src/app/dashboard/vendor/layout.tsx` with sidebar: Overview, Bookings, Quote Requests, Calendar, Services, Rental Inventory, Messages, Payments, Reviews, Analytics, Business Profile
    - _Requirements: 19.1_
  - [x] 18.2 Build `src/app/dashboard/vendor/page.tsx` (Overview): total active bookings, pending quotes, unread messages, upcoming confirmed bookings within 7 days, monthly earnings (GH₵)
    - _Requirements: 19.2_
  - [x] 18.3 Build `src/app/dashboard/vendor/bookings/page.tsx`: list all vendor bookings with status; accept/reject PENDING bookings; detail page with booking items, payment status, mark-complete button (IN_PROGRESS), cancel button (CONFIRMED)
    - _Requirements: 19.3, 10.4, 10.6_
  - [x] 18.4 Build `src/app/dashboard/vendor/calendar/page.tsx`: calendar UI allowing vendor to mark specific dates or recurring weekdays as unavailable using `setAvailabilityAction`
    - _Requirements: 5.1, 5.2_
  - [x] 18.5 Build `src/app/dashboard/vendor/services/page.tsx`: CRUD for service packages (create, edit, activate/deactivate, delete); forms validated with `ServicePackageSchema`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  - [x] 18.6 Build `src/app/dashboard/vendor/analytics/page.tsx`: total bookings by month bar chart, total earnings by month, average rating trend, most booked service/item, customer repeat rate
    - _Requirements: 19.4_
  - [x] 18.7 Build `src/app/dashboard/vendor/profile/page.tsx`: edit business name, description (1000 char limit), logo, cover image, service locations, categories; verification status badges; Uploadthing integration for images
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [x] 19. Admin dashboard
  - [x] 19.1 Create `src/app/dashboard/admin/layout.tsx` with sidebar: Overview, Vendors, Categories, Bookings, Reviews, Disputes, Featured Vendors, Reports
    - _Requirements: 16.1_
  - [x] 19.2 Build `src/app/dashboard/admin/page.tsx` (Overview): total customers, approved vendors, total bookings, completed bookings, total booking value (GH₵), popular categories, recent activity feed
    - _Requirements: 16.1_
  - [x] 19.3 Build `src/app/dashboard/admin/vendors/page.tsx`: list all vendors with status filter (pending/approved/suspended); approve (`approveVendorAction`) and suspend (`suspendVendorAction`) actions with confirmation dialogs
    - _Requirements: 16.2, 16.3, 16.4_
  - [x] 19.4 Build `src/app/dashboard/admin/categories/page.tsx`: category management — create, rename, reorder (drag or display order field), deactivate; use `manageCategoryAction`
    - _Requirements: 16.5, 22.1, 22.2, 22.3, 22.4_
  - [x] 19.5 Build `src/app/dashboard/admin/bookings/page.tsx`: list all bookings with filters for status, date range, category
    - _Requirements: 16.6_
  - [x] 19.6 Build `src/app/dashboard/admin/reviews/page.tsx`: list all reviews; hide/show review action (Admin hides without deleting, notifies customer)
    - _Requirements: 16.8, 14.5_
  - [x] 19.7 Build `src/app/dashboard/admin/featured/page.tsx`: select up to 6 approved vendors to feature on homepage; toggle `isFeatured` flag
    - _Requirements: 16.7, 17.3_
  - [x] 19.8 Build `src/app/dashboard/admin/reports/page.tsx`: date range selector; exportable tables for bookings, payments, and vendor activity as CSV
    - _Requirements: 16.9_

- [ ] 20. Checkpoint — dashboards complete
  - Ensure all dashboard routes render correctly, all server actions return typed results, all property tests pass, and the seed script produces a fully navigable demo. Ask the user if questions arise.

- [x] 21. Notifications system
  - [x] 21.1 Create `createNotification(userId, title, body, link?)` helper in `src/lib/modules/notifications/create.ts`; call it at each relevant event: booking status changes, new quotation received, quotation accepted/declined/expired, deposit received, booking completed, dispute raised, dispute resolved, vendor approved/suspended
    - _Requirements: (notifications for all booking/quote/payment events)_
  - [x] 21.2 Build notification bell component `src/components/shared/NotificationBell.tsx`: icon with unread count badge; dropdown list of recent notifications with read/unread state; `markNotificationReadAction` on click
    - _Requirements: (in-app notification display)_
  - [x] 21.3 Add `NotificationBell` to all dashboard layouts (customer, vendor, admin)
    - _Requirements: (notifications visible in dashboards)_

- [x] 22. Final polish
  - [x] 22.1 Add skeleton loading states to every data-fetching page/component: wrap server component data fetches with `<Suspense fallback={<SkeletonCard />}>`; ensure no layout shift during page load
    - _Requirements: 20.2_
  - [x] 22.2 Add `EmptyState` components to all list and search result pages (vendors, rentals, bookings, quotes, messages, favourites, reviews, disputes)
    - _Requirements: 20.3_
  - [x] 22.3 Wire `ToastProvider` (Sonner) for all data-modifying actions: booking created, message sent, profile saved, quote submitted, payment processed, review submitted, dispute raised, category created, vendor approved/suspended
    - _Requirements: 20.4_
  - [x] 22.4 Add `ConfirmDialog` before all irreversible actions: booking cancellation, account deletion, vendor suspension, review hide, rental item delete, service package delete
    - _Requirements: 20.5_
  - [x] 22.5 Audit and fix responsive layout at 320px, 768px, and 1280px+: test all pages at each breakpoint; fix any overflow, stacking, or spacing issues in navigation, cards, forms, and tables
    - _Requirements: 20.1_
  - [x] 22.6 Verify GH₵ currency symbol appears on all monetary values and +233/0 phone format is enforced on all phone number inputs
    - _Requirements: 20.6, 20.7_

- [ ] 23. Final checkpoint — all tests pass
  - Run the full Vitest suite including all 13 property-based tests. Verify seed script is idempotent. Confirm all dashboard routes are protected. Ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP.
- Property tests are co-located with their implementation tasks for early error detection.
- All 13 correctness properties from the design document are covered: P1 (task 3.3), P2 (task 3.2), P3 (task 11.2), P4 (task 11.3), P5 (task 11.4), P6 (task 11.5), P7 (task 8.4), P8 (task 9.2), P9 (task 13.5), P10 (task 15.3), P11 (task 15.4), P12 (task 3.7), P13 (task 14.4).
- fast-check is used for all property-based tests; Vitest is the test runner.
- Each property test file is tagged: `// Feature: ghana-events-marketplace, Property N: <text>`.
- Checkpoints (tasks 12, 20, 23) are not included in the dependency graph.

## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": 0,
      "tasks": ["1.1", "1.2", "1.3", "1.6"]
    },
    {
      "id": 1,
      "tasks": ["1.4", "1.5", "1.7", "1.8"]
    },
    {
      "id": 2,
      "tasks": ["2.1", "2.3"]
    },
    {
      "id": 3,
      "tasks": ["2.2"]
    },
    {
      "id": 4,
      "tasks": ["3.1", "4.1", "9.1", "13.1"]
    },
    {
      "id": 5,
      "tasks": ["3.2", "3.3", "3.7", "8.1", "14.1", "15.1", "16.1"]
    },
    {
      "id": 6,
      "tasks": ["3.4", "3.5", "3.6"]
    },
    {
      "id": 7,
      "tasks": ["4.2", "4.3", "5.1", "7.1", "8.2", "9.3", "11.1", "13.2", "13.3"]
    },
    {
      "id": 8,
      "tasks": ["4.4", "5.2", "5.3", "5.4", "7.2", "7.3", "8.3", "9.2", "10.1", "13.2", "14.2", "14.3"]
    },
    {
      "id": 9,
      "tasks": ["5.5", "6.1", "7.4", "8.4", "8.5", "9.4", "9.5", "10.2", "11.2", "11.3", "11.4", "11.5", "13.4", "13.5", "14.5", "15.2", "16.2"]
    },
    {
      "id": 10,
      "tasks": ["6.2", "7.5", "8.6", "10.3", "11.6", "13.6", "15.3", "15.4", "16.3", "21.1"]
    },
    {
      "id": 11,
      "tasks": ["6.3", "10.4", "11.7", "14.4", "14.6", "15.5", "16.4", "17.1", "18.1", "19.1"]
    },
    {
      "id": 12,
      "tasks": ["17.2", "17.3", "17.4", "17.5", "17.6", "18.2", "18.3", "18.4", "18.5", "18.6", "18.7", "19.2", "19.3", "19.4", "19.5", "19.6", "19.7", "19.8", "21.2"]
    },
    {
      "id": 13,
      "tasks": ["21.3", "22.1", "22.2", "22.3", "22.4", "22.5", "22.6"]
    }
  ]
}
```
