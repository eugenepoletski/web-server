import { AddressInfo } from 'net';
import { Server } from './server';
import { ShoppingListService } from './services/shoppingList';
import { shoppingListItemSchema } from './services/shoppingList/schemas/ShoppingListItemSchema';

const PORT = 5000;

const server = new Server({
  port: PORT,
  shoppingListService: new ShoppingListService({
    shoppingListItemSchema,
  }),
});

server.start(() => {
  console.log(
    `Server listening on port ${(server.address() as AddressInfo).port}`,
  );
});
