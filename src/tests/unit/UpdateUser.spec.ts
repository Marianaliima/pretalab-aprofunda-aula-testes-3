import { User } from "../../core/entities/User";
import { UpdateUser } from "../../core/usecases/UpdateUser";
import { InMemoryUserRepository } from "../../infra/database/inMemoryUserRepository";

describe("UpdateUser (UseCase)", () => {
  let userRepository: InMemoryUserRepository;
  let updateUser: UpdateUser;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    updateUser = new UpdateUser(userRepository);
  });

  it("deve atualizar um usuário existente com sucesso", async () => {
    const user = new User(
      "João Silva",
      "joao123",
      "joao@example.com",
      "password123",
      "1"
    );
    
    await userRepository.save(user);

    const updateData = {
      name: "João Santos",
      email: "joao.santos@example.com",
    };

    const updatedUser = await updateUser.execute("1", updateData);

    expect(updatedUser).toBeInstanceOf(User);
    expect(updatedUser.name).toBe("João Santos");
    expect(updatedUser.email).toBe("joao.santos@example.com");
    expect(updatedUser.login).toBe("joao123");
  });

  it("deve lançar erro ao tentar atualizar usuário inexistente", async () => {
    const updateData = {
      name: "Nome Atualizado",
    };

    await expect(updateUser.execute("id-inexistente", updateData))
      .rejects.toThrow("usuário não encontrado");
  });
});