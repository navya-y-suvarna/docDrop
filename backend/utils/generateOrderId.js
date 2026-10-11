const crypto = require("crypto");

function generateOrderId() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `DD-${dateStr}-${randomSuffix}`;
}

function generatePickupCode() {
  // 6 character alphanumeric uppercase token
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code = "";
  const randomBytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    code += chars[randomBytes[i] % chars.length];
  }
  return code;
}

module.exports = {
  generateOrderId,
  generatePickupCode,
};
