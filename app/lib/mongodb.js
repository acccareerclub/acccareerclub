// app/lib/mongodb.js - 
import mongoose from "mongoose";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");

// Use the correct replica set name from discovery: atlas-r8h6ge-shard-0
const MONGODB_URI = process.env.MONGODB_URI;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    console.log("📦 Using cached connection");
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 30000,
      family: 4,
      tls: true,
      retryWrites: true,
      retryReads: true,
      dbName: "acccareerclub", // 👈 ADD THIS LINE TO FORCE THE DATABASE
    };

    console.log("🔄 Connecting to MongoDB Atlas...");
    // (Note: You might want to update these console logs too,

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log("✅ MongoDB connected successfully!");
        console.log("📚 Database:", mongoose.connection.name); // This should now log 'nutshola'
        return mongoose;
      })
      .catch((error) => {
        console.error("❌ MongoDB connection error:", error.message);
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export async function withPrimaryWrite(operation, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (
        (error.code === 10107 || error.message?.includes("not primary")) &&
        i < maxRetries - 1
      ) {
        console.log(`⚠️ Not primary, retrying (${i + 1}/${maxRetries})...`);
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      throw error;
    }
  }
}
