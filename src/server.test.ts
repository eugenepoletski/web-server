import { AddressInfo } from 'net';
import Client from 'socket.io-client';
import faker from 'faker';
import { Server } from './server';

class MockedShoppingListService {
  public create() {
    jest.fn();
  }

  public findAll() {
    jest.fn();
  }

  public isValidationError() {
    jest.fn();
  }
}

describe('Server', () => {
  let server;

  beforeEach(() => {
    server = new Server({
      port: 3000,
      shoppingListService: new MockedShoppingListService(),
    });
  });

  describe('start a server', () => {
    it('should start on a port', async () => {
      await server.start();

      expect((server.address() as AddressInfo).port).toBe(3000);

      await server.stop();
    });

    it('should invoke a callback', async () => {
      const mockCb = jest.fn();

      await server.start(mockCb);

      expect(mockCb).toHaveBeenCalledTimes(1);

      await server.stop();
    });
  });

  describe('stop a server', () => {
    it('should invoke a callback', async () => {
      const mockCb = jest.fn();

      await server.start();
      await server.stop(mockCb);

      expect(mockCb).toHaveBeenCalledTimes(1);
    });
  });
});

describe('Shopping list management', () => {
  const mockedShoppingListService = new MockedShoppingListService();
  let server, clientSocket;

  beforeEach((done) => {
    server = new Server({
      port: 3000,
      shoppingListService: mockedShoppingListService,
    });
    server.start(() => {
      clientSocket = Client(`http://localhost:${server.address().port}`);
      done();
    });
  });

  afterEach((done) => {
    jest.clearAllMocks();
    clientSocket.close();
    server.stop(() => {
      done();
    });
  });

  describe('Create a shopping list item', () => {
    it('should create an item entity successfully', (done) => {
      const dummyItemInfo = {
        title: faker.lorem.words(3).slice(0, 50),
        completed: faker.datatype.boolean(),
      };

      const dummyItem = {
        id: faker.datatype.uuid(),
        title: dummyItemInfo.title,
        completed: dummyItemInfo.completed,
      };

      jest
        .spyOn(mockedShoppingListService, 'create')
        .mockImplementationOnce(() => Promise.resolve(dummyItem));

      clientSocket.emit('shoppingListItem:create', dummyItemInfo, (res) => {
        expect(res.status).toBe('success');
        expect(res.payload).toMatchObject(dummyItem);
        done();
      });
    });

    it('should disconnect if callback is missing', (done) => {
      const dummyItem = {
        title: faker.lorem.words(3).slice(0, 50),
        completed: faker.datatype.boolean(),
      };

      clientSocket.emit('shoppingListItem:create', dummyItem);
      clientSocket.on('disconnect', () => {
        done();
      });
    });

    it('should return an error of type "fail" with faulty item property name and a message if item validation failed', (done) => {
      const dummyItem = {
        title: '',
        completed: faker.datatype.boolean(),
      };

      const dummyErrorMessage = faker.lorem.sentence();
      const dummyItemInvalidPropertyName = faker.datatype.string();

      const dummyValidationError = {
        error: {
          details: [
            {
              message: dummyErrorMessage,
              context: {
                key: dummyItemInvalidPropertyName,
              },
            },
          ],
        },
      };

      jest
        .spyOn(mockedShoppingListService, 'create')
        .mockImplementationOnce(() => Promise.reject(dummyValidationError));

      jest
        .spyOn(mockedShoppingListService, 'isValidationError')
        .mockImplementationOnce(() => true);

      clientSocket.emit('shoppingListItem:create', dummyItem, (res) => {
        expect(res.status).toBe('fail');
        expect(res.payload).toEqual(
          expect.objectContaining({
            [dummyItemInvalidPropertyName]: dummyErrorMessage,
          }),
        );
        done();
      });
    });
  });

  describe('Return list of items', () => {
    it('should return a list of items', (done) => {
      const dummyItem1 = {
        id: faker.datatype.uuid(),
        title: faker.lorem.words(3).slice(0, 50),
        completed: faker.datatype.boolean(),
      };
      const dummyItem2 = {
        id: faker.datatype.uuid(),
        title: faker.lorem.words(1).slice(0, 50),
        completed: faker.datatype.boolean(),
      };
      const dummyItem3 = {
        id: faker.datatype.uuid(),
        title: faker.lorem.words(2).slice(0, 50),
        completed: faker.datatype.boolean(),
      };

      jest
        .spyOn(mockedShoppingListService, 'findAll')
        .mockImplementation(() =>
          Promise.resolve([dummyItem1, dummyItem2, dummyItem3]),
        );

      clientSocket.emit('shoppingListItem:list', (res) => {
        const dummyItemList = res.payload;
        expect(dummyItemList).toHaveLength(3);
        expect(dummyItemList).toEqual(
          expect.arrayContaining([dummyItem3, dummyItem1, dummyItem2]),
        );
        done();
      });
    });

    it('should disconnect if callback is missing', (done) => {
      clientSocket.emit('shoppingListItem:list');
      clientSocket.on('disconnect', () => {
        done();
      });
    });
  });
});
