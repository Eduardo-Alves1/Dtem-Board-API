import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('returns API health status', () => {
    const controller = new HealthController();

    expect(controller.getHealth()).toMatchObject({
      status: 'ok',
      service: 'dtem-board-api',
    });
  });
});
