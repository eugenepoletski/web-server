import { v4 as uuidv4 } from 'uuid';
import { newItemSchema, itemUpdateSchema } from './schemas';
import { buildValidationReport } from './utils';

interface ValidationError extends Error {
  errors: {
    [key: string]: {
      message: string;
    };
  };
}

class ValidationError extends Error implements ValidationError {
  constructor(errors, ...params) {
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }

    this.name = 'ValidationError';
    this.errors = errors;
  }
}
type ItemTitle = string;
type ItemCompleted = boolean;

interface Item {
  id: string;
  title: ItemTitle;
  completed: ItemCompleted;
}

interface NewItemInfo {
  title: ItemTitle;
  completed?: ItemCompleted;
}

interface ItemUpdateInfo {
  title?: ItemTitle;
  completed?: ItemCompleted;
}

interface ValidationReport {
  error: {
    errors: {
      [key: string]: {
        message: string;
      };
    };
  };
}

export class ShoppingListService {
  private items: Item[];

  constructor() {
    this.items = [];
  }

  public createItem(itemInfo: {
    title: string;
    completed: boolean;
  }): Promise<Item> {
    const validationReport = this.validateNewItem({
      title: itemInfo.title,
      completed: itemInfo.completed,
    });

    if (validationReport.error) {
      return Promise.reject(new ValidationError(validationReport.error.errors));
    }

    const item = {
      id: uuidv4(),
      title: itemInfo.title,
      completed: itemInfo.completed,
    };

    this.items.push(item);

    return Promise.resolve(item);
  }

  public findItemById(id: string): Promise<Item> {
    return Promise.resolve(this.items.find((item) => item.id === id));
  }

  public findAll(): Promise<Item[]> {
    return Promise.resolve(this.items);
  }

  public async updateItem(
    id: string,
    itemUpdate: ItemUpdateInfo,
  ): Promise<Item> {
    const storedItem = await this.findItemById(id);
    const updatedItem = { ...storedItem, ...itemUpdate };

    const nextItems = this.items.map((item) => {
      if (item.id !== id) {
        return item;
      }

      return updatedItem;
    });
    this.items = nextItems;
    return Promise.resolve(updatedItem);
  }

  public validateNewItem(newItemInfo: NewItemInfo): ValidationReport {
    const result = newItemSchema.validate(newItemInfo);
    return buildValidationReport(result);
  }

  public validateItemUpdate(itemUpdateInfo: ItemUpdateInfo): ValidationReport {
    const result = itemUpdateSchema.validate(itemUpdateInfo);
    return buildValidationReport(result);
  }
}
