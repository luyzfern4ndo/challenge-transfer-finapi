import { inject, injectable } from "tsyringe";
import { AppError } from "../../../../shared/errors/AppError";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";

@injectable()
class CreateTransferUseCase {
  
  constructor(
  @inject('UsersRepository')
  private usersRepository: IUsersRepository,

  @inject('StatementsRepository')
  private statementsRepository: IStatementsRepository) {}
  
  async execute({ amount, description, receiver_id, user_id, type }: ICreateStatementDTO) {
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new AppError('User not found');
    }

    if (amount < 0) {
      throw new AppError('The amount should not be less than 0')
    }

    const { balance } = await this.statementsRepository.getUserBalance({ user_id });

    if (balance < amount) {
      throw new AppError('Insufficient funds')
    }

    const userReceiver = await this.usersRepository.findById(receiver_id as string);


    if (!userReceiver) {
      throw new AppError('User Receiver not found')
    }

    await this.statementsRepository.create({
      amount,
      type: 'debit' as OperationType,
      description: `${description} - To User ${userReceiver.name}`,
      user_id
    })

    const transfer = await this.statementsRepository.create({
      amount,
      description,
      user_id,
      receiver_id,
      type,
    });

    return transfer;

  }

}

export { CreateTransferUseCase } 