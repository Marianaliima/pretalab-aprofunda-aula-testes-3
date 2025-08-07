import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";

dotenv.config({
  path: path.resolve(__dirname, "../../.env.test"),
});

beforeAll(async () => {
  mongoose.set('bufferCommands', false);
  
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_TEST_URL!, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000, 
      maxPoolSize: 5, 
    });
  }
}, 30000); 

afterAll(async () => {
  await mongoose.connection.close();
}, 10000); 

export default {
  testTimeout: 15000,
  maxConcurrency: 1,
};
