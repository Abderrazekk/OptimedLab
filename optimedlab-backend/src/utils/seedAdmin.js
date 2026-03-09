const User = require("../models/User");

const seedAdmin = async () => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({
      email: process.env.SUPER_ADMIN_EMAIL,
    });

    if (!adminExists) {
      await User.create({
        name: process.env.SUPER_ADMIN_NAME,
        email: process.env.SUPER_ADMIN_EMAIL,
        password: process.env.SUPER_ADMIN_PASSWORD,
        role: "admin",
      });
      console.log("Super Admin created successfully");
    } else {
      console.log("Super Admin already exists");
    }
  } catch (error) {
    console.error("Error seeding admin:", error);
  }
};

module.exports = seedAdmin;
