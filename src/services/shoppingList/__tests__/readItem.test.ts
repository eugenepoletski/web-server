import faker from 'faker';
import { ShoppingListService } from '../ShoppingListService';

describe('ShoppingListService', () => {
  const shoppingListService = new ShoppingListService();

  describe('findById', () => {
    it('successfully retrieves an item by its id', async () => {
      const dummyItem = await shoppingListService.createItem({
        title: faker.lorem.sentence().slice(0, 50),
        completed: faker.datatype.boolean(),
      });

      const foundDummyItem = await shoppingListService.findById(dummyItem.id);

      expect(foundDummyItem).toMatchObject(dummyItem);
    });
  });
});
