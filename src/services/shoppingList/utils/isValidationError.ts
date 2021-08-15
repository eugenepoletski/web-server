export const isValidationError = (obj: any): boolean => {
  return (
    typeof obj === 'object' &&
    'error' in obj &&
    'details' in obj.error &&
    Array.isArray(obj.error.details) &&
    obj.error.details.every(
      (subObj) =>
        typeof subObj === 'object' &&
        typeof subObj.message === 'string' &&
        typeof subObj.context === 'object',
    )
  );
};
