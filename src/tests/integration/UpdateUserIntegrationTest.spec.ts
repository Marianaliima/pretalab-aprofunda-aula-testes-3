import request from "supertest";
import mongoose from "mongoose";
import app from "../../infra/server/server";
import { userModel } from "../../infra/database/mongooseUserModel";

describe("PATCH /users:id", () => {
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
