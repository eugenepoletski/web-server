import Joi from 'joi';

export const newItemSchema = Joi.object({
  title: Joi.string().min(2).max(50).required().messages({
    'string.empty': '{#label} is missing',
  }),
  completed: Joi.boolean(),
});
