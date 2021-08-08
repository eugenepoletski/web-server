import faker from 'faker';
import { Schema, ValidationError } from 'joi';
import { shoppingListItemSchema } from '../schemas/ShoppingListItemSchema';

export class ShoppingListService {
  items: [];
  shoppingListItemSchema: Schema;

  constructor({ shoppingListItemSchema }) {
    this.items = [];
    this.shoppingListItemSchema = shoppingListItemSchema;
  }

  create({ title, completed }): Promise<any> {
    const validationReport = shoppingListItemSchema.validate({
      title,
      completed,
    });

    if (validationReport.error instanceof ValidationError) {
      return Promise.reject(validationReport);
    }
    return Promise.resolve({ id: faker.datatype.uuid(), title, completed });
  }

  findAll(): Promise<any[]> {
    return Promise.resolve([
      {
        id: faker.datatype.uuid(),
        title: faker.lorem.words(1),
        completed: faker.datatype.boolean(),
      },
      {
        id: faker.datatype.uuid(),
        title: faker.lorem.words(3),
        completed: faker.datatype.boolean(),
      },
      {
        id: faker.datatype.uuid(),
        title: faker.lorem.words(2),
        completed: faker.datatype.boolean(),
      },
    ]);
  }
}
