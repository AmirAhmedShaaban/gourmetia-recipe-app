import { TIMEOUT_SEC } from "./config";

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

export const getJSON = async function (url, errMsg) {
  try {
    const res = await Promise.race([fetch(url), timeout(TIMEOUT_SEC)]);
    const data = await res.json();
    console.log(res, data);

    if (data.categories) return data;
    if (!data.meals || data.meals === "Invalid ID") throw new Error(errMsg);
    return data;
  } catch (err) {
    throw err;
  }
};
