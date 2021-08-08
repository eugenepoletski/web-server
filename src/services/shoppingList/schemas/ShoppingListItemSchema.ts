import Joi from 'joi';

export const shoppingListItemSchema = Joi.object({
  title: Joi.string().min(3).max(50).required().messages({
    'string.empty': '{#label} is missing',
  }),
  completed: Joi.boolean().required(),
});
