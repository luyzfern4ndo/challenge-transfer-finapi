import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

import { ICreateUserDTO } from '../createUser/ICreateUserDTO';
import { AppError } from "../../../../shared/errors/AppError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

describe('Authenticate User', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
  });

  it('should be able to authenticate an user', async () => {
    const user: ICreateUserDTO = {
      email: 'email@email.com',
      password: 'passwordHash',
      name: 'User test',
    };

    await createUserUseCase.execute({
      email: user.email,
      password: user.password,
      name: user.name,
    });

    const result = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password
    });

    expect(result).toHaveProperty('token');
  });

  it('should not be able to authenticate with a nonexistent user', async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: 'emailFake@email',
        password: 'fakePassword'
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to authenticate with a incorrect password', async () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        email: 'realEmail@email.com',
        password: 'teste',
        name: 'Real User'
      };
  
      await createUserUseCase.execute(user);
  
      await authenticateUserUseCase.execute({
        email: user.email,
        password: 'incorrectPassword'
      });
    }).rejects.toBeInstanceOf(AppError);
  });
})