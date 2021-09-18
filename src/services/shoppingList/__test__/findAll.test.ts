import faker from 'faker';
import { ShoppingListService } from '../ShoppingListService';

describe('ShoppingListService', () => {
  const shoppingListService = new ShoppingListService();

  describe('findAll()', () => {
    it('retreives a list of items', async () => {
      const createdItem1 = await shoppingListService.createItem({
        title: faker.lorem.sentence().slice(0, 50),
        completed: faker.datatype.boolean(),
      });

      const createdItem2 = await shoppingListService.createItem({
        title: faker.lorem.sentence().slice(0, 50),
        completed: faker.datatype.boolean(),
      });

      const itemList = await shoppingListService.findAll();

      expect(itemList).toContain(createdItem1);
      expect(itemList).toContain(createdItem2);
    });
  });
});
