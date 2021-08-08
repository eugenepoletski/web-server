import { ValidationError } from 'joi';

export function isValidationError(obj: any): obj is ValidationError {
  return 'error' in obj;
}
