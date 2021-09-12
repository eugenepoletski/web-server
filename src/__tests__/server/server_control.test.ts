import { AddressInfo } from 'net';
import { Server, Service } from '../../server';
import { mockedLogger, MockedShoppingListService } from '../../__mocks__';

describe('Server', () => {
  let server;

  beforeEach(() => {
    const mockedShoppingListService = new MockedShoppingListService();
    server = new Server({
      port: 3001,
      shoppingListService:
        mockedShoppingListService as unknown as jest.Mocked<Service>,
      logger: mockedLogger,
    });
  });

  describe('start()', () => {
    it('starts on a certain port', async () => {
      await server.start();

      expect((server.address() as AddressInfo).port).toBe(3001);

      await server.stop();
    });

    it('invokes a callback', async () => {
      const mockCb = jest.fn();

      await server.start(mockCb);

      expect(mockCb).toHaveBeenCalledTimes(1);

      await server.stop();
    });
  });

  describe('stop()', () => {
    it('invokes a callback', async () => {
      const mockCb = jest.fn();

      await server.start();
      await server.stop(mockCb);

      expect(mockCb).toHaveBeenCalledTimes(1);
    });
  });
});
