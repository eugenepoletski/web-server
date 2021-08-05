import { AddressInfo } from 'net';
import Client from 'socket.io-client';
import faker from 'faker';
import { Server } from './server';

class ShoppingListServiceMock {
  save({ title, completed }): Promise<any> {
    return Promise.resolve({ id: faker.datatype.uuid(), title, completed });
  }

  findAll(): Promise<any[]> {
    return Promise.resolve([
      {
        id: faker.datatype.uuid(),
        title: faker.lorem.words(1),
        completed: faker.datatype.boolean(),
      },
      {
        id: faker.datatype.uuid(),
        title: faker.lorem.words(3),
        completed: faker.datatype.boolean(),
      },
      {
        id: faker.datatype.uuid(),
        title: faker.lorem.words(2),
        completed: faker.datatype.boolean(),
      },
    ]);
  }
}

describe('Server', () => {
  let server;

  beforeEach(() => {
    server = new Server({
      port: 3000,
      shoppingListService: new ShoppingListServiceMock(),
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
  let server, clientSocket;

  beforeEach((done) => {
    server = new Server({
      port: 3000,
      shoppingListService: new ShoppingListServiceMock(),
    });
    server.start(() => {
      clientSocket = Client(`http://localhost:${server.address().port}`);
      done();
    });
  });

  afterEach((done) => {
    clientSocket.close();
    server.stop(() => {
      done();
    });
  });

  describe('Create a shopping list item', () => {
    it('should create an item entity', (done) => {
      const entityInfo = {
        title: faker.lorem.words(3),
        completed: faker.datatype.boolean(),
      };

      clientSocket.emit('shoppingListItem:create', entityInfo, (res) => {
        expect(res.payload).toMatchObject({
          id: expect.any(String),
          title: entityInfo.title,
          completed: entityInfo.completed,
        });
        done();
      });
    });
  });

  describe('Return list of items', () => {
    it('should return a list of items', (done) => {
      clientSocket.emit('shoppingListItem:list', (res) => {
        const itemList = res.payload;
        expect(itemList).toHaveLength(3);
        expect(itemList).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              title: expect.any(String),
              completed: expect.any(Boolean),
            }),
            expect.objectContaining({
              id: expect.any(String),
              title: expect.any(String),
              completed: expect.any(Boolean),
            }),
            expect.objectContaining({
              id: expect.any(String),
              title: expect.any(String),
              completed: expect.any(Boolean),
            }),
          ]),
        );
        done();
      });
    });
  });
});
