import { ValidationError as JoiValidationError } from 'joi';

interface JoiReport {
  error?: JoiValidationError;
}

interface ValidationError {
  errors: {
    [key: string]: {
      message: string;
    };
  };
}

interface ValidationReport {
  error: null | ValidationError;
}

export const buildValidationReport = (
  joiReport: JoiReport,
): ValidationReport => {
  if (!joiReport.error) {
    return { error: null };
  }

  const validationErrors = {};

  joiReport.error.details.forEach(({ message, context: { key } }) => {
    validationErrors[key] = { message };
  });

  return { error: { errors: validationErrors } };
};
