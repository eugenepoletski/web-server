import faker from 'faker';
import { isValidationError } from './isValidationError';

describe('isValidationError', () => {
  it('should recognize validation error object and return "true"', () => {
    const dummyValidationError = {
      error: {
        details: [
          {
            message: faker.lorem.words(
              faker.datatype.number({
                min: 1,
                max: 10,
              }),
            ),
            context: {
              key: faker.datatype.string(),
            },
          },
        ],
      },
    };

    expect(isValidationError(dummyValidationError)).toBe(true);
  });

  it('should return "false" for non validation error', () => {
    const dummyNonValidationError = {
      error: {
        details: [
          {
            message: faker.lorem.words(
              faker.datatype.number({
                min: 1,
                max: 10,
              }),
            ),
            [faker.datatype.string()]: faker.datatype.string(),
          },
        ],
      },
    };

    expect(isValidationError(dummyNonValidationError)).toBe(false);
  });
});
