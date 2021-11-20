import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;



describe('Get Balance', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);
  });

  it('should be able to get balance to a nonexistent user', () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: '123456789'
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it('should be able to get balance to an existent user', async () => {
    const user: ICreateUserDTO = { 
      email: 'email@test.com',
      password: 'test',
      name: 'User test',
    };

    const userInMemory = await inMemoryUsersRepository.create(user);

    const balance = await getBalanceUseCase.execute({user_id: userInMemory.id as string});

    expect(balance).toHaveProperty('balance');
  })
})