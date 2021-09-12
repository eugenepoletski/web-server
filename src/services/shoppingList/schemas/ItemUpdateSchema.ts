import Joi from 'joi';

export const itemUpdateSchema = Joi.object({
  title: Joi.string().min(2).max(50),
  completed: Joi.boolean(),
});
