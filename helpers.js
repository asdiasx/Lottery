import { apiGetDrawings, apiGetLastResult } from './api.js';
import { selectDbLastDraw, insertDraw } from './db.js';
const initialDbSync = async () => {
  // sync db with data from api
  const lastResultFromApi = await apiGetLastResult();
  const lastResultFromDb = await selectDbLastDraw();
  if (lastResultFromApi !== lastResultFromDb) {
    for (
      let drawingNumber = lastResultFromDb + 1;
      drawingNumber <= lastResultFromApi;
      drawingNumber++
    ) {
      const resultFromApi = await apiGetDrawings(drawingNumber);

      const { numero_concurso, data_concurso, dezenas } = resultFromApi;

      const groups = calculateGroups(dezenas);
      const numberOfGroups = groups.length;
      const jsonOfGroups = createJsonOfGroups(dezenas);

      await insertDraw({
        drawNumber: numero_concurso,
        drawDate: data_concurso,
        numberOfGroups: numberOfGroups,
        drawingTens: jsonOfGroups,
      });
    }
  }
};

const getGroupFromNumber = (number) => {
  number = number == '00' ? 100 : +number;
  const numberGroup = ~~((number - 1) / 4) + 1;
  return numberGroup;
};

const calculateGroups = (tens) => {
  const groups = tens.reduce((acc, curr) => {
    const group = getGroupFromNumber(curr);
    if (!acc.includes(group)) {
      acc.push(group);
    }
    return acc;
  }, []);
  return groups;
};

const createJsonOfGroups = (tens) => {
  const groups = tens.reduce(
    (acc, curr) => {
      const group = getGroupFromNumber(curr);
      const groupKey = `G${group}`;
      curr = curr == 100 ? '00' : curr.toString();
      acc[groupKey].push(curr.padStart(2, '0'));
      return acc;
    },
    {
      G1: [],
      G2: [],
      G3: [],
      G4: [],
      G5: [],
      G6: [],
      G7: [],
      G8: [],
      G9: [],
      G10: [],
      G11: [],
      G12: [],
      G13: [],
      G14: [],
      G15: [],
      G16: [],
      G17: [],
      G18: [],
      G19: [],
      G20: [],
      G21: [],
      G22: [],
      G23: [],
      G24: [],
      G25: [],
    }
  );
  return JSON.stringify(groups);
};

export { initialDbSync };
