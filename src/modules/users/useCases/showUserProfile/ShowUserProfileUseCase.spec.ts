import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe('Show User Profile', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
  });

  it('should be able to list a user profile', async () => {
    const user = await inMemoryUsersRepository.create({
      email: 'Email test',
      name: 'Name test',
      password: 'password',
    });

    const userProfile = await showUserProfileUseCase.execute(user.id as string);

    expect(userProfile).toEqual(user);
  });

  it('should not be able to list a user profile nonexistent', async () => {
    expect(async () => {
      await showUserProfileUseCase.execute('idNonexistent');
    }).rejects.toBeInstanceOf(AppError);


  });
});