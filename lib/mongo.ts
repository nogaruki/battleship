import mongoose from "mongoose";

export async function dbConnect() {
    if (mongoose.connection.readyState >= 1) return;
    try {
        await mongoose.connect(process.env.MONGODB_URI!, {
            serverSelectionTimeoutMS: 15000,
        });
        console.log("✅  Mongo connected");
    } catch (err) {
        console.error("❌  Mongo connect fail →", err);
        throw err;
    }
}