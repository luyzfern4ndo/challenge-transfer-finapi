import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('Get Statement Operation', () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository,
       inMemoryStatementsRepository);
  });

  it('should be able to get an statement operation', async () => {
    const user: ICreateUserDTO = {
      email: 'user@email.com',
      name: 'User test',
      password: 'password',
    };

    const userInMemory = await inMemoryUsersRepository.create(user);

    const statement: ICreateStatementDTO = {
      amount: 80,
      description: 'Deposit',
      type: OperationType.DEPOSIT,
      user_id: userInMemory.id as string,
    };

    const statementInMemory = await inMemoryStatementsRepository.create(statement);

    const result = await getStatementOperationUseCase.execute({statement_id: statementInMemory.id as string,
      user_id: userInMemory.id as string
    });

    expect(result).toBe(statementInMemory);
  })

  it('should not be able to get an statement operation to a nonexistent user', async () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        email: 'user@email.com',
        name: 'User test',
        password: 'password',
      };
  
      const userInMemory = await inMemoryUsersRepository.create(user);
  
      const statement: ICreateStatementDTO = {
        amount: 80,
        description: 'Deposit',
        type: OperationType.DEPOSIT,
        user_id: userInMemory.id as string,
      };
  
      const statementInMemory = await inMemoryStatementsRepository.create(statement);

      await getStatementOperationUseCase.execute({user_id: 'nothing', 
      statement_id: statementInMemory.id as string });

    }).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to get an Statement Operation if it doesnt exists an operation', async () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        email: 'user@email.com',
        name: 'User test',
        password: 'password',
      };
  
      const userInMemory = await inMemoryUsersRepository.create(user);
  
      await getStatementOperationUseCase.execute({
        statement_id: '321321',
        user_id: userInMemory.id as string,
      });
    }).rejects.toBeInstanceOf(AppError);
  });
})