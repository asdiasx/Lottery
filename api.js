import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';

const token = process.env.LOTTERY_API_TOKEN;

async function apiGetDrawings(draw) {
  const res = await axios.get(
    `https://apiloterias.com.br/app/resultado?loteria=lotomania&token=${token}&concurso=${draw}`
  );
  const data = res.data;
  return data;
}

async function apiGetLastResult() {
  const lastResult = await apiGetDrawings();
  return lastResult.numero_concurso;
}

export { apiGetDrawings, apiGetLastResult };
