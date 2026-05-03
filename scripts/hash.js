#!/usr/bin/env node
/**
 * Generate a bcrypt hash for ADMIN_PASSWORD_HASH.
 * Usage: node scripts/hash.js <password>
 */
const bcrypt = require("bcryptjs");

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/hash.js <password>");
  process.exit(2);
}

bcrypt.hash(password, 12).then((hash) => {
  console.log(hash);
});
