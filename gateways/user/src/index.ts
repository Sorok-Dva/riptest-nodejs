import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import Joi, { ObjectSchema } from 'joi';

const app = express();
const port = 80;

app.use(bodyParser.json());

const userServiceUrl = 'http://user.service.riptest:80';

interface UserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

interface LoginData {
  email: string;
  password: string;
}

const registerSchema: ObjectSchema<UserData> = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  phoneNumber: Joi.string().optional(),
});

const loginSchema: ObjectSchema<LoginData> = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const validateBody = <T>(schema: ObjectSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body as T);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    next();
  };
};

app.post('/register', validateBody<UserData>(registerSchema), async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phoneNumber } = req.body as UserData;
    
    const response = await axios.post(`${userServiceUrl}/create-user`, {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
    });
    
    if (response.status === 201) {
      res.status(201).json({ message: 'User registered successfully' });
    } else {
      res.status(500).json({ message: 'Failed to register user' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/login', validateBody<LoginData>(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as LoginData;
    
    const response = await axios.post(`${userServiceUrl}/authenticate-user`, {
      email,
      password,
    });
    
    if (response.status === 200 && response.data.userId) {
      res.status(200).json({ userId: response.data.userId });
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Gateway User running on http://localhost:${port}`);
});
