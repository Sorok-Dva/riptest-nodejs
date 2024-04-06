import Joi, { ObjectSchema } from 'joi';
import { UserData, LoginData } from './types';

export const registerSchema: ObjectSchema<UserData> = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  phoneNumber: Joi.string().optional(),
});

export const loginSchema: ObjectSchema<LoginData> = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const validateBody = <T>(schema: ObjectSchema<T>) => {
  return (req: any, res: any, next: any) => {
    const { error } = schema.validate(req.body as T);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    next();
  };
};
