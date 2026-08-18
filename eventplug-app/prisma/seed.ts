import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── 1. Admin Account ────────────────────────────────────────────────────────
  const adminPasswordHash = await hash("Admin1234", 12);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@ghanaevents.com" },
    update: {},
    create: {
      email: "admin@ghanaevents.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });
  console.log("✅ Admin account created");

  // ─── 2. Categories ───────────────────────────────────────────────────────────
  const serviceCategories = [
    "Event Planner",
    "Event Decorator",
    "Wedding Decoration",
    "Event Planning",
    "Photography",
    "Catering",
    "DJ & Music",
    "DJ & Entertainment",
    "MC Services",
    "Hair & Makeup",
    "Makeup & Beauty",
    "Photography & Videography",
    "Videography",
    "Security",
    "Florist",
    "Ushering",
    "Sound Engineering",
    "Lighting",
    "Cakes",
    "Transportation",
    "Venues",
    "Other",
  ];

  const rentalCategories = [
    "Chairs & Tables",
    "Canopies & Tents",
    "Sound & Lighting Equipment",
    "Stage & Risers",
    "Linen & Tablecloth",
    "Crockery & Cutlery",
    "Generator Hire",
    "Decoration Props",
    "Photo Booth",
  ];

  const categories: Record<string, string> = {};

  for (let i = 0; i < serviceCategories.length; i++) {
    const name = serviceCategories[i];
    const cat = await prisma.vendorCategory.upsert({
      where: { name },
      update: {},
      create: {
        name,
        type: "SERVICE",
        displayOrder: i + 1,
        isActive: true,
      },
    });
    categories[name] = cat.id;
  }

  for (let i = 0; i < rentalCategories.length; i++) {
    const name = rentalCategories[i];
    const cat = await prisma.vendorCategory.upsert({
      where: { name },
      update: {},
      create: {
        name,
        type: "RENTAL",
        displayOrder: serviceCategories.length + i + 1,
        isActive: true,
      },
    });
    categories[name] = cat.id;
  }
  console.log(`✅ ${serviceCategories.length + rentalCategories.length} categories created`);

  // ─── 3. Vendor Accounts ──────────────────────────────────────────────────────
  const vendorPasswordHash = await hash("Vendor1234", 12);

  const vendorData = [
    {
      email: "kwame@ghanaevents.com",
      businessName: "Kwame's Decor Studio",
      slug: "kwames-decor-studio",
      ownerFullName: "Kwame Asante",
      phoneNumber: "+233244000001",
      vendorType: "BOTH" as const,
      serviceLocations: ["Accra", "Tema", "East Legon"],
      primaryCategory: "Wedding Decoration",
      description:
        "Premium wedding and event decoration services in Accra. We transform venues into breathtaking experiences with elegant florals, luxurious drapery, and bespoke centrepieces. Serving Ghana's most prestigious events since 2015.",
    },
    {
      email: "ama@ghanaevents.com",
      businessName: "Ama Photography Co.",
      slug: "ama-photography-co",
      ownerFullName: "Ama Serwaa",
      phoneNumber: "+233244000002",
      vendorType: "SERVICE" as const,
      serviceLocations: ["Accra", "Tema", "Kasoa"],
      primaryCategory: "Photography",
      description:
        "Award-winning event photography capturing the beauty and emotion of your special moments. From intimate ceremonies to grand celebrations, we tell your story through stunning imagery.",
    },
    {
      email: "adom@ghanaevents.com",
      businessName: "Adom Event Planners",
      slug: "adom-event-planners",
      ownerFullName: "Adom Mensah",
      phoneNumber: "+233244000003",
      vendorType: "SERVICE" as const,
      serviceLocations: ["Kumasi", "Ejisu", "Obuasi"],
      primaryCategory: "Event Planning",
      description:
        "Full-service event planning and coordination in the Ashanti Region. From weddings to corporate events, we handle every detail so you can enjoy your day stress-free.",
    },
    {
      email: "akosua@ghanaevents.com",
      businessName: "Akosua's Kitchen",
      slug: "akosuas-kitchen",
      ownerFullName: "Akosua Dankwa",
      phoneNumber: "+233244000004",
      vendorType: "SERVICE" as const,
      serviceLocations: ["Cape Coast", "Elmina", "Takoradi"],
      primaryCategory: "Catering",
      description:
        "Exquisite Ghanaian and continental catering for events of all sizes. Our chefs prepare authentic local dishes and international cuisine that delight every palate. Serving the Central and Western Regions.",
    },
    {
      email: "goldcoast@ghanaevents.com",
      businessName: "Gold Coast Furniture Hire",
      slug: "gold-coast-furniture-hire",
      ownerFullName: "Emmanuel Adjei",
      phoneNumber: "+233244000005",
      vendorType: "RENTAL" as const,
      serviceLocations: ["Cape Coast", "Accra", "Kumasi"],
      primaryCategory: "Chairs & Tables",
      description:
        "Ghana's premier event furniture rental company. We stock over 500 Chiavari chairs, 200 banquet tables, canopies, and red carpets. Delivery available nationwide.",
    },
    {
      email: "accrabeat@ghanaevents.com",
      businessName: "AccraBeat Sound & Lights",
      slug: "accrabeat-sound-lights",
      ownerFullName: "Nana Yaw Boateng",
      phoneNumber: "+233244000006",
      vendorType: "BOTH" as const,
      serviceLocations: ["Accra", "Tema", "Kumasi"],
      primaryCategory: "Sound & Lighting Equipment",
      description:
        "Professional sound systems, LED lighting, and DJ equipment for events across Ghana. From intimate gatherings to stadium concerts, we deliver crystal-clear audio and stunning light shows.",
    },
  ];

  const vendorProfiles: Record<string, string> = {};

  for (const v of vendorData) {
    const user = await prisma.user.upsert({
      where: { email: v.email },
      update: {},
      create: {
        email: v.email,
        passwordHash: vendorPasswordHash,
        role: "VENDOR",
      },
    });

    const profile = await prisma.vendorProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        businessName: v.businessName,
        slug: v.slug,
        ownerFullName: v.ownerFullName,
        phoneNumber: v.phoneNumber,
        email: v.email,
        description: v.description,
        vendorType: v.vendorType,
        status: "APPROVED",
        primaryCategoryId: categories[v.primaryCategory],
        serviceLocations: v.serviceLocations,
        isPhoneVerified: true,
        isGhanaCardVerified: true,
        isBusinessVerified: true,
        isAddressVerified: true,
      },
    });

    vendorProfiles[v.businessName] = profile.id;

    // Portfolio images
    const existingImages = await prisma.portfolioImage.findMany({
      where: { vendorId: profile.id },
    });
    if (existingImages.length === 0) {
      await prisma.portfolioImage.createMany({
        data: [
          {
            vendorId: profile.id,
            url: `https://via.placeholder.com/800x600?text=${encodeURIComponent(v.businessName)}+1`,
            caption: `${v.businessName} - Event Setup`,
            order: 1,
          },
          {
            vendorId: profile.id,
            url: `https://via.placeholder.com/800x600?text=${encodeURIComponent(v.businessName)}+2`,
            caption: `${v.businessName} - Portfolio`,
            order: 2,
          },
          {
            vendorId: profile.id,
            url: `https://via.placeholder.com/800x600?text=${encodeURIComponent(v.businessName)}+3`,
            caption: `${v.businessName} - Featured Work`,
            order: 3,
          },
        ],
      });
    }

    // Category assignment
    await prisma.vendorCategoryAssignment.upsert({
      where: {
        vendorId_categoryId: {
          vendorId: profile.id,
          categoryId: categories[v.primaryCategory],
        },
      },
      update: {},
      create: {
        vendorId: profile.id,
        categoryId: categories[v.primaryCategory],
      },
    });
  }
  console.log("✅ 6 vendor accounts created");


  // ─── 4. Service Packages ─────────────────────────────────────────────────────
  const servicePackagesData = [
    {
      vendorName: "Kwame's Decor Studio",
      category: "Wedding Decoration",
      packages: [
        {
          name: "Classic Wedding Package",
          description:
            "Elegant wedding decoration for up to 200 guests. Includes venue draping, table centrepieces, head table setup, aisle decoration, and basic lighting.",
          includedServices: [
            "Venue draping",
            "Table centrepieces (20 tables)",
            "Head table decoration",
            "Aisle decoration",
            "Basic lighting",
          ],
          startingPrice: 8000,
        },
        {
          name: "Premium Wedding Package",
          description:
            "Luxurious wedding decoration for up to 500 guests. Includes premium draping, custom centrepieces, elaborate head table, floral arch, dance floor decoration, and LED lighting.",
          includedServices: [
            "Premium venue draping",
            "Custom centrepieces (50 tables)",
            "Elaborate head table setup",
            "Floral arch",
            "Dance floor decoration",
            "LED uplighting",
            "Lounge area styling",
          ],
          startingPrice: 15000,
        },
        {
          name: "Corporate Event Package",
          description:
            "Professional event decoration for corporate functions, conferences, and product launches. Clean, modern aesthetic with branded elements.",
          includedServices: [
            "Stage decoration",
            "Branded backdrop",
            "Table arrangements",
            "Registration area setup",
            "Basic florals",
          ],
          startingPrice: 5000,
        },
      ],
    },
    {
      vendorName: "Ama Photography Co.",
      category: "Photography",
      packages: [
        {
          name: "Basic Coverage",
          description:
            "4 hours of professional photography coverage. Perfect for intimate ceremonies and small gatherings. Includes edited digital images.",
          includedServices: [
            "4-hour coverage",
            "1 photographer",
            "200+ edited photos",
            "Online gallery",
            "Digital download",
          ],
          startingPrice: 2500,
        },
        {
          name: "Full Day Coverage",
          description:
            "10 hours of photography from preparation to reception. Two photographers ensure every moment is captured beautifully.",
          includedServices: [
            "10-hour coverage",
            "2 photographers",
            "500+ edited photos",
            "Engagement shoot",
            "Online gallery",
            "USB drive",
          ],
          startingPrice: 5000,
        },
        {
          name: "Premium Package",
          description:
            "Complete visual storytelling from pre-wedding to reception. Includes drone coverage, same-day edits, and a luxury photo album.",
          includedServices: [
            "Full day coverage",
            "2 photographers + assistant",
            "800+ edited photos",
            "Drone coverage",
            "Same-day edit slideshow",
            "Luxury 40-page album",
            "Canvas prints (3)",
          ],
          startingPrice: 8000,
        },
      ],
    },
    {
      vendorName: "Adom Event Planners",
      category: "Event Planning",
      packages: [
        {
          name: "Day-Of Coordination",
          description:
            "Professional coordination on your event day. We manage all vendors, timelines, and logistics so you can relax and enjoy.",
          includedServices: [
            "Timeline management",
            "Vendor coordination",
            "Setup supervision",
            "Guest management",
            "Emergency handling",
          ],
          startingPrice: 3000,
        },
        {
          name: "Full Planning Package",
          description:
            "End-to-end event planning from concept to execution. We handle venue selection, vendor sourcing, budgeting, design, and full coordination.",
          includedServices: [
            "Concept development",
            "Venue sourcing",
            "Vendor management",
            "Budget management",
            "Design & styling",
            "Full day coordination",
            "Post-event wrap-up",
          ],
          startingPrice: 12000,
        },
      ],
    },
    {
      vendorName: "Akosua's Kitchen",
      category: "Catering",
      packages: [
        {
          name: "Standard Buffet",
          description:
            "Delicious Ghanaian buffet for your event. Includes 3 main dishes, 2 sides, salad, dessert, and soft drinks. Price is per person.",
          includedServices: [
            "3 main dishes",
            "2 sides",
            "Garden salad",
            "Dessert",
            "Soft drinks",
            "Serving staff",
            "Chafing dishes",
          ],
          startingPrice: 50,
        },
        {
          name: "Premium Buffet",
          description:
            "Elevated dining experience with 5 main dishes, continental options, premium desserts, and cocktails. Price is per person.",
          includedServices: [
            "5 main dishes",
            "Continental options",
            "3 sides",
            "Premium desserts",
            "Cocktails & mocktails",
            "Dedicated servers",
            "Premium tableware",
          ],
          startingPrice: 80,
        },
        {
          name: "Cocktail Reception",
          description:
            "Elegant finger foods and drinks for cocktail-style events. Includes canapés, small bites, and a drinks station. Price is per person.",
          includedServices: [
            "8 canapé varieties",
            "Small bites station",
            "Fruit display",
            "Drinks station",
            "Serving staff",
          ],
          startingPrice: 40,
        },
      ],
    },
  ];

  for (const vendorPackages of servicePackagesData) {
    const vendorId = vendorProfiles[vendorPackages.vendorName];
    const categoryId = categories[vendorPackages.category];

    for (const pkg of vendorPackages.packages) {
      const existing = await prisma.servicePackage.findFirst({
        where: { vendorId, name: pkg.name },
      });
      if (!existing) {
        await prisma.servicePackage.create({
          data: {
            vendorId,
            categoryId,
            name: pkg.name,
            description: pkg.description,
            includedServices: pkg.includedServices,
            startingPrice: pkg.startingPrice,
            isActive: true,
          },
        });
      }
    }
  }
  console.log("✅ Service packages created");


  // ─── 5. Rental Items ─────────────────────────────────────────────────────────
  const rentalItemsData = [
    {
      vendorName: "Gold Coast Furniture Hire",
      category: "Chairs & Tables",
      items: [
        {
          name: "Chiavari Chairs",
          description:
            "Premium gold Chiavari chairs with cushion pads. Perfect for weddings, receptions, and formal events. Available in gold, silver, and white.",
          pricePerUnit: 5,
          pricingPeriod: "PER_EVENT" as const,
          totalQuantity: 500,
          minOrderQuantity: 50,
          serviceLocation: "Cape Coast",
          deliveryAvailable: true,
          deliveryCharge: 200,
        },
        {
          name: "Banquet Tables",
          description:
            "6-foot rectangular banquet tables seating 8-10 guests. Sturdy, elegant design suitable for any event. Includes white tablecloth.",
          pricePerUnit: 20,
          pricingPeriod: "PER_EVENT" as const,
          totalQuantity: 200,
          minOrderQuantity: 5,
          serviceLocation: "Cape Coast",
          deliveryAvailable: true,
          deliveryCharge: 300,
        },
        {
          name: "Red Carpet",
          description:
            "Premium red carpet rolls (10m x 1.5m) for grand entrances and VIP walkways. Makes any event entrance memorable.",
          pricePerUnit: 100,
          pricingPeriod: "PER_EVENT" as const,
          totalQuantity: 50,
          minOrderQuantity: 1,
          serviceLocation: "Cape Coast",
          deliveryAvailable: true,
          deliveryCharge: 100,
        },
        {
          name: "White Canopy",
          description:
            "Elegant white canopy tents (10m x 10m) with full draping. Ideal for outdoor ceremonies and receptions. Includes setup and teardown.",
          pricePerUnit: 300,
          pricingPeriod: "PER_EVENT" as const,
          totalQuantity: 30,
          minOrderQuantity: 1,
          serviceLocation: "Cape Coast",
          deliveryAvailable: true,
          deliveryCharge: 500,
          setupAvailable: true,
          setupCharge: 200,
        },
      ],
    },
    {
      vendorName: "AccraBeat Sound & Lights",
      category: "Sound & Lighting Equipment",
      items: [
        {
          name: "PA System 5000W",
          description:
            "Professional 5000W PA system with subwoofers, mid-range speakers, and tweeters. Crystal-clear audio for events up to 2000 guests. Includes sound engineer.",
          pricePerUnit: 800,
          pricingPeriod: "PER_EVENT" as const,
          totalQuantity: 10,
          minOrderQuantity: 1,
          serviceLocation: "Accra",
          deliveryAvailable: true,
          deliveryCharge: 300,
          setupAvailable: true,
          setupCharge: 500,
        },
        {
          name: "LED Moving Heads",
          description:
            "High-quality LED moving head lights for dynamic event lighting. Create stunning light shows and ambience for any occasion.",
          pricePerUnit: 150,
          pricingPeriod: "PER_EVENT" as const,
          totalQuantity: 20,
          minOrderQuantity: 4,
          serviceLocation: "Accra",
          deliveryAvailable: true,
          deliveryCharge: 150,
          setupAvailable: true,
          setupCharge: 200,
        },
        {
          name: "Wireless Microphone Set",
          description:
            "Professional wireless microphone set with 2 handheld mics and 2 lapel mics. Perfect for speeches, MC duties, and performances.",
          pricePerUnit: 100,
          pricingPeriod: "PER_EVENT" as const,
          totalQuantity: 30,
          minOrderQuantity: 1,
          serviceLocation: "Accra",
          deliveryAvailable: true,
          deliveryCharge: 50,
        },
      ],
    },
    {
      vendorName: "Kwame's Decor Studio",
      category: "Decoration Props",
      items: [
        {
          name: "Backdrop Frame",
          description:
            "Adjustable metal backdrop frame (3m x 3m) with premium fabric options. Perfect for photo backdrops, ceremony backdrops, and stage decoration.",
          pricePerUnit: 200,
          pricingPeriod: "PER_EVENT" as const,
          totalQuantity: 15,
          minOrderQuantity: 1,
          serviceLocation: "Accra",
          deliveryAvailable: true,
          deliveryCharge: 100,
          setupAvailable: true,
          setupCharge: 100,
        },
        {
          name: "Flower Arch",
          description:
            "Stunning artificial flower arch for ceremonies and photo opportunities. Available in white, pink, and mixed floral designs. Includes setup.",
          pricePerUnit: 500,
          pricingPeriod: "PER_EVENT" as const,
          totalQuantity: 10,
          minOrderQuantity: 1,
          serviceLocation: "Accra",
          deliveryAvailable: true,
          deliveryCharge: 150,
          setupAvailable: true,
          setupCharge: 200,
        },
      ],
    },
  ];

  const rentalItemIds: Record<string, string> = {};

  for (const vendorItems of rentalItemsData) {
    const vendorId = vendorProfiles[vendorItems.vendorName];
    const categoryId = categories[vendorItems.category];

    // Add category assignment for rental vendors with additional categories
    if (vendorItems.category !== "Wedding Decoration" && vendorItems.category !== "Chairs & Tables" && vendorItems.category !== "Sound & Lighting Equipment") {
      await prisma.vendorCategoryAssignment.upsert({
        where: {
          vendorId_categoryId: {
            vendorId,
            categoryId,
          },
        },
        update: {},
        create: {
          vendorId,
          categoryId,
        },
      });
    }

    for (const item of vendorItems.items) {
      const existing = await prisma.rentalItem.findFirst({
        where: { vendorId, name: item.name },
      });
      if (!existing) {
        const created = await prisma.rentalItem.create({
          data: {
            vendorId,
            categoryId,
            name: item.name,
            description: item.description,
            imageUrls: [
              `https://via.placeholder.com/600x400?text=${encodeURIComponent(item.name)}`,
              `https://via.placeholder.com/600x400?text=${encodeURIComponent(item.name)}+2`,
            ],
            pricePerUnit: item.pricePerUnit,
            pricingPeriod: item.pricingPeriod,
            totalQuantity: item.totalQuantity,
            minOrderQuantity: item.minOrderQuantity,
            serviceLocation: item.serviceLocation,
            deliveryAvailable: item.deliveryAvailable,
            deliveryCharge: item.deliveryCharge ?? null,
            setupAvailable: item.setupAvailable ?? false,
            setupCharge: item.setupCharge ?? null,
            isActive: true,
          },
        });
        rentalItemIds[item.name] = created.id;
      } else {
        rentalItemIds[item.name] = existing.id;
      }
    }
  }
  console.log("✅ Rental items created");

  // ─── 6. Rental Inventory (Overbooking Logic Demo) ────────────────────────────
  const eventDate = new Date("2025-12-20");

  // Gold Coast Chiavari Chairs: 300 reserved on 2025-12-20
  if (rentalItemIds["Chiavari Chairs"]) {
    await prisma.rentalInventory.upsert({
      where: {
        rentalItemId_eventDate: {
          rentalItemId: rentalItemIds["Chiavari Chairs"],
          eventDate,
        },
      },
      update: { reservedQty: 300 },
      create: {
        rentalItemId: rentalItemIds["Chiavari Chairs"],
        eventDate,
        reservedQty: 300,
      },
    });
  }

  // AccraBeat PA Systems: 7 reserved on 2025-12-20
  if (rentalItemIds["PA System 5000W"]) {
    await prisma.rentalInventory.upsert({
      where: {
        rentalItemId_eventDate: {
          rentalItemId: rentalItemIds["PA System 5000W"],
          eventDate,
        },
      },
      update: { reservedQty: 7 },
      create: {
        rentalItemId: rentalItemIds["PA System 5000W"],
        eventDate,
        reservedQty: 7,
      },
    });
  }
  console.log("✅ Rental inventory entries created");


  // ─── 7. Customer Accounts ────────────────────────────────────────────────────
  const customerPasswordHash = await hash("Customer1234", 12);

  const customersData = [
    {
      email: "kofi@example.com",
      fullName: "Kofi Mensah",
      phoneNumber: "+233201000001",
      city: "Accra",
    },
    {
      email: "abena@example.com",
      fullName: "Abena Owusu",
      phoneNumber: "+233201000002",
      city: "Kumasi",
    },
    {
      email: "yaw@example.com",
      fullName: "Yaw Asante",
      phoneNumber: "+233201000003",
      city: "Cape Coast",
    },
  ];

  const customerProfiles: Record<string, string> = {};

  for (const c of customersData) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        email: c.email,
        passwordHash: customerPasswordHash,
        role: "CUSTOMER",
      },
    });

    const profile = await prisma.customerProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        fullName: c.fullName,
        phoneNumber: c.phoneNumber,
      },
    });

    customerProfiles[c.fullName] = profile.id;
  }
  console.log("✅ 3 customer accounts created");

  // ─── 8. Completed Bookings with Payments and Reviews ─────────────────────────

  // Booking 1: Kofi booked Kwame's Decor - Premium Wedding Package
  const booking1 = await prisma.booking.upsert({
    where: {
      id: "seed-booking-kofi-kwame",
    },
    update: {},
    create: {
      id: "seed-booking-kofi-kwame",
      customerId: customerProfiles["Kofi Mensah"],
      vendorId: vendorProfiles["Kwame's Decor Studio"],
      eventDate: new Date("2025-06-15"),
      eventLocation: "La Palm Royal Beach Hotel, Accra",
      totalAmount: 15000,
      depositAmount: 5000,
      amountPaid: 15000,
      status: "COMPLETED",
      notes: "Premium wedding decoration for 300 guests",
    },
  });

  // Booking 1 items
  const existingItems1 = await prisma.bookingItem.findFirst({
    where: { bookingId: booking1.id },
  });
  if (!existingItems1) {
    const premiumPkg = await prisma.servicePackage.findFirst({
      where: {
        vendorId: vendorProfiles["Kwame's Decor Studio"],
        name: "Premium Wedding Package",
      },
    });
    await prisma.bookingItem.create({
      data: {
        bookingId: booking1.id,
        servicePackageId: premiumPkg?.id ?? null,
        description: "Premium Wedding Package - 300 guests",
        quantity: 1,
        unitPrice: 15000,
        totalPrice: 15000,
      },
    });
  }

  // Booking 1 payment
  const existingPayment1 = await prisma.payment.findFirst({
    where: { bookingId: booking1.id },
  });
  if (!existingPayment1) {
    await prisma.payment.createMany({
      data: [
        {
          bookingId: booking1.id,
          amount: 5000,
          paymentType: "DEPOSIT",
          paymentMethod: "MOBILE_MONEY",
          status: "SUCCESS",
          providerRef: "MOCK-deposit-001",
        },
        {
          bookingId: booking1.id,
          amount: 10000,
          paymentType: "BALANCE",
          paymentMethod: "MOBILE_MONEY",
          status: "SUCCESS",
          providerRef: "MOCK-balance-001",
        },
      ],
    });
  }

  // Booking 1 review
  await prisma.review.upsert({
    where: { bookingId: booking1.id },
    update: {},
    create: {
      bookingId: booking1.id,
      customerId: customerProfiles["Kofi Mensah"],
      vendorId: vendorProfiles["Kwame's Decor Studio"],
      rating: 5,
      reviewText:
        "Absolutely stunning decoration! Kwame and his team transformed our venue beyond our wildest dreams. Every detail was perfect, from the floral arch to the table centrepieces. Highly recommend for any premium event in Accra!",
      isVisible: true,
    },
  });

  // Booking 2: Abena booked Ama Photography - Full Day Coverage
  const booking2 = await prisma.booking.upsert({
    where: {
      id: "seed-booking-abena-ama",
    },
    update: {},
    create: {
      id: "seed-booking-abena-ama",
      customerId: customerProfiles["Abena Owusu"],
      vendorId: vendorProfiles["Ama Photography Co."],
      eventDate: new Date("2025-07-20"),
      eventLocation: "Golden Tulip, Kumasi",
      totalAmount: 5000,
      depositAmount: 2000,
      amountPaid: 5000,
      status: "COMPLETED",
      notes: "Full day photography coverage for wedding",
    },
  });

  // Booking 2 items
  const existingItems2 = await prisma.bookingItem.findFirst({
    where: { bookingId: booking2.id },
  });
  if (!existingItems2) {
    const fullDayPkg = await prisma.servicePackage.findFirst({
      where: {
        vendorId: vendorProfiles["Ama Photography Co."],
        name: "Full Day Coverage",
      },
    });
    await prisma.bookingItem.create({
      data: {
        bookingId: booking2.id,
        servicePackageId: fullDayPkg?.id ?? null,
        description: "Full Day Coverage - Wedding photography",
        quantity: 1,
        unitPrice: 5000,
        totalPrice: 5000,
      },
    });
  }

  // Booking 2 payment
  const existingPayment2 = await prisma.payment.findFirst({
    where: { bookingId: booking2.id },
  });
  if (!existingPayment2) {
    await prisma.payment.createMany({
      data: [
        {
          bookingId: booking2.id,
          amount: 2000,
          paymentType: "DEPOSIT",
          paymentMethod: "MOBILE_MONEY",
          status: "SUCCESS",
          providerRef: "MOCK-deposit-002",
        },
        {
          bookingId: booking2.id,
          amount: 3000,
          paymentType: "BALANCE",
          paymentMethod: "MOBILE_MONEY",
          status: "SUCCESS",
          providerRef: "MOCK-balance-002",
        },
      ],
    });
  }

  // Booking 2 review
  await prisma.review.upsert({
    where: { bookingId: booking2.id },
    update: {},
    create: {
      bookingId: booking2.id,
      customerId: customerProfiles["Abena Owusu"],
      vendorId: vendorProfiles["Ama Photography Co."],
      rating: 4,
      reviewText:
        "Great photography work! Ama captured beautiful moments throughout our wedding day. The edited photos were delivered on time and looked professional. Only wish we had a few more candid shots.",
      isVisible: true,
    },
  });

  // Booking 3: Yaw booked Gold Coast Furniture - Chairs + Tables
  const booking3 = await prisma.booking.upsert({
    where: {
      id: "seed-booking-yaw-goldcoast",
    },
    update: {},
    create: {
      id: "seed-booking-yaw-goldcoast",
      customerId: customerProfiles["Yaw Asante"],
      vendorId: vendorProfiles["Gold Coast Furniture Hire"],
      eventDate: new Date("2025-08-10"),
      eventLocation: "Cape Coast Castle Grounds",
      totalAmount: 700,
      depositAmount: 300,
      amountPaid: 700,
      status: "COMPLETED",
      notes: "100 Chiavari chairs + 10 banquet tables for outdoor reception",
    },
  });

  // Booking 3 items
  const existingItems3 = await prisma.bookingItem.findFirst({
    where: { bookingId: booking3.id },
  });
  if (!existingItems3) {
    await prisma.bookingItem.createMany({
      data: [
        {
          bookingId: booking3.id,
          rentalItemId: rentalItemIds["Chiavari Chairs"] ?? null,
          description: "Chiavari Chairs - Gold",
          quantity: 100,
          unitPrice: 5,
          totalPrice: 500,
          deliveryCharge: 200,
        },
        {
          bookingId: booking3.id,
          rentalItemId: rentalItemIds["Banquet Tables"] ?? null,
          description: "Banquet Tables (6ft)",
          quantity: 10,
          unitPrice: 20,
          totalPrice: 200,
        },
      ],
    });
  }

  // Booking 3 payment
  const existingPayment3 = await prisma.payment.findFirst({
    where: { bookingId: booking3.id },
  });
  if (!existingPayment3) {
    await prisma.payment.createMany({
      data: [
        {
          bookingId: booking3.id,
          amount: 300,
          paymentType: "DEPOSIT",
          paymentMethod: "MOBILE_MONEY",
          status: "SUCCESS",
          providerRef: "MOCK-deposit-003",
        },
        {
          bookingId: booking3.id,
          amount: 400,
          paymentType: "BALANCE",
          paymentMethod: "MOBILE_MONEY",
          status: "SUCCESS",
          providerRef: "MOCK-balance-003",
        },
      ],
    });
  }

  // Booking 3 review
  await prisma.review.upsert({
    where: { bookingId: booking3.id },
    update: {},
    create: {
      bookingId: booking3.id,
      customerId: customerProfiles["Yaw Asante"],
      vendorId: vendorProfiles["Gold Coast Furniture Hire"],
      rating: 5,
      reviewText:
        "Excellent service from Gold Coast! The chairs and tables were delivered on time and in perfect condition. Setup crew was professional and efficient. Will definitely use again for future events.",
      isVisible: true,
    },
  });
  console.log("✅ 3 completed bookings with payments and reviews created");

  // ─── 9. Update Vendor Ratings and Booking Counts ─────────────────────────────
  const vendorsToUpdate = [
    { name: "Kwame's Decor Studio", avgRating: 5.0, totalReviews: 1, totalBookings: 1 },
    { name: "Ama Photography Co.", avgRating: 4.0, totalReviews: 1, totalBookings: 1 },
    { name: "Gold Coast Furniture Hire", avgRating: 5.0, totalReviews: 1, totalBookings: 1 },
  ];

  for (const v of vendorsToUpdate) {
    await prisma.vendorProfile.update({
      where: { id: vendorProfiles[v.name] },
      data: {
        averageRating: v.avgRating,
        totalReviews: v.totalReviews,
        totalBookings: v.totalBookings,
      },
    });
  }
  console.log("✅ Vendor ratings and booking counts updated");

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
