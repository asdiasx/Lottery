import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';

const cef_url = process.env.LOTTERY_API_URL;
const default_lottery_code = process.env.DEFAULT_LOTTERY_CODE;

async function apiGetDrawings(draw) {
  const url = draw
    ? `${cef_url}/${default_lottery_code}/${draw}`
    : `${cef_url}/${default_lottery_code}`;
  const res = await axios.get(url);
  const data = res.data;
  return data;
}

async function apiGetLastResult() {
  const lastResult = await apiGetDrawings();
  return lastResult.numero;
}

export { apiGetDrawings, apiGetLastResult };
