import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";

dotenv.config({
  path: path.resolve(__dirname, "../../.env.test"),
});

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_TEST_URL!);
  }
}, 60000);

afterAll(async () => {
  await mongoose.connection.close();
}, 60000);

export default {
  testTimeout: 30000,
  maxConcurrency: 1,
};
