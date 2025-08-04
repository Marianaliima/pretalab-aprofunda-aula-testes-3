import request from "supertest";

import app from "../../infra/server/server";
import mongoose from "mongoose";
import { userModel } from "../../infra/database/mongooseUserModel";

describe("DELETE /users:id", () => {
  let userId: string;

  beforeAll(async () => {
    const testDbUri = process.env.MONGO_TEST_URI || "default";
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(testDbUri);
    }
  });

  beforeEach(async () => {
    await userModel.deleteMany({});
    
    const { body } = await request(app).post("/users").send({
      name: "Dandara da Silva",
      login: "dandara1995",
      email: "dandara@example.com",
      password: "123456",
    });
    userId = body.user.id;
  });

  afterAll(async () => {
    await userModel.deleteMany({});
    await mongoose.connection.close();
  });

  it("deve retornar 204 quando remover um usuário com sucesso", async () => {
    const response = await request(app).delete(`/users/${userId}`);

    expect(response.status).toBe(204);
  });

  it("deve retornar 404 quando tentar remover um usuário inexistente", async () => {
   
    const fakeObjectId = new mongoose.Types.ObjectId().toString();
    const response = await request(app).delete(`/users/${fakeObjectId}`);
    
    expect(response.status).toBe(404);
    expect(response.body.error).toBe("usuário não encontrado");
  });
});