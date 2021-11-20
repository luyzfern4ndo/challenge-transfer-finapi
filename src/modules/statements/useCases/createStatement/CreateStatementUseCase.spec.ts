import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('Create Statement', () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository,
      inMemoryStatementsRepository);
  });

  it('should be able to create a DEPOSIT OPERATION', async () => {
    const user: ICreateUserDTO = {
      email: 'test@email.com',
      name: 'User test',
      password: 'passwordTest'
    }

    const userInMemory = await inMemoryUsersRepository.create(user);

    const statement: ICreateStatementDTO = {
      amount: 1000,
      description: 'credit',
      type: OperationType.DEPOSIT,
      user_id: userInMemory.id as string,
    }

    const statementCreated = await createStatementUseCase.execute({
      user_id: userInMemory.id as string,
      amount: statement.amount,
      description: statement.description,
      type: statement.type,
    })

    expect(statementCreated).toHaveProperty('id');
  });

  it('should be able to make a Withdrawy Operation if it has sufficent founds', async () => {
    const user: ICreateUserDTO = {
      email: 'user@email.com',
      password: 'test',
      name: 'User Test'
    };

    const userInMemory = await inMemoryUsersRepository.create(user);

    await inMemoryStatementsRepository.create({
      amount: 1000,
      description: 'Deposit',
      type: OperationType.DEPOSIT,
      user_id: userInMemory.id as string,
    });

    const statementWithdraw: ICreateStatementDTO = {
      amount: 80,
      description: 'Withdraw',
      type: OperationType.WITHDRAW,
      user_id: userInMemory.id as string,
    };

    const result = await createStatementUseCase.execute(statementWithdraw);

    expect(result).toHaveProperty('id');
  });

  it('should not be able to make a Withdrawy Operation if it has not sufficent founds', async () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        email: 'user@email.com',
        password: 'test',
        name: 'User Test'
      };
  
      const userInMemory = await inMemoryUsersRepository.create(user);
  
      const statementWithdraw: ICreateStatementDTO = {
        amount: 80,
        description: 'Withdraw',
        type: OperationType.WITHDRAW,
        user_id: userInMemory.id as string,
      };
  
      await createStatementUseCase.execute(statementWithdraw);
    }).rejects.toBeInstanceOf(AppError);
  });


  it('should not be able to create an statement to nonexistent user', () => {
    expect(async () => {
      const statement: ICreateStatementDTO = {
        amount: 80,
        description: 'credit',
        type: OperationType.DEPOSIT,
        user_id: 'nonExistentUser',
      };
  
      await createStatementUseCase.execute(statement);
    }).rejects.toBeInstanceOf(AppError);
  });
})