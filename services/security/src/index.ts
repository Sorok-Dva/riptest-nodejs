import express from 'express';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../../../shared/src/db';

const app = express();
const port = 3001;

app.use(bodyParser.json());

app.post('/create-token', async (req, res) => {
  const { userId }: { userId: string } = req.body;
  const token = uuidv4();
  
  try {
    const client = await pool.connect();
    await client.query('INSERT INTO tokens (user_id, token) VALUES ($1, $2)', [userId, token]);
    client.release();
    
    res.status(201).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/authenticate-token', async (req, res) => {
  const { token }: { token: string } = req.body;
  
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT user_id FROM tokens WHERE token = $1', [token]);
    client.release();
    
    if (result.rows.length > 0) {
      const userId = result.rows[0].user_id;
      res.status(200).json({ userId });
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`MS Security running on http://localhost:${port}`);
});
