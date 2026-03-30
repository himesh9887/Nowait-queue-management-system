const bcrypt = require("bcryptjs");

const User = require("../models/User");

function getDefaultUsers() {
  return [
    {
      username:
        process.env.ADMIN_USERNAME ||
        process.env.DEFAULT_ADMIN_USERNAME ||
        "admin",
      password:
        process.env.ADMIN_PASSWORD ||
        process.env.DEFAULT_ADMIN_PASSWORD ||
        "admin123",
      displayName: process.env.DEFAULT_ADMIN_NAME || "Queue Admin",
      role: "admin",
    },
    {
      username: process.env.DEFAULT_USER_USERNAME || "user",
      password: process.env.DEFAULT_USER_PASSWORD || "user123",
      displayName: process.env.DEFAULT_USER_NAME || "Demo User",
      role: "user",
    },
  ];
}

async function seedDefaultUsers() {
  const defaults = getDefaultUsers();

  await Promise.all(
    defaults.map(async (account) => {
      const passwordHash = await bcrypt.hash(account.password, 10);

      await User.findOneAndUpdate(
        { username: account.username.toLowerCase() },
        {
          $set: {
            displayName: account.displayName,
            passwordHash,
            role: account.role,
            active: true,
            username: account.username.toLowerCase(),
          },
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        },
      );
    }),
  );

  console.log(
    `Seeded default user accounts: ${defaults
      .map((account) => `${account.role}:${account.username}`)
      .join(", ")}`,
  );
}

module.exports = {
  seedDefaultUsers,
};
