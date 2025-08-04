import request from "supertest";
import mongoose from "mongoose";
import app from "../../infra/server/server";
import { userModel } from "../../infra/database/mongooseUserModel";
import { PostModel } from "../../infra/database/mogoosePostModel";

describe("Posts Integration Tests", () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    await userModel.deleteMany({});
    await PostModel.deleteMany({});

    const uniqueEmail = `test-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}@example.com`;
    const uniqueLogin = `testuser-${Date.now()}`;

    const userResponse = await request(app).post("/users").send({
      name: "Test User",
      login: uniqueLogin,
      email: uniqueEmail,
      password: "123456",
    });

    userId = userResponse.body.user?.id || userResponse.body.id;

    const loginResponse = await request(app).post("/users/login").send({
      email: uniqueEmail,
      password: "123456",
    });

    authToken = loginResponse.body.token;
  });

  afterEach(async () => {
    await userModel.deleteMany({});
    await PostModel.deleteMany({});
  });

  describe("POST /posts", () => {
    it("deve criar um post com usuário autenticado", async () => {
      const postData = {
        title: "Post de Teste",
        content: "Este é um post criado durante os testes automatizados",
      };

      const response = await request(app)
        .post("/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send(postData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty(
        "message",
        "Post criado com sucesso!"
      );
    });

    it("deve retornar 401 ao tentar criar post sem token", async () => {
      const postData = {
        title: "Post Sem Auth",
        content: "Este post não deveria ser criado",
      };

      const response = await request(app).post("/posts").send(postData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "token não enviado");
    });

    it("deve retornar 401 com token inválido", async () => {
      const postData = {
        title: "Post Token Inválido",
        content: "Este post não deveria ser criado",
      };

      const response = await request(app)
        .post("/posts")
        .set("Authorization", "Bearer token_invalido")
        .send(postData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "token inválido");
    });

    it("deve retornar 400 quando título estiver vazio", async () => {
      const postData = {
        title: "",
        content: "Conteúdo sem título",
      };

      const response = await request(app)
        .post("/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send(postData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "error",
        "Título e conteúdo são obrigatórios"
      );
    });

    it("deve retornar 400 quando conteúdo estiver vazio", async () => {
      const postData = {
        title: "Título sem conteúdo",
        content: "",
      };

      const response = await request(app)
        .post("/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send(postData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "error",
        "Título e conteúdo são obrigatórios"
      );
    });
  });

  describe("GET /posts/my-posts", () => {
    beforeEach(async () => {
      await request(app)
        .post("/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Primeiro Post",
          content: "Conteúdo do primeiro post",
        });

      await request(app)
        .post("/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Segundo Post",
          content: "Conteúdo do segundo post",
        });
    });

    it("deve retornar posts do usuário autenticado", async () => {
      const response = await request(app)
        .get("/posts/my-posts")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);

      const post = response.body[0];
      expect(post).toHaveProperty("title");
      expect(post).toHaveProperty("content");
      expect(post).toHaveProperty("userId");
    });

    it("deve retornar 401 ao buscar posts sem token", async () => {
      const response = await request(app).get("/posts/my-posts");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "token não enviado");
    });

    it("deve retornar array vazio para usuário sem posts", async () => {
      await request(app).post("/users").send({
        name: "Novo User",
        login: "novouser",
        email: "novo@example.com",
        password: "123456",
      });

      const loginResponse = await request(app).post("/users/login").send({
        email: "novo@example.com",
        password: "123456",
      });

      const newToken = loginResponse.body.token;

      const response = await request(app)
        .get("/posts/my-posts")
        .set("Authorization", `Bearer ${newToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe("GET /posts/posts", () => {
    beforeEach(async () => {
      await request(app)
        .post("/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Post Público",
          content: "Este é um post para testar a busca pública",
        });
    });

    it("deve retornar todos os posts com informações do usuário", async () => {
      const response = await request(app).get("/posts/posts");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const post = response.body[0];
      expect(post).toHaveProperty("title");
      expect(post).toHaveProperty("content");
      expect(post).toHaveProperty("user");
      expect(post.user).toHaveProperty("name");
      expect(post.user).toHaveProperty("email");
    });

    it("deve funcionar sem autenticação (rota pública)", async () => {
      const response = await request(app).get("/posts/posts");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
