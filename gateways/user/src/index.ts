import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import { UserData, LoginData } from '../../../shared';
import { registerSchema, loginSchema, validateBody } from '../../../shared/src/validation';

const app = express();
const port = 80;

app.use(bodyParser.json());

const userServiceUrl = 'http://user.service.riptest:80';

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
