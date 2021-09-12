import { mockedLogger, MockedShoppingListService } from '../../__mocks__';
import { Server, Service } from '../../server';

export const mockedShoppingListService = new MockedShoppingListService();

/**
 * @see https://stackoverflow.com/a/63293781 for port 0
 */
export const server = new Server({
  port: 0,
  shoppingListService:
    mockedShoppingListService as unknown as jest.Mocked<Service>,
  logger: mockedLogger,
});

beforeAll((done) => {
  server.start(() => {
    done();
  });
});

afterAll((done) => {
  server.stop(() => {
    done();
  });
});
