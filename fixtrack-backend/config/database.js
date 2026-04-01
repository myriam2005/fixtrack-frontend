// config/database.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "test",
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4
    });
    console.log(`✅ MongoDB connecté : ${conn.connection.host}`);
    console.log(`✅ Base utilisée : ${conn.connection.db.databaseName}`);
  } catch (error) {
    console.error(`❌ Erreur connexion MongoDB : ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
