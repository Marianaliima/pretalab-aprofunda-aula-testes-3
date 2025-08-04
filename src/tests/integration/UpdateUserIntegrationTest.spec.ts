import request from "supertest";
import mongoose from "mongoose";
import app from "../../infra/server/server";
import { userModel } from "../../infra/database/mongooseUserModel";

describe("PATCH /users:id", () => {
  let userId: string;

  beforeAll(async () => {
    const testDbUri = process.env.MONGO_TEST_URI || "default";
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(testDbUri);
    }
  });

  beforeEach(async () => {

    await userModel.deleteMany({});
    
    const response = await request(app).post("/users").send({
      name: "Dandara da Silva",
      login: "dandara1995",
      email: "dandara@example.com",
      password: "123456",
    });
    

    console.log("Response status:", response.status);
    console.log("Response body:", response.body);
    

    if (response.status === 201 && response.body.user && response.body.user.id) {
      userId = response.body.user.id;
    } else {
      throw new Error(`Falha ao criar usuário para teste: ${JSON.stringify(response.body)}`);
    }
  });

  afterAll(async () => {
    await userModel.deleteMany({});
    await mongoose.connection.close();
  });

  it("deve alterar o nome com sucesso", async () => {
    const response = await request(app).patch(`/users/${userId}`).send({
      name: "Clementina da Silva",
    });

    expect(response.status).toBe(200);
  });

  it.skip("deve retornarn 404 quando um id for inválido", async () => {
    const response = await request(app).patch(`/users/123`).send({
      name: "Clementina da Silva",
    });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Usuário não encontrado");
  });
});