import { PasswordService } from './password.service';

describe('PasswordService', () => {
  it('hashes and verifies a password', async () => {
    const service = new PasswordService();
    const passwordHash = await service.hashPassword('valid-password');

    await expect(service.verifyPassword('valid-password', passwordHash)).resolves.toBe(true);
    await expect(service.verifyPassword('invalid-password', passwordHash)).resolves.toBe(false);
  });

  it('rejects unsupported hashes', async () => {
    const service = new PasswordService();

    await expect(service.verifyPassword('valid-password', 'bcrypt:hash')).resolves.toBe(false);
  });
});
