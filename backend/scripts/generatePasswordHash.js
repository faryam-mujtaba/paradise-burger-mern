const bcrypt = require("bcryptjs");

const password = "Subadmin@123";

const generateHash = async () => {
  const hash = await bcrypt.hash(password, 10);

  console.log("Password:", password);
  console.log("Hash:");
  console.log(hash);
};

generateHash();