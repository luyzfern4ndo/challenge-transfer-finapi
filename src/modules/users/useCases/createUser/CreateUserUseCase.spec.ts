import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "./CreateUserUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe('Create User', () => {
  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it('should be able to create a new user', async () => {
    const user = {
      email: 'email@test.com',
      name: 'User test',
      password: 'password',
    }
    
    await createUserUseCase.execute({
      email: user.email,
      name: user.name,
      password: user.password,
    });

    const userCreated = await inMemoryUsersRepository.findByEmail(user.email);

    expect(userCreated).toHaveProperty('id');
  });

  it('should be able to verify if an user already exists', async () => {
    expect(async () => {
      const user = {
        email: 'email@test.com',
        name: 'User test',
        password: 'password',
      }
  
      await createUserUseCase.execute({
        email: user.email,
        name: user.name,
        password: user.password
      });
  
      await createUserUseCase.execute({
        email: user.email,
        name: user.name,
        password: user.password
      });
    }).rejects.toBeInstanceOf(AppError);
    
  });
})