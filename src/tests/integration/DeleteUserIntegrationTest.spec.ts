import request from "supertest";

import app from "../../infra/server/server";
import mongoose from "mongoose";
import { userModel } from "../../infra/database/mongooseUserModel";

describe("DELETE /users:id", () => {
  let userId: string;

  beforeEach(async () => {
    await userModel.deleteMany({});

    const uniqueEmail = `dandara-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}@example.com`;
    const uniqueLogin = `dandara-${Date.now()}`;

    const response = await request(app).post("/users").send({
      name: "Dandara da Silva",
      login: uniqueLogin,
      email: uniqueEmail,
      password: "123456",
    });

    if (
      response.status === 201 &&
      response.body.user &&
      response.body.user.id
    ) {
      userId = response.body.user.id;
    } else {
      throw new Error(
        `Falha ao criar usuário para teste: ${JSON.stringify(response.body)}`
      );
    }
  });

  afterEach(async () => {
    await userModel.deleteMany({});
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
