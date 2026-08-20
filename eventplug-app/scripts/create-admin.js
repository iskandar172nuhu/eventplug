/**
 * Production-safe admin account bootstrap script.
 *
 * Creates a single admin user if one does not already exist.
 * Idempotent — running repeatedly will not create duplicates.
 *
 * Usage:
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=YourSecurePass1 node scripts/create-admin.js
 *
 * Required environment variables:
 *   ADMIN_EMAIL    - email for the admin account
 *   ADMIN_PASSWORD - password (min 8 chars, uppercase, lowercase, number)
 *   DATABASE_URL   - or DB_HOST/DB_PORT/DB_NAME/DB_USERNAME/DB_PASSWORD
 */

const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

// ---------- Minimal bcrypt-compatible hashing using Node.js built-ins ----------
// We cannot use bcryptjs in the production container. Instead we use scrypt
// which is available natively in Node.js. The auth config uses bcryptjs.compare()
// so we need to produce a hash that bcryptjs can verify.
//
// Alternative approach: use the same algorithm (bcrypt) via a pure-JS implementation
// bundled here. Since bcryptjs is ~15KB of pure JS, we inline a minimal version.
//
// Actually, the simplest approach: the production container DOES have bcryptjs
// available in node_modules (it's a dependency of the app, bundled in standalone output).

async function hashPassword(password) {
  // Try to use bcryptjs from the standalone bundle
  try {
    const bcrypt = require("bcryptjs");
    return await bcrypt.hash(password, 12);
  } catch {
    // Fallback: try bcrypt
    try {
      const bcrypt = require("bcrypt");
      return await bcrypt.hash(password, 12);
    } catch {
      console.error("❌ Neither bcryptjs nor bcrypt is available.");
      console.error("   This script must run in an environment with bcryptjs installed.");
      process.exit(1);
    }
  }
}

async function main() {
  // Construct DATABASE_URL if not set
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

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("❌ ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required.");
    console.error("   Usage: ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=SecurePass1 node scripts/create-admin.js");
    process.exit(1);
  }

  // Basic password validation
  if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    console.error("❌ Password must be at least 8 characters with uppercase, lowercase, and a number.");
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    console.log(`🔐 Creating admin account for ${email}...`);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      if (existing.role === "ADMIN") {
        console.log("✅ Admin account already exists. No changes made.");
      } else {
        console.error(`❌ A non-admin account already exists with email ${email}.`);
        process.exit(1);
      }
      return;
    }

    const passwordHash = await hashPassword(password);

    await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "ADMIN",
      },
    });

    console.log("✅ Admin account created successfully.");
  } catch (error) {
    console.error("❌ Failed to create admin account:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
