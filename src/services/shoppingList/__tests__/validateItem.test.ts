import faker from 'faker';
import { ShoppingListService } from '../ShoppingListService';

describe('ShoppingListService', () => {
  const shoppingListService = new ShoppingListService();

  describe('item validation', () => {
    describe('validateNewItem()', () => {
      it('successfully validates minimal item information', () => {
        const dummyItemInfo = {
          title: faker.lorem.sentence().slice(0, 50),
        };

        const result = shoppingListService.validateNewItem(dummyItemInfo);

        expect(result.error).toBeFalsy();
      });

      it('reports validation errors for faulty item information', () => {
        const dummyInvalidItemInfo = {
          title: '',
          completed: faker.datatype.boolean(),
        };

        const result =
          shoppingListService.validateNewItem(dummyInvalidItemInfo);

        expect(result.error.errors.title.message).toEqual(expect.any(String));
      });
    });
  });
});
