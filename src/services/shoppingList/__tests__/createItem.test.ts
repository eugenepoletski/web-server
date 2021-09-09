import faker from 'faker';
import { ShoppingListService } from '../ShoppingListService';

describe('ShoppingListService', () => {
  const shoppingListService = new ShoppingListService();

  describe('createItem()', () => {
    it('successfully creates an item', async () => {
      const dummyItem = {
        title: faker.lorem.sentence().slice(0, 50),
        completed: faker.datatype.boolean(),
      };

      const resultItem = await shoppingListService.createItem(dummyItem);

      expect(typeof resultItem.id === 'string').toBe(true);
      expect(resultItem.title).toBe(dummyItem.title);
      expect(resultItem.completed).toBe(dummyItem.completed);

      const createdItem = await shoppingListService.findById(resultItem.id);

      expect(createdItem.id).toBe(resultItem.id);
      expect(createdItem.title).toBe(dummyItem.title);
      expect(createdItem.completed).toBe(dummyItem.completed);
    });

    it(`rejects to create an item with an invalid property
        and reports reasons`, (done) => {
      const dummyInvalidItemInfo = {
        title: '',
        completed: faker.datatype.boolean(),
      };

      shoppingListService.createItem(dummyInvalidItemInfo).catch((err) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.errors).toMatchObject({
          title: {
            message: expect.any(String),
          },
        });
        done();
      });
    });
  });
});
