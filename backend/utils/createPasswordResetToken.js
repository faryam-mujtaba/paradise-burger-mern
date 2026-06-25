const crypto = require("crypto");

const createPasswordResetToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  const expires = Date.now() + 15 * 60 * 1000; // 15 minutes

  return {
    rawToken,
    hashedToken,
    expires,
  };
};

module.exports = createPasswordResetToken;