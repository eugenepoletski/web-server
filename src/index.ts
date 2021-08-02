import { AddressInfo } from 'net';
import { Server } from './server';
import { ShoppingListService } from './services/shoppingList';

const PORT = 3000;

const server = new Server({
  port: PORT,
  shoppingListService: new ShoppingListService(),
});

server.start(() => {
  console.log(
    `Server listening on port ${(server.address() as AddressInfo).port}`,
  );
});
