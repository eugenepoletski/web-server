import faker from 'faker';
import { Schema } from 'joi';
import { shoppingListItemSchema } from '../schemas/ShoppingListItemSchema';
import { isValidationError } from '../utils';

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

    if (this.isValidationError(validationReport)) {
      return Promise.reject(validationReport);
    }
    return Promise.resolve({ id: faker.datatype.uuid(), title, completed });
  }

  findAll(): Promise<any[]> {
    return Promise.resolve([
      {
        id: faker.datatype.uuid(),
        title: faker.lorem.words(3),
        completed: faker.datatype.boolean(),
      },
      {
        id: faker.datatype.uuid(),
        title: faker.lorem.words(3),
        completed: faker.datatype.boolean(),
      },
      {
        id: faker.datatype.uuid(),
        title: faker.lorem.words(3),
        completed: faker.datatype.boolean(),
      },
    ]);
  }

  public isValidationError(obj: any): boolean {
    return isValidationError(obj);
  }
}
