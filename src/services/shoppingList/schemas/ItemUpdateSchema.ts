import Joi from 'joi';

export const ItemUpdateSchema = Joi.object({
  title: Joi.string().min(2).max(50),
  completed: Joi.boolean(),
});
