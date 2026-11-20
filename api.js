import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';

// By default the Caixa API is called directly (the app runs on a server in Brazil).
// PROXY_URL (+ PROXY_TOKEN) is optional: use it only when running outside Brazil,
// where the Caixa API blocks foreign IPs.
const CAIXA_API_URL = 'https://servicebus2.caixa.gov.br/portaldeloterias/api';

const proxy_url = process.env.PROXY_URL?.replace(/\/$/, '');
const proxy_token = process.env.PROXY_TOKEN;
const base_url = proxy_url || process.env.CAIXA_API_URL?.replace(/\/$/, '') || CAIXA_API_URL;
const headers = proxy_url ? { 'X-Internal-Token': proxy_token } : { Accept: 'application/json' };
const default_lottery_code = process.env.DEFAULT_LOTTERY_CODE || 'lotomania';

async function apiGetDrawings(draw) {
  const url = draw
    ? `${base_url}/${default_lottery_code}/${draw}`
    : `${base_url}/${default_lottery_code}`;
  const res = await axios.get(url, { headers, timeout: 20000 });
  return res.data;
}

async function apiGetLastResult() {
  const lastResult = await apiGetDrawings();
  return lastResult.numero;
}

export { apiGetDrawings, apiGetLastResult };
