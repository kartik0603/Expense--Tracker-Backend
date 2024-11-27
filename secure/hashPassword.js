const bcrypt = require("bcrypt");

const hashPassword = async (userPassword) => {
  const saltRounds = 10;
  return await bcrypt.hash(userPassword, saltRounds);
};

const comparePassword = async (password, hashedPassword) => {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      console.error("Error comparing passwords:", error);
      throw error;
    }
  };

module.exports = { hashPassword, comparePassword };
