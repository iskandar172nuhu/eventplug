# Requirements Document

## Introduction

Ghana Events Marketplace is a two-sided marketplace platform connecting customers who need event services and rental items with vendors who provide those services in Ghana. The platform replaces fragmented discovery through Instagram, TikTok, Facebook, WhatsApp, and personal referrals with a single, trustworthy, modern marketplace. It supports service vendors (event planners, photographers, decorators, caterers, DJs, etc.) and rental vendors (chairs, tables, canopies, tents, sound systems, etc.), enabling customers to search, compare, quote, book, pay, and review — all in one place.

---

## Glossary

- **Platform**: The Ghana Events Marketplace web application
- **Customer**: A registered user who discovers and books event services or rental items
- **Vendor**: A registered business or individual offering event services or rental items
- **Admin**: A Platform operator with full administrative access
- **Service Vendor**: A Vendor offering labour or skill-based event services (e.g. photography, catering, decoration)
- **Rental Vendor**: A Vendor offering physical items for hire (e.g. chairs, tents, sound systems)
- **Listing**: A Vendor's published service package or rental item available for discovery
- **Quote Request**: A Customer's submission of event details requesting a price from a Vendor
- **Quotation**: A Vendor's priced response to a Quote Request
- **Booking**: A confirmed agreement between a Customer and Vendor for services or rental items
- **Booking Item**: A single service or rental line item within a Booking
- **Inventory**: The total and available quantity of a specific Rental Item owned by a Rental Vendor
- **Availability Calendar**: A Vendor-maintained schedule indicating dates when the Vendor is available or unavailable
- **Deposit**: A partial upfront payment made by a Customer to confirm a Booking
- **Conversation**: A threaded message exchange between a Customer and Vendor
- **Review**: A Customer's post-booking star rating and written feedback for a Vendor
- **Dispute**: A formal complaint raised by a Customer or Vendor regarding a Booking
- **Verification Badge**: A trust indicator shown on a Vendor Profile after identity/business verification
- **GH₵**: Ghana Cedis, the currency used throughout the Platform
- **Search_Engine**: The Platform component responsible for vendor and rental item discovery
- **Quote_System**: The Platform component managing Quote Requests and Quotations
- **Booking_System**: The Platform component managing Bookings and their lifecycle
- **Inventory_System**: The Platform component managing Rental Item quantities and availability
- **Payment_System**: The Platform component handling payment transactions
- **Messaging_System**: The Platform component managing Conversations and Messages
- **Review_System**: The Platform component managing Reviews
- **Auth_System**: The Platform component managing user registration, login, and role-based access
- **Admin_Dashboard**: The Platform interface used by Admins to manage the marketplace
- **Customer_Dashboard**: The Platform interface used by Customers to manage their activity
- **Vendor_Dashboard**: The Platform interface used by Vendors to manage their business

---

## Requirements

### Requirement 1: User Registration and Authentication

**User Story:** As a visitor, I want to register and log in to the Platform, so that I can access features appropriate to my role as a Customer or Vendor.

#### Acceptance Criteria

1. THE Auth_System SHALL provide separate registration flows for Customers and Vendors.
2. WHEN a Customer registers, THE Auth_System SHALL collect full name, email address, phone number, and password.
3. WHEN a Vendor registers, THE Auth_System SHALL collect business name, owner full name, email address, phone number, password, primary service category, and business location.
4. WHEN a registration form is submitted with an email address already associated with an existing account, THE Auth_System SHALL reject the submission and display a duplicate email error message.
5. WHEN a user submits a login form with valid credentials, THE Auth_System SHALL authenticate the user and redirect them to their role-specific dashboard.
6. WHEN a user submits a login form with invalid credentials, THE Auth_System SHALL reject the submission and display an authentication failure message without disclosing which field is incorrect.
7. WHEN a Vendor completes registration, THE Auth_System SHALL set the Vendor account status to pending approval and notify the Admin.
8. THE Auth_System SHALL enforce password minimum length of 8 characters containing at least one uppercase letter, one lowercase letter, and one number.
9. WHEN an authenticated user requests logout, THE Auth_System SHALL invalidate the session and redirect the user to the homepage.
10. THE Auth_System SHALL protect all dashboard routes, redirecting unauthenticated requests to the login page.
11. THE Auth_System SHALL enforce role-based access, preventing Customers from accessing Vendor routes and Vendors from accessing Customer-only routes.

---

### Requirement 2: Vendor Profile and Business Setup

**User Story:** As a Vendor, I want to create and manage my business profile, so that Customers can discover my services and trust my business.

#### Acceptance Criteria

1. THE Vendor_Dashboard SHALL allow a Vendor to upload a business logo and cover image.
2. THE Vendor_Dashboard SHALL allow a Vendor to enter a business description of up to 1000 characters.
3. THE Vendor_Dashboard SHALL allow a Vendor to select one or more service categories from the Platform's managed category list.
4. THE Vendor_Dashboard SHALL allow a Vendor to specify service locations by selecting from the supported Ghanaian regions and cities.
5. THE Vendor_Dashboard SHALL allow a Vendor to upload portfolio images with captions.
6. WHEN a Vendor saves their business profile, THE Vendor_Dashboard SHALL validate that business name, primary category, and at least one service location are present before saving.
7. THE Vendor_Dashboard SHALL display a verification status indicator showing which of the following are verified: phone number, Ghana Card, business registration, and service address.
8. WHERE a Vendor has not yet been approved by an Admin, THE Platform SHALL display the Vendor's profile as unlisted and prevent it from appearing in search results.

---

### Requirement 3: Service Packages and Pricing

**User Story:** As a Service Vendor, I want to define service packages with pricing, so that Customers can understand what I offer and at what cost.

#### Acceptance Criteria

1. THE Vendor_Dashboard SHALL allow a Service Vendor to create one or more service packages per service category.
2. WHEN creating a service package, THE Vendor_Dashboard SHALL collect package name, description, list of included services, starting price in GH₵, and optional add-ons with individual prices.
3. THE Vendor_Dashboard SHALL allow a Vendor to mark a service package as active or inactive.
4. WHEN a service package is set to inactive, THE Platform SHALL exclude it from Vendor profile pages and search results.
5. THE Vendor_Dashboard SHALL allow a Vendor to edit and delete existing service packages.

---

### Requirement 4: Rental Item and Inventory Management

**User Story:** As a Rental Vendor, I want to list rental items with quantities and pricing, so that Customers can browse available items and book them without overbooking.

#### Acceptance Criteria

1. THE Vendor_Dashboard SHALL allow a Rental Vendor to create rental item listings with the following fields: item name, category, description, images (minimum one), price per unit in GH₵, pricing period (per day or per event), total quantity owned, minimum order quantity, service location, delivery available flag, delivery charge in GH₵, setup available flag, and setup charge in GH₵.
2. WHEN a Rental Item listing is saved, THE Inventory_System SHALL initialise the available quantity equal to the total quantity owned.
3. WHEN a Booking containing a Rental Item is confirmed, THE Inventory_System SHALL reduce the available quantity for that item on the booked event date by the quantity booked.
4. WHEN a Booking containing a Rental Item is cancelled or marked completed, THE Inventory_System SHALL restore the previously reserved quantity to available for the relevant event date.
5. WHEN a Customer queries availability of a Rental Item for a specific event date, THE Inventory_System SHALL return the quantity available on that date (total quantity minus sum of confirmed bookings for that date).
6. THE Inventory_System SHALL prevent a Booking from being confirmed if the requested quantity for any Rental Item on the event date exceeds the available quantity for that date.
7. THE Vendor_Dashboard SHALL display current inventory levels per item per date to the Vendor.

---

### Requirement 5: Availability Calendar Management

**User Story:** As a Vendor, I want to manage my availability calendar, so that Customers can see when I am available before booking.

#### Acceptance Criteria

1. THE Vendor_Dashboard SHALL provide a calendar interface allowing a Vendor to mark specific dates as unavailable.
2. THE Vendor_Dashboard SHALL allow a Vendor to set recurring weekly unavailability (e.g. mark every Monday as unavailable).
3. WHEN a Customer views a Vendor Profile, THE Platform SHALL display a availability indicator for dates within a 3-month rolling window using three states: Available, Limited Availability, and Unavailable.
4. WHEN a Vendor marks a date as unavailable, THE Booking_System SHALL reject any new booking requests for that Vendor on that date.
5. WHEN a Booking is confirmed for a Service Vendor on a specific date, THE Availability Calendar SHALL reflect that date as having a confirmed commitment.

---

### Requirement 6: Search and Discovery

**User Story:** As a Customer, I want to search and filter vendors and rental items, so that I can find the right match for my event needs quickly.

#### Acceptance Criteria

1. THE Search_Engine SHALL accept the following search parameters simultaneously: event location (Ghanaian region or city), event date, vendor category, minimum price in GH₵, and maximum price in GH₵.
2. WHEN a search is executed, THE Search_Engine SHALL return only approved Vendors with at least one active Listing matching the specified category.
3. WHEN an event date is provided in a search, THE Search_Engine SHALL exclude Vendors who are marked unavailable on that date.
4. THE Search_Engine SHALL support sorting of results by: relevance (default), average rating (descending), price (ascending), and number of completed bookings (descending).
5. THE Search_Engine SHALL support filtering results by: minimum star rating, verified status, and availability on a specific date.
6. WHEN a search returns no results, THE Platform SHALL display an empty state message with suggestions to broaden the search criteria.
7. THE Platform SHALL provide a dedicated rental item search allowing Customers to search by item category, event location, event date, and minimum quantity required.
8. WHEN a rental item search includes an event date and quantity, THE Search_Engine SHALL return only Rental Items with sufficient available quantity on that date.

---

### Requirement 7: Vendor and Rental Item Marketplace Pages

**User Story:** As a Customer, I want to browse paginated listings of vendors and rental items with visual cards, so that I can quickly compare options.

#### Acceptance Criteria

1. THE Platform SHALL display a Vendor Marketplace page showing Vendor cards with: business name, cover or logo image, primary category, service locations, starting price in GH₵, average star rating, number of reviews, verification badge if verified, and availability status.
2. THE Platform SHALL display a Rental Marketplace page showing Rental Item cards with: item image, item name, Vendor name, location, price per unit in GH₵, pricing period, available quantity, and delivery availability indicator.
3. THE Platform SHALL paginate Marketplace results at 20 items per page and display a load-more or pagination control.
4. WHEN a Customer clicks a Vendor card, THE Platform SHALL navigate to the full Vendor Profile page for that Vendor.
5. WHEN a Customer clicks a Rental Item card, THE Platform SHALL display detailed item information including all images, full description, Vendor details, pricing, delivery options, and available quantity.

---

### Requirement 8: Vendor Profile Page

**User Story:** As a Customer, I want to view a comprehensive Vendor profile, so that I can evaluate the Vendor's credibility, portfolio, and offerings before contacting them.

#### Acceptance Criteria

1. THE Platform SHALL display a Vendor Profile page containing: cover image, logo, business name, verification badge, average rating, number of reviews, number of completed bookings, location, areas served, business description, and portfolio gallery.
2. THE Platform SHALL display all active service packages on the Vendor Profile page with name, description, included services, price, and optional add-ons.
3. THE Platform SHALL display all active Rental Item listings on the Vendor Profile page.
4. THE Platform SHALL display a Reviews section on the Vendor Profile page showing the 10 most recent approved reviews with star rating, written review, and booking reference.
5. THE Platform SHALL display a Request Quote button, a Book Now button, and a Message button on the Vendor Profile page.
6. WHEN an unauthenticated visitor clicks Request Quote, Book Now, or Message on a Vendor Profile page, THE Platform SHALL redirect the visitor to the login page with a post-login redirect back to the same Vendor Profile.

---

### Requirement 9: Quote Request and Quotation System

**User Story:** As a Customer, I want to request a quote from a Vendor and receive a detailed price proposal, so that I can make an informed booking decision.

#### Acceptance Criteria

1. WHEN a Customer submits a Quote Request, THE Quote_System SHALL collect: event type, event date, event location, estimated number of guests, required services or items description, customer budget in GH₵, additional notes, and optional inspiration images (maximum 5).
2. WHEN a Quote Request is submitted, THE Quote_System SHALL create a Conversation linked to that Quote Request and notify the Vendor.
3. WHEN a Vendor submits a Quotation in response to a Quote Request, THE Quote_System SHALL collect: total quoted price in GH₵, itemised services or items included, optional extras with prices, travel fee in GH₵ if applicable, deposit amount required in GH₵, payment notes, and quotation expiry date.
4. WHEN a Quotation is submitted by a Vendor, THE Quote_System SHALL notify the Customer and display the Quotation in the Customer's dashboard.
5. THE Customer_Dashboard SHALL display all received Quotations with the ability to compare up to 3 Quotations side by side for the same event date and category.
6. WHEN a Customer accepts a Quotation, THE Quote_System SHALL create a Booking with status Awaiting Deposit and notify the Vendor.
7. WHEN a Quotation reaches its expiry date without being accepted, THE Quote_System SHALL automatically set the Quotation status to Expired and notify the Customer.
8. WHEN a Customer declines a Quotation, THE Quote_System SHALL update the Quotation status to Declined and notify the Vendor.

---

### Requirement 10: Booking Lifecycle Management

**User Story:** As a Customer and Vendor, I want bookings to progress through a clear set of statuses, so that both parties always know the current state of the engagement.

#### Acceptance Criteria

1. THE Booking_System SHALL support the following booking statuses in order: Pending, Quote Requested, Quote Sent, Awaiting Deposit, Confirmed, In Progress, Completed, Cancelled, Disputed.
2. WHEN a Customer pays the required deposit for a Booking in Awaiting Deposit status, THE Booking_System SHALL transition the Booking to Confirmed status and notify both the Customer and Vendor.
3. WHEN the event date of a Confirmed Booking is reached, THE Booking_System SHALL automatically transition the Booking to In Progress status.
4. WHEN a Vendor marks a Booking as completed, THE Booking_System SHALL transition the Booking to Completed status, notify the Customer, and unlock the Review_System for that Booking.
5. WHEN a Customer cancels a Booking with Confirmed status, THE Booking_System SHALL transition the Booking to Cancelled status and notify the Vendor.
6. WHEN a Vendor cancels a Confirmed Booking, THE Booking_System SHALL transition the Booking to Cancelled status, notify the Customer, and flag the cancellation for Admin review.
7. THE Booking_System SHALL store for each Booking: customer reference, vendor reference, event date, event location, list of Booking Items, total amount in GH₵, deposit amount in GH₵, amount paid in GH₵, outstanding amount in GH₵, payment history, booking notes, current status, created timestamp, and last updated timestamp.
8. WHEN a Booking is in Completed or Cancelled status, THE Booking_System SHALL prevent any further status changes to that Booking.

---

### Requirement 11: Rental Booking and Cart

**User Story:** As a Customer, I want to add multiple rental items to a single booking, so that I can rent chairs, tables, and other items from one or multiple vendors in one transaction.

#### Acceptance Criteria

1. THE Platform SHALL allow a Customer to add Rental Items to a booking cart by specifying event date, quantity, and delivery or pickup preference.
2. WHEN a Customer adds a Rental Item to the cart, THE Inventory_System SHALL verify that the requested quantity is available on the specified event date and display an error if it is not.
3. THE Platform SHALL display a cart summary showing all selected Rental Items with quantities, unit prices, delivery charges, and total amount in GH₵.
4. WHEN a Customer proceeds to book from the cart, THE Booking_System SHALL create one Booking per Vendor represented in the cart, each containing only that Vendor's items.
5. WHEN a rental Booking is confirmed, THE Inventory_System SHALL reserve the booked quantities for each item on the event date.

---

### Requirement 12: Payment Processing

**User Story:** As a Customer, I want to pay for bookings securely using Ghanaian payment methods, so that my booking is confirmed and the Vendor is compensated.

#### Acceptance Criteria

1. THE Payment_System SHALL display all amounts in GH₵.
2. THE Payment_System SHALL support three payment types: full payment, deposit payment (partial upfront), and remaining balance payment.
3. THE Payment_System SHALL provide a mock payment flow during development that simulates successful and failed payment outcomes without processing real transactions.
4. THE Payment_System SHALL be designed with an abstraction layer that allows integration of Ghanaian payment providers (Mobile Money, Paystack, Hubtel) without changing the booking or payment data model.
5. WHEN a payment is processed successfully, THE Payment_System SHALL record a payment transaction with: booking reference, amount in GH₵, payment type, payment method, timestamp, and transaction status.
6. WHEN a payment fails, THE Payment_System SHALL notify the Customer with an error message and leave the Booking status unchanged.
7. THE Customer_Dashboard SHALL display a payment history for each Booking showing all transactions with amounts, dates, and statuses.

---

### Requirement 13: Messaging System

**User Story:** As a Customer or Vendor, I want to send and receive messages linked to bookings and quote requests, so that we can communicate about event details directly on the Platform.

#### Acceptance Criteria

1. THE Messaging_System SHALL create a Conversation automatically when a Quote Request is submitted or when a Customer clicks the Message button on a Vendor Profile.
2. WHEN a message is sent, THE Messaging_System SHALL record: sender reference, conversation reference, message body, sent timestamp, and read status.
3. WHEN a recipient opens a Conversation, THE Messaging_System SHALL mark all unread messages in that Conversation as read.
4. THE Customer_Dashboard and Vendor_Dashboard SHALL display an unread message count badge on the Messages navigation item.
5. THE Messaging_System SHALL link each Conversation to its associated Booking or Quote Request reference when applicable.
6. THE Messaging_System SHALL be designed to support real-time message delivery in a future upgrade without requiring changes to the message data model.

---

### Requirement 14: Reviews and Ratings

**User Story:** As a Customer, I want to leave a review after a completed booking, so that other Customers can benefit from my experience and Vendors are held accountable.

#### Acceptance Criteria

1. THE Review_System SHALL allow a Customer to submit a review only for Bookings with Completed status where the Customer has not yet submitted a review.
2. WHEN a Customer submits a review, THE Review_System SHALL collect: star rating from 1 to 5, written review text, and automatically attach the booking reference and submission date.
3. WHEN a review is submitted, THE Review_System SHALL update the Vendor's average star rating and total review count immediately.
4. THE Platform SHALL display approved reviews on the Vendor Profile page with star rating, written review text, booking reference, and submission date.
5. IF a review contains content that violates platform guidelines, THEN THE Admin_Dashboard SHALL allow an Admin to hide the review without deleting it and notify the Customer.
6. THE Review_System SHALL prevent duplicate reviews by the same Customer for the same Booking.

---

### Requirement 15: Dispute Management

**User Story:** As a Customer or Vendor, I want to raise a dispute when a booking goes wrong, so that the Admin can investigate and resolve the issue fairly.

#### Acceptance Criteria

1. THE Platform SHALL allow a Customer or Vendor to raise a Dispute for a Booking in Confirmed, In Progress, or Completed status.
2. WHEN a Dispute is raised, THE Platform SHALL collect a dispute type (vendor no-show, item not delivered, quality issue, payment issue, other), a written description of the issue, and optional evidence images.
3. WHEN a Dispute is raised, THE Booking_System SHALL transition the Booking status to Disputed and notify the Admin.
4. THE Admin_Dashboard SHALL display all open Disputes with booking details, dispute type, description, evidence, and actions to resolve, escalate, or close the Dispute.
5. WHEN an Admin resolves a Dispute, THE Admin_Dashboard SHALL require the Admin to record a resolution note and select an outcome (resolved in Customer's favour, resolved in Vendor's favour, or mutual resolution).

---

### Requirement 16: Admin Dashboard and Platform Management

**User Story:** As an Admin, I want a comprehensive dashboard to manage the marketplace, so that I can ensure platform quality, approve vendors, handle disputes, and monitor performance.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL display an overview with total registered Customers, total approved Vendors, total Bookings, total Completed Bookings, total booking value in GH₵, most popular categories, and a recent activity feed.
2. THE Admin_Dashboard SHALL list all Vendors with status (pending, approved, suspended) and allow an Admin to approve or suspend a Vendor account.
3. WHEN an Admin approves a Vendor, THE Auth_System SHALL activate the Vendor account, making the Vendor's profile visible in search results.
4. WHEN an Admin suspends a Vendor, THE Platform SHALL immediately hide the Vendor's profile from all search results and public pages.
5. THE Admin_Dashboard SHALL allow an Admin to create, rename, reorder, and deactivate service and rental categories without requiring code changes.
6. THE Admin_Dashboard SHALL display all Bookings with filtering by status, date range, and category.
7. THE Admin_Dashboard SHALL allow an Admin to manage featured Vendors by selecting which approved Vendors appear in the Featured Vendors section on the homepage.
8. THE Admin_Dashboard SHALL allow an Admin to view and hide individual reviews.
9. THE Admin_Dashboard SHALL provide a Reports section with exportable data for bookings, payments, and vendor activity within a user-specified date range.

---

### Requirement 17: Homepage and Marketing Pages

**User Story:** As a visitor, I want a compelling homepage that communicates the platform's value and helps me start searching immediately, so that I understand how the platform works and feel confident using it.

#### Acceptance Criteria

1. THE Platform SHALL display a homepage with the following sections in order: hero section with search bar, popular categories, featured vendors, popular rental items, how it works, customer and vendor value propositions, testimonials placeholder, vendor call-to-action, and footer.
2. THE Platform's hero search bar SHALL accept event location, event date, and vendor category and submit a search to the Vendor Marketplace page with those parameters pre-populated.
3. THE Platform SHALL display up to 6 featured Vendors on the homepage as selected by an Admin.
4. THE Platform SHALL display up to 8 popular rental item categories on the homepage linked to filtered Rental Marketplace results.
5. THE Platform's footer SHALL contain links to: About, How It Works, Vendor Registration, Customer Registration, Privacy Policy, Terms of Service, and Contact.

---

### Requirement 18: Customer Dashboard

**User Story:** As a Customer, I want a personal dashboard to manage all my bookings, quotes, messages, payments, favourites, and reviews in one place.

#### Acceptance Criteria

1. THE Customer_Dashboard SHALL contain the following navigation sections: Overview, My Bookings, Quote Requests, Messages, Favourites, Payments, Reviews, and Profile.
2. THE Customer_Dashboard Overview SHALL display: active bookings count, pending quote requests count, unread messages count, and upcoming events within the next 30 days.
3. THE Customer_Dashboard SHALL allow a Customer to save a Vendor to Favourites from the Vendor Profile page and view all saved Vendors in the Favourites section.
4. THE Customer_Dashboard SHALL allow a Customer to cancel a Booking that is in Pending or Awaiting Deposit status without Admin approval.
5. THE Customer_Dashboard SHALL display the Customer's profile with the ability to update full name, phone number, and profile photo.

---

### Requirement 19: Vendor Dashboard

**User Story:** As a Vendor, I want a comprehensive dashboard to manage my bookings, calendar, listings, inventory, messages, payments, and analytics in one place.

#### Acceptance Criteria

1. THE Vendor_Dashboard SHALL contain the following navigation sections: Overview, Bookings, Quote Requests, Calendar, Services, Rental Inventory, Messages, Payments, Reviews, Analytics, and Business Profile.
2. THE Vendor_Dashboard Overview SHALL display: total active bookings, pending quote requests, unread messages, upcoming confirmed bookings within 7 days, and monthly earnings in GH₵.
3. THE Vendor_Dashboard SHALL allow a Vendor to accept or reject incoming Bookings in Pending status.
4. THE Vendor_Dashboard Analytics section SHALL display: total bookings by month, total earnings by month in GH₵, average rating trend, most booked service or item, and customer repeat rate.
5. THE Vendor_Dashboard SHALL allow a Vendor to update their business profile, service packages, rental items, and availability calendar at any time.

---

### Requirement 20: Mobile Responsiveness and UI Standards

**User Story:** As a Customer or Vendor, I want to use the Platform on any device, so that I can manage my bookings and services from a smartphone, tablet, or desktop.

#### Acceptance Criteria

1. THE Platform SHALL render all pages correctly at viewport widths of 320px, 768px, and 1280px and above.
2. THE Platform SHALL implement skeleton loading states for all data-fetching components to prevent layout shift during page load.
3. THE Platform SHALL display appropriate empty state illustrations and messages when lists or search results contain no items.
4. THE Platform SHALL display toast notifications for all user actions that modify data (booking created, message sent, profile saved, etc.).
5. THE Platform SHALL display confirmation dialogs before irreversible actions such as cancellations and deletions.
6. THE Platform SHALL use GH₵ as the currency symbol for all displayed monetary values.
7. THE Platform SHALL support Ghanaian phone number format (+233 or 0 prefix with 9-digit local number) in all phone number input fields.
8. THE Platform's customer-facing pages SHALL follow a visual design consistent with premium marketplace platforms (clean layout, professional typography, generous whitespace, high-quality card components).
9. THE Platform's vendor and admin dashboards SHALL follow a visual design consistent with professional SaaS applications (clear navigation, data-focused layout, action-oriented interface).

---

### Requirement 21: Data Seeding and Demo Content

**User Story:** As a developer or evaluator, I want the Platform to contain realistic Ghanaian demo data, so that all features can be demonstrated end-to-end without manual data entry.

#### Acceptance Criteria

1. THE Platform's seed script SHALL create a minimum of 6 approved Vendor accounts across at least 3 Ghanaian cities (Accra, Kumasi, Cape Coast).
2. THE Platform's seed script SHALL create Vendors covering at minimum the following categories: wedding decoration, event planning, photography, catering, chair and table rental, and sound and lighting.
3. THE Platform's seed script SHALL create realistic Ghanaian business names and pricing in GH₵ appropriate to each service category.
4. THE Platform's seed script SHALL create a minimum of 3 Customer accounts with at least 2 completed Bookings and associated Reviews.
5. THE Platform's seed script SHALL create one Admin account.
6. THE Platform's seed script SHALL create rental item inventory entries demonstrating the overbooking prevention logic (e.g. a vendor with 500 chairs, 300 reserved on a specific date, leaving 200 available).

---

### Requirement 22: Category Extensibility

**User Story:** As an Admin, I want to add new vendor and rental categories through the dashboard, so that the Platform can expand to new event service types without requiring developer changes.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL provide a Category Management interface where an Admin can create a new category with: category name, type (service or rental), icon reference, display order, and active status.
2. WHEN a new category is created and set to active, THE Platform SHALL immediately make it available in Vendor registration, Vendor profile category selection, and search filters.
3. WHEN a category is deactivated, THE Platform SHALL hide it from all public-facing search filters and Vendor category selectors while preserving existing Vendor associations with that category.
4. THE Platform's data model SHALL support an arbitrary number of categories without schema changes.
