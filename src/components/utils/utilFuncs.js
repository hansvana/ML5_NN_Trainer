export function uniqueValues (arr) {
  if (!Array.isArray(arr)) return [];

  const res = [];
  arr.forEach(val => {
    if (!res.includes(val))
      res.push(val);
  });

  return res;
}

export function arrayMin (arr) {
  return Math.min(...arr);
}

export function arrayMax (arr) {
  return Math.max(...arr);
}

export function scale (val, inMin, inMax, outMin, outMax) {
  return (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

export function randomBetween (min, max, isInt = false) {
  const val = Math.random() * (max - min) + min;
  if (isInt) return Math.floor(val);
  return val;
}

export function humanReadable (input) {
  return isNaN(input)
    ? input
    : Number.isInteger(input)
      ? parseInt(input)
      : parseFloat(input).toFixed(2);
}
