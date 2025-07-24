import { Request, Response } from "express";
import { userRepository } from "../../infra/database/repositoryInstance";
import { CreateUser } from "../../core/usecases/CreateUser";

export class CreateUserController {
  async handle(req: Request, res: Response): Promise<Response> {
    const { name, login, email, password } = req.body;

    try {
      const createUser = new CreateUser(userRepository);

      const user = await createUser.execute({ name, login, email, password });

      const { password: _, ...userWithoutPassword } = user;

      return res.status(201).json({message: 'usuário criado com sucesso', user: userWithoutPassword});
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
