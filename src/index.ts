import { Server } from './server';
import { ShoppingListService } from './services/shoppingList';

const server = new Server({
  port: 3000,
  shoppingListService: new ShoppingListService(),
});

server.start(() => {
  console.log('Server listening on port 3000');
});
