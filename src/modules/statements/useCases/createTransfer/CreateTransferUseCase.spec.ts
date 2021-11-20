import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { CreateTransferUseCase } from "./CreateTransferUseCase"

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createTransferUseCase: CreateTransferUseCase;
describe('Create Transfer', () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createTransferUseCase = new CreateTransferUseCase(inMemoryUsersRepository,
      inMemoryStatementsRepository,
      );
  })

  it('should be able to make a transfer to other user', async () => {

    const userInMemory = await inMemoryUsersRepository.create({
      email: 'user@email.com',
      name: 'User Test',
      password: '123',
    });

    const userStatement = await inMemoryStatementsRepository.create({
      amount: 100,
      description: 'Deposit',
      type: 'deposit' as OperationType,
      user_id: userInMemory.id as string,
    });

    const userReceiverInMemory = await inMemoryUsersRepository.create({
      email: 'receiver@email.com',
      name: 'User Receiver',
      password: '321'
    })


    const transfer: ICreateStatementDTO = {
      amount: 100,
      description: 'Transfer Test',
      type: 'transfer' as OperationType,
      user_id: userInMemory.id as string,
      receiver_id: userReceiverInMemory.id as string,
    }

    const transferCreated = await createTransferUseCase.execute({
      user_id: transfer.user_id,
      receiver_id: transfer.receiver_id as string,
      amount: transfer.amount,
      description: transfer.description,
      type: transfer.type
    });

    expect(transferCreated).toHaveProperty('id');
  });

  it ('should not be able to make a transfer if the send user does not exists', async () => {
    expect(async () => {
      const userReceiverInMemory = await inMemoryUsersRepository.create({
        email: 'receiver@email.com',
        name: 'User Receiver',
        password: '321'
      })

      const transfer: ICreateStatementDTO = {
        amount: 100,
        description: 'Transfer Test',
        type: 'transfer' as OperationType,
        user_id: 'id-does-not-exists',
        receiver_id: userReceiverInMemory.id,
      }

      await createTransferUseCase.execute(transfer);
    }).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to make a transfer if amount is less than 0', async () => {
    expect(async () => {
      const userInMemory = await inMemoryUsersRepository.create({
        email: 'user@email.com',
        name: 'User Test',
        password: '123',
      });

      const transfer: ICreateStatementDTO = {
        amount: -1,
        description: 'Transfer Test',
        type: 'transfer' as OperationType,
        user_id: userInMemory.id as string,
        receiver_id: 'recever-id-does-not-exists',
      }

      await createTransferUseCase.execute(transfer);
    }).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to make a transfer if amount is greater than balance', async () => {
    expect(async () => {
      const userInMemory = await inMemoryUsersRepository.create({
        email: 'user@email.com',
        name: 'User Test',
        password: '123',
      });

      const transfer: ICreateStatementDTO = {
        amount: 100,
        description: 'Transfer Test',
        type: 'transfer' as OperationType,
        user_id: userInMemory.id as string,
        receiver_id: 'recever-id-does-not-exists',
      }

      await createTransferUseCase.execute(transfer);
    }).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to make a transfer if receiver user does not exists', async () => {
    expect(async () => {
      const userInMemory = await inMemoryUsersRepository.create({
        email: 'user@email.com',
        name: 'User Test',
        password: '123',
      });

      await inMemoryStatementsRepository.create({
        amount: 200,
        description: 'Deposit',
        type: 'deposit' as OperationType,
        user_id: userInMemory.id as string,
      });

      const transfer: ICreateStatementDTO = {
        amount: 100,
        description: 'Transfer Test',
        type: 'transfer' as OperationType,
        user_id: userInMemory.id as string,
        receiver_id: 'recever-id-does-not-exists',
      };

      await createTransferUseCase.execute(transfer);
    }).rejects.toBeInstanceOf(AppError);
  });
});
