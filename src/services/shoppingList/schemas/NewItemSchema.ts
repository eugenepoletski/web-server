import Joi from 'joi';

export const titleSchema = Joi.string().min(2).max(50).required().messages({
  'string.empty': '{#label} is missing',
});

export const completedSchema = Joi.boolean().required();

export const newItemSchema = Joi.object({
  title: Joi.string().min(2).max(50).required().messages({
    'string.empty': '{#label} is missing',
  }),
  completed: Joi.boolean(),
});

export const shoppingListItemSchema = Joi.object({
  title: titleSchema,
  completed: completedSchema,
});
