import Client from 'socket.io-client';
import { Server } from './server';
import { ShoppingListService } from './services/shoppingList';

describe('Shopping list management', () => {
  let server, clientSocket, shoppingListService;

  beforeEach((done) => {
    const port = 3000;
    shoppingListService = new ShoppingListService();
    server = new Server({ port, shoppingListService });
    server.start(() => {
      clientSocket = Client(`http://localhost:${port}`);
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
        title: 'lorem ipsum',
        completed: false,
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
