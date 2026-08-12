/**
 * Production startup script for AWS ECS Fargate.
 *
 * Reads individual DB connection parameters injected by the ECS task definition,
 * constructs a Prisma-compatible DATABASE_URL, and starts the Next.js standalone server.
 */

const { DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD } = process.env;

if (DB_HOST && DB_USERNAME && DB_PASSWORD && DB_NAME) {
  const user = encodeURIComponent(DB_USERNAME);
  const pass = encodeURIComponent(DB_PASSWORD);
  const port = DB_PORT || "5432";

  process.env.DATABASE_URL = `postgresql://${user}:${pass}@${DB_HOST}:${port}/${DB_NAME}`;
}

// Start the Next.js standalone server
require("./server.js");
