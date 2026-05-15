import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';

const proxy_url = process.env.PROXY_URL?.replace(/\/$/, '');
const proxy_token = process.env.PROXY_TOKEN;
const default_lottery_code = process.env.DEFAULT_LOTTERY_CODE;

async function apiGetDrawings(draw) {
  const url = draw
    ? `${proxy_url}/${default_lottery_code}/${draw}`
    : `${proxy_url}/${default_lottery_code}`;
  const res = await axios.get(url, {
    headers: {
      'X-Internal-Token': proxy_token,
    }
  });
  const data = res.data;
  return data;
}

async function apiGetLastResult() {
  const lastResult = await apiGetDrawings();
  return lastResult.numero;
}

export { apiGetDrawings, apiGetLastResult };
