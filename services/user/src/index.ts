import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import { pool, QueryResult } from './db';
import { UserData, LoginData, ExtendedUserData } from './types'
import { registerSchema, loginSchema } from './validation';

const app = express();
const port = 80;

app.use(bodyParser.json());

app.post('/create-user', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phoneNumber }: UserData = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const { error } = registerSchema.validate({ email, password, firstName, lastName, phoneNumber });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    
    const result: QueryResult = await pool.query(
      'INSERT INTO users (email, password, first_name, last_name, phone_number) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [email, hashedPassword, firstName, lastName, phoneNumber ?? 'NULL']
    );
    
    const userId = result.rows[0].id;
    res.status(201).json({ message: 'User created successfully', userId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/authenticate-user', async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginData = req.body;
    
    const { error } = loginSchema.validate({ email, password });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    client.release();
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (isValidPassword) {
        res.status(200).json({ userId: user.id });
      } else {
        res.status(401).json({ message: 'Unauthorized' });
      }
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = result.rows[0];
    const userData: ExtendedUserData = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phoneNumber: user.phone_number,
    };
    
    res.status(200).json(userData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`MS User running on http://localhost:${port}`);
});
