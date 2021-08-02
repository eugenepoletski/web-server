import { AddressInfo } from 'net';
import Client from 'socket.io-client';
import faker from 'faker';
import { Server } from './server';
import { ShoppingListService } from './services/shoppingList';

describe('Server', () => {
  const shoppingListService = {};
  let server;

  beforeEach(() => {
    server = new Server({ port: 3000, shoppingListService });
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
        const storedEntity = await shoppingListService.findById(res.payload.id);
        expect(storedEntity).toMatchObject({
          id: res.payload.id,
          title: entityInfo.title,
          completed: entityInfo.completed,
        });
        done();
      });
    });
  });
});
