import Joi from 'joi';
import faker from 'faker';
import { buildValidationReport } from '../../utils';

describe('utils', () => {
  describe('buildValidationReport()', () => {
    it('builds a report for successful validation', () => {
      const dummyJoiSuccessfulValidationReport = Joi.object({
        dummyValidField: Joi.alternatives(
          Joi.string(),
          Joi.number(),
          Joi.bool(),
        ),
      }).validate({
        dummyValidField: faker.random.objectElement(
          {
            [faker.lorem.word()]: faker.datatype.string(),
            [faker.lorem.word()]: faker.datatype.number(),
            [faker.lorem.word()]: faker.datatype.boolean(),
          },
          null,
        ),
      });

      const validationReport = buildValidationReport(
        dummyJoiSuccessfulValidationReport,
      );

      expect(validationReport.error).toBeFalsy();
    });

    it('builds a report for failed validation', () => {
      const dummyFields = {
        dummyValidField: faker.random.objectElement(
          {
            [faker.lorem.word()]: faker.datatype.string(),
            [faker.lorem.word()]: faker.datatype.number(),
            [faker.lorem.word()]: faker.datatype.boolean(),
          },
          null,
        ),
        dummyInvalidField: faker.datatype.boolean(),
      };
      const dummyJoiFailedValidationReport = Joi.object({
        dummyValidField: Joi.alternatives(
          Joi.string(),
          Joi.number(),
          Joi.bool(),
        ),
      }).validate(dummyFields);

      const validationReport = buildValidationReport(
        dummyJoiFailedValidationReport,
      );

      expect(validationReport).toMatchObject({
        error: {
          errors: {
            dummyInvalidField: {
              message: expect.any(String),
            },
          },
        },
      });
      expect(validationReport.error.errors).not.toHaveProperty(
        'dummyValidField',
      );
    });
  });
});
