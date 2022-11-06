/**
 * localStroage
 */
export function setLocal(key, value) {
  if (typeof value === 'object') {
    value = JSON.stringify(value);
  }

  localStorage.setItem(key, value);
}

export function getLocal(key) {
  let value = localStorage.getItem(key);

  if (typeof value === 'string') {
    value = JSON.parse(value);
  }

  return value;
}
