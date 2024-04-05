import { Pool } from 'pg';

export const pool = new Pool({
  user: 'postgres',
  host: 'postgres.db.riptest',
  database: 'riptest',
  password: 'postgres',
  port: 5432,
});
