import { Request, Response } from "express";
import { container } from "tsyringe";
import { OperationType } from "../../entities/Statement";
import { CreateTransferUseCase } from "./CreateTransferUseCase";

class CreateTransferController {
  async handle(request: Request, response: Response) {
    const { user_id } = request.params;

    const { amount, description } = request.body;

    const { id } = request.user;

    const splittedPath = request.originalUrl.split('/')
    const type = splittedPath[splittedPath.length - 1] as OperationType;

    const createTransferUseCase = container.resolve(CreateTransferUseCase);

    const transfer = await createTransferUseCase.execute({
      receiver_id: user_id,
      amount,
      description,
      type,
      user_id: id
    });

    return response.json(transfer);
  }
}

export { CreateTransferController }
