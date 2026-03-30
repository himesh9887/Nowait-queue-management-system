const Token = require("../models/Token");
const { formatDayKey, startOfLocalDay } = require("./bookingDay");

async function migrateLegacyTokens() {
  const legacyTokens = await Token.find({
    $or: [
      { bookingDayKey: { $exists: false } },
      { bookingDayKey: null },
      { bookingDate: { $exists: false } },
      { bookingDate: null },
    ],
  })
    .select("_id bookingDate createdAt")
    .lean();

  if (!legacyTokens.length) {
    return;
  }

  const operations = legacyTokens.map((token) => {
    const bookingDate = startOfLocalDay(token.bookingDate || token.createdAt || new Date());

    return {
      updateOne: {
        filter: { _id: token._id },
        update: {
          $set: {
            bookingDate,
            bookingDayKey: formatDayKey(bookingDate),
          },
        },
      },
    };
  });

  await Token.bulkWrite(operations);
}

module.exports = {
  migrateLegacyTokens,
};
