import { IAdminRepository } from '../../../domain/repositories/IAdminRepository';

export class LogoutUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(token: string): Promise<void> {
    await this.adminRepository.deleteSession(token);
  }
}

