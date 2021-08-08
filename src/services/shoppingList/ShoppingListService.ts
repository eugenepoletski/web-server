import { v4 as uuidv4 } from 'uuid';
import { Schema } from 'joi';
import { isValidationError } from './utils';

interface ShoppingListItem {
  id: string;
  title: string;
  completed: boolean;
}

export class ShoppingListService {
  private items: ShoppingListItem[];
  private shoppingListItemSchema: Schema;

  constructor({ shoppingListItemSchema }) {
    this.items = [];
    this.shoppingListItemSchema = shoppingListItemSchema;
  }

  public start(cb: () => void): void {
    cb();
  }

  public stop(cb: () => void): void {
    cb();
  }

  public create(itemInfo: {
    title: string;
    completed: boolean;
  }): Promise<ShoppingListItem> {
    const validationReport = this.shoppingListItemSchema.validate({
      title: itemInfo.title,
      completed: itemInfo.completed,
    });

    if (this.isValidationError(validationReport)) {
      return Promise.reject(validationReport);
    }

    const item = {
      id: uuidv4(),
      title: itemInfo.title,
      completed: itemInfo.completed,
    };

    this.items.push(item);

    return Promise.resolve(item);
  }

  public findById(id: string): Promise<ShoppingListItem> {
    return Promise.resolve(this.items.find((item) => item.id === id));
  }

  public findAll(): Promise<ShoppingListItem[]> {
    return Promise.resolve(this.items);
  }

  public isValidationError(obj: any): boolean {
    return isValidationError(obj);
  }
}
