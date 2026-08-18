/**
 * Production-safe category bootstrap script.
 *
 * Seeds VendorCategory records only. No user accounts, no demo data, no bcrypt.
 * Idempotent — uses upsert so running repeatedly will not create duplicates.
 *
 * Usage:
 *   node scripts/seed-categories.js
 *
 * Requires DATABASE_URL in the environment (or DB_HOST/DB_PORT/DB_NAME/DB_USERNAME/DB_PASSWORD
 * which start.js assembles into DATABASE_URL before the app starts).
 *
 * For ECS: override the container command to run this script, e.g.:
 *   ["node", "scripts/seed-categories.js"]
 */

const { PrismaClient } = require("@prisma/client");

const SERVICE_CATEGORIES = [
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

const RENTAL_CATEGORIES = [
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

async function main() {
  // If DATABASE_URL is not set but individual vars are, construct it (same logic as start.js)
  if (!process.env.DATABASE_URL) {
    const { DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD } = process.env;
    if (DB_HOST && DB_USERNAME && DB_PASSWORD && DB_NAME) {
      const user = encodeURIComponent(DB_USERNAME);
      const pass = encodeURIComponent(DB_PASSWORD);
      const port = DB_PORT || "5432";
      process.env.DATABASE_URL = `postgresql://${user}:${pass}@${DB_HOST}:${port}/${DB_NAME}`;
    } else {
      console.error("❌ DATABASE_URL is not set and individual DB_* variables are missing.");
      process.exit(1);
    }
  }

  const prisma = new PrismaClient();

  try {
    console.log("🌱 Seeding vendor categories...");

    let order = 1;

    for (const name of SERVICE_CATEGORIES) {
      await prisma.vendorCategory.upsert({
        where: { name },
        update: { displayOrder: order, isActive: true },
        create: { name, type: "SERVICE", displayOrder: order, isActive: true },
      });
      order++;
    }

    for (const name of RENTAL_CATEGORIES) {
      await prisma.vendorCategory.upsert({
        where: { name },
        update: { displayOrder: order, isActive: true },
        create: { name, type: "RENTAL", displayOrder: order, isActive: true },
      });
      order++;
    }

    const total = SERVICE_CATEGORIES.length + RENTAL_CATEGORIES.length;
    console.log(`✅ ${total} categories seeded successfully.`);
  } catch (error) {
    console.error("❌ Category seeding failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
