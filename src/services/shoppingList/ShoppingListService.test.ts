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
      const itemInfo = {
        title: faker.lorem.words(3),
        completed: faker.datatype.boolean(),
      };

      const resultItem = await shoppingListService.create(itemInfo);

      expect(typeof resultItem.id === 'string').toBe(true);
      expect(resultItem.title).toBe(itemInfo.title);
      expect(resultItem.completed).toBe(itemInfo.completed);

      const createdItem = await shoppingListService.findById(resultItem.id);

      expect(createdItem.id).toBe(resultItem.id);
      expect(createdItem.title).toBe(itemInfo.title);
      expect(createdItem.completed).toBe(itemInfo.completed);
    });
  });

  describe('Return items list', () => {
    it('should return a list of entities', async () => {
      const createdItem1 = await shoppingListService.create({
        title: faker.lorem.words(1),
        completed: faker.datatype.boolean(),
      });

      const createdItem2 = await shoppingListService.create({
        title: faker.lorem.words(2),
        completed: faker.datatype.boolean(),
      });

      const itemList = await shoppingListService.findAll();

      expect(itemList).toContain(createdItem1);
      expect(itemList).toContain(createdItem2);
    });
  });
});
