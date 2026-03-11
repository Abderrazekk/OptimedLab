const User = require("../models/User");
const bcrypt = require("bcryptjs"); // 1. Import bcrypt

const seedAdmin = async () => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({
      email: process.env.SUPER_ADMIN_EMAIL,
    });

    if (!adminExists) {
      // 2. Hash the password manually
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(
        process.env.SUPER_ADMIN_PASSWORD,
        salt,
      );

      await User.create({
        name: process.env.SUPER_ADMIN_NAME,
        email: process.env.SUPER_ADMIN_EMAIL,
        password: hashedPassword, // 3. Save the hashed password
        role: "admin",
      });
      console.log("Super Admin created successfully with hashed password");
    } else {
      console.log("Super Admin already exists");
    }
  } catch (error) {
    console.error("Error seeding admin:", error);
  }
};

module.exports = seedAdmin;
