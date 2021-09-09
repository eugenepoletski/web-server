import { Server } from './server';
import { ShoppingListService } from './services/shoppingList';
import { logger } from './common';

const PORT = 5000;

const server = new Server({
  port: PORT,
  shoppingListService: new ShoppingListService(),
  logger,
});

server.start();
