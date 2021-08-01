import Client from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { Server } from './server';

interface ShoppingListItem {
  id: string;
  title: string;
  completed: boolean;
}

class ShoppingListService {
  private items: ShoppingListItem[];

  constructor() {
    this.items = [];
  }

  public save(itemInfo: {
    title: string;
    completed: boolean;
  }): Promise<ShoppingListItem> {
    const item = {
      id: uuidv4(),
      title: itemInfo.title,
      completed: itemInfo.completed,
    };

    this.items.push(item);

    return Promise.resolve(item);
  }

  public findById(id: string): Promise<ShoppingListItem> {
    return Promise.resolve(this.items.find((item) => item.id === id));
  }
}

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
    server.stop();
    done();
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
