import faker from 'faker';
import { ShoppingListService } from './ShoppingListService';

describe('Shopping List service', () => {
  let shoppingListService;

  beforeEach((done) => {
    shoppingListService = new ShoppingListService();
    shoppingListService.start(() => {
      done();
    });
  });

  afterEach((done) => {
    shoppingListService.stop(() => {
      done();
    });
  });

  describe('Create a shopping list item entity', () => {
    it('should create an item', async () => {
      const itemPayload = {
        title: faker.lorem.words(3),
        completed: faker.datatype.boolean(),
      };

      const resultItem = await shoppingListService.save(itemPayload);

      expect(typeof resultItem.id === 'string').toBe(true);
      expect(resultItem.title).toBe(itemPayload.title);
      expect(resultItem.completed).toBe(itemPayload.completed);

      const savedItem = await shoppingListService.findById(resultItem.id);

      expect(savedItem.id).toBe(resultItem.id);
      expect(savedItem.title).toBe(itemPayload.title);
      expect(savedItem.completed).toBe(itemPayload.completed);
    });
  });

  describe('Return items list', () => {
    it('should return a list of entities', async () => {
      const savedItem1 = await shoppingListService.save({
        title: faker.lorem.words(1),
        completed: faker.datatype.boolean(),
      });

      const savedItem2 = await shoppingListService.save({
        title: faker.lorem.words(2),
        completed: faker.datatype.boolean(),
      });

      const itemList = await shoppingListService.findAll();

      expect(itemList).toContain(savedItem1);
      expect(itemList).toContain(savedItem2);
    });
  });
});
