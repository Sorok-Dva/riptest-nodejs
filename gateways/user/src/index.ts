import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import { UserData, LoginData } from './types';
import { registerSchema, loginSchema, validateBody } from './validation';

const app = express();
const port = 80;

app.use(bodyParser.json());

const userServiceUrl = 'http://user.service.riptest:80';
const securityServiceUrl = 'http://security.service.riptest:3001';

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
      const securityResponse = await axios.post(`${securityServiceUrl}/create-token`, {
        userId: response.data.userId
      });
      const { token } = securityResponse.data;
      
      res.status(200).json({ token });
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      res.status(401).json({ message: 'Unauthorized' });
    } else {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
});

app.get('/me', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const securityResponse = await axios.post(`${securityServiceUrl}/authenticate-token`, { token });
    
    if (!securityResponse.data.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const userId = securityResponse.data.userId;
    
    const userResponse = await axios.get(`${userServiceUrl}/users/${userId}`);
    const userData = userResponse.data;
    
    res.status(200).json(userData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Gateway User running on http://localhost:${port}`);
});
