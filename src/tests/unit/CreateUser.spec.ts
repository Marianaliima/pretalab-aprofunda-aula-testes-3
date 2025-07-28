import { User } from "../../core/entities/User";
import { CreateUser } from "../../core/usecases/CreateUser";
import { InMemoryUserRepository } from "../../infra/database/inMemoryUserRepository";

describe("CreateUser (UseCase)", () => {
  let userRepository: InMemoryUserRepository;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
  });

  it("deve criar um usuário com sucesso", async () => {
    const createUser = new CreateUser(userRepository);

    const userData = {
      name: "João Silva",
      login: "joao123",
      email: "joao@example.com",
      password: "password123",
    };

    const user = await createUser.execute(userData);

    expect(user).toBeInstanceOf(User);
    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
    expect(user.login).toBe(userData.login);
    expect(user.password).not.toBe(userData.password);
    expect(user.password).toBeDefined();
  });
});
