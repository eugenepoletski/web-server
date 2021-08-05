import { AddressInfo } from 'net';
import Client from 'socket.io-client';
import faker from 'faker';
import { Server } from './server';

class ServiceError extends Error {
  date: Date;
  meta: {
    [key: string]: any;
  };

  constructor(options, ...params) {
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ServiceError);
    }

    this.name = options.name;
    this.message = options.message;
    this.meta = options.meta;
    this.date = new Date();
  }
}

class ShoppingListServiceMock {
  create({ title, completed }): Promise<any> {
    if (!title) {
      return Promise.reject(
        new ServiceError({
          name: 'ValidationError',
          message: 'Title is missing',
          meta: { title: 'Title is missing' },
        }),
      );
    }
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
    it('should create an item entity successfully', (done) => {
      const itemInfo = {
        title: faker.lorem.words(3),
        completed: faker.datatype.boolean(),
      };

      clientSocket.emit('shoppingListItem:create', itemInfo, (res) => {
        expect(res.payload).toMatchObject({
          id: expect.any(String),
          title: itemInfo.title,
          completed: itemInfo.completed,
        });
        done();
      });
    });

    it('should return an error if title is missing', (done) => {
      const itemInfo = {
        title: '',
        completed: faker.datatype.boolean(),
      };

      clientSocket.emit('shoppingListItem:create', itemInfo, (res) => {
        expect(res.status).toBe('fail');
        expect(res.payload).toEqual(
          expect.objectContaining({
            title: expect.any(String),
          }),
        );
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
