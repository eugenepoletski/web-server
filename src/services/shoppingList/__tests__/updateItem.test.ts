import faker from 'faker';
import { ShoppingListService } from '../ShoppingListService';

describe('ShoppingListService', () => {
  const shoppingListService = new ShoppingListService();

  describe('updateItem()', () => {
    it('successfully updates an item', async () => {
      const oldDummyItem = await shoppingListService.createItem({
        title: faker.lorem.sentence().slice(0, 50),
        completed: faker.datatype.boolean(),
      });
      const newDummyTitle = faker.lorem.sentence().slice(0, 50);

      const returnedItem = await shoppingListService.updateItem(
        oldDummyItem.id,
        { title: newDummyTitle },
      );
      const storedItem = await shoppingListService.findItemById(
        oldDummyItem.id,
      );

      const expectedItem = {
        id: oldDummyItem.id,
        title: newDummyTitle,
        completed: oldDummyItem.completed,
      };

      expect(returnedItem).toMatchObject(expectedItem);
      expect(storedItem).toMatchObject(expectedItem);
    });

    it(`rejects with a reason if an item with a given id was not found`, async () => {
      await shoppingListService.createItem({
        title: faker.lorem.sentence().slice(0, 50),
        completed: faker.datatype.boolean(),
      });
      const dummyItemUpdate = { title: faker.lorem.sentence().slice(0, 50) };
      expect.assertions(2);

      try {
        await shoppingListService.updateItem(
          faker.datatype.uuid(),
          dummyItemUpdate,
        );
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(err.errors).toMatchObject({
          id: expect.any(String),
        });
      }
    });

    it(`rejects to update an item with an invalid property
    and reports reasons`, async () => {
      const oldDummyItem = await shoppingListService.createItem({
        title: faker.lorem.sentence().slice(0, 50),
        completed: faker.datatype.boolean(),
      });
      const dummyFaultyItemUpdate = { title: '' };
      expect.assertions(3);

      try {
        await shoppingListService.updateItem(
          oldDummyItem.id,
          dummyFaultyItemUpdate,
        );
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(err.errors).toMatchObject({
          title: {
            message: expect.any(String),
          },
        });
      }

      const storedItem = await shoppingListService.findItemById(
        oldDummyItem.id,
      );

      expect(storedItem).toMatchObject(oldDummyItem);
    });
  });
});
