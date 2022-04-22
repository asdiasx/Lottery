import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';
const { Pool } = pg;
async function connect() {
  if (global.connection) return global.connection.connect();

  const pool = new Pool({
    connectionString: process.env.DB_CONNECTION_STRING,
  });

  global.connection = pool;
  return pool.connect();
}

async function selectDraws(quantity) {
  const limitRows = quantity == undefined ? '' : `LIMIT ${quantity}`;
  const client = await connect();
  const res = await client.query(
    `SELECT 
    id, 
    draw_number, 
    to_char(draw_date, 'DD/MM/YY') as draw_date, 
    number_of_groups, 
    drawing_tens
    FROM lotomania ORDER BY draw_number DESC ${limitRows}`
  );
  client.release();
  return res.rows;
}

async function insertDraw(draw) {
  const client = await connect();
  const sql =
    'INSERT INTO lotomania(draw_number,draw_date,number_of_groups,drawing_tens) VALUES ($1,$2,$3,$4);';
  const values = [
    draw.drawNumber,
    draw.drawDate,
    draw.numberOfGroups,
    draw.drawingTens,
  ];
  const res = await client.query(sql, values);
  client.release();
  return res;
}

async function selectDbLastDraw() {
  const client = await connect();
  const res = await client.query(
    'SELECT draw_number FROM lotomania ORDER BY draw_number DESC LIMIT 1'
  );
  client.release();
  let numberOfLastDraw = res.rows[0]?.draw_number || 2205;
  return numberOfLastDraw;
}
export { selectDraws, insertDraw, selectDbLastDraw };
