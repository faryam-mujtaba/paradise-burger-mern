const crypto = require("crypto");

const createVerificationToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  const expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return {
    rawToken,
    hashedToken,
    expires,
  };
};

module.exports = createVerificationToken;