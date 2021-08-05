import { AddressInfo } from 'net';
import Client from 'socket.io-client';
import faker from 'faker';
import { Server } from './server';
import { ShoppingListService } from './services/shoppingList';

describe('Server', () => {
  const shoppingListServiceMock = {};
  let server;

  beforeEach(() => {
    server = new Server({
      port: 3000,
      shoppingListService: shoppingListServiceMock,
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
  let server, clientSocket, shoppingListService;

  beforeEach((done) => {
    shoppingListService = new ShoppingListService();
    server = new Server({ port: 3000, shoppingListService });
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

      clientSocket.emit('shoppingListItem:create', entityInfo, async (res) => {
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
      const entityInfo1 = {
        title: faker.lorem.words(1),
        completed: faker.datatype.boolean(),
      };
      const entityInfo2 = {
        title: faker.lorem.words(2),
        completed: faker.datatype.boolean(),
      };

      Promise.all([
        shoppingListService.save(entityInfo1),
        shoppingListService.save(entityInfo2),
      ]).then(([savedItem1, savedItem2]) => {
        clientSocket.emit('shoppingListItem:list', (res) => {
          const itemList = res.payload;
          expect(itemList).toHaveLength(2);
          expect(itemList).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                id: savedItem1.id,
                title: savedItem1.title,
                completed: savedItem1.completed,
              }),
              expect.objectContaining({
                id: savedItem2.id,
                title: savedItem2.title,
                completed: savedItem2.completed,
              }),
            ]),
          );
          done();
        });
      });
    });
  });
});
