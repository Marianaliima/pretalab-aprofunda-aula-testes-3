import request from "supertest";
import mongoose from "mongoose";
import app from "../../infra/server/server";
import { userModel } from "../../infra/database/mongooseUserModel";

describe("User Integration Tests", () => {
  beforeAll(async () => {
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

  beforeEach(async () => {
    await userModel.deleteMany({});
  });

  afterEach(async () => {
    await userModel.deleteMany({});
  });

  describe("POST /users", () => {
    it("deve criar um novo usuário com sucesso", async () => {
      const uniqueEmail = `dandara-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}@example.com`;
      const uniqueLogin = `dandara-${Date.now()}`;

      const userData = {
        name: "Dandara da Silva",
        login: uniqueLogin,
        email: uniqueEmail,
        password: "123456",
      };

      const response = await request(app).post("/users").send(userData);

      expect(response.status).toBe(201);
      expect(response.body.user).toHaveProperty("id");
      expect(response.body.user).toHaveProperty("name", userData.name);
      expect(response.body.user).toHaveProperty("email", userData.email);
      expect(response.body.user).toHaveProperty("login", userData.login);
      expect(response.body.user).not.toHaveProperty("password");
    });

    it("deve retornar erro em caso de email duplicado", async () => {
      const baseEmail = `dandara-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}@example.com`;
      const baseLogin = `dandara-${Date.now()}`;

      const userData = {
        name: "Dandara da Silva",
        login: baseLogin,
        email: baseEmail,
        password: "123456",
      };

      await request(app).post("/users").send(userData);

      const duplicateUserData = {
        name: "Bianca Santana",
        login: `bianca-${Date.now()}`,
        email: baseEmail,
        password: "outrasenha",
      };

      const response = await request(app)
        .post("/users")
        .send(duplicateUserData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("deve retornar erro quando campos obrigatórios estão ausentes", async () => {
      const incompleteUserData = {
        name: "Test User",
      };

      const response = await request(app)
        .post("/users")
        .send(incompleteUserData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("POST /users/login", () => {
    let testUserEmail: string;

    beforeEach(async () => {
      testUserEmail = `test-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}@example.com`;

      await request(app)
        .post("/users")
        .send({
          name: "Test User",
          login: `testuser-${Date.now()}`,
          email: testUserEmail,
          password: "123456",
        });
    });

    it("deve fazer login com credenciais válidas", async () => {
      const loginData = {
        email: testUserEmail,
        password: "123456",
      };

      const response = await request(app).post("/users/login").send(loginData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
      expect(typeof response.body.token).toBe("string");
    });

    it("deve retornar erro com email inexistente", async () => {
      const loginData = {
        email: "inexistente@example.com",
        password: "123456",
      };

      const response = await request(app).post("/users/login").send(loginData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "credenciais inválidas");
    });

    it("deve retornar erro com senha incorreta", async () => {
      const loginData = {
        email: testUserEmail,
        password: "senhaerrada",
      };

      const response = await request(app).post("/users/login").send(loginData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "credenciais inválidas");
    });
  });

  describe("GET /users/me", () => {
    let authToken: string;
    let userEmail: string;

    beforeEach(async () => {
      userEmail = `test-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}@example.com`;

      await request(app)
        .post("/users")
        .send({
          name: "Test User",
          login: `testuser-${Date.now()}`,
          email: userEmail,
          password: "123456",
        });

      const loginResponse = await request(app).post("/users/login").send({
        email: userEmail,
        password: "123456",
      });

      authToken = loginResponse.body.token;
    });

    it("deve retornar dados do usuário autenticado", async () => {
      const response = await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "rota protegida");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).toHaveProperty("userId");
      expect(response.body.user).toHaveProperty("email", userEmail);
    });

    it("deve retornar erro sem token de autorização", async () => {
      const response = await request(app).get("/users/me");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "token não enviado");
    });

    it("deve retornar erro com token inválido", async () => {
      const response = await request(app)
        .get("/users/me")
        .set("Authorization", "Bearer token_invalido");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "token inválido");
    });
  });
});
