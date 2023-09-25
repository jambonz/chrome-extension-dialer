// window ID
const windowIdKey = "windowIdKey";

export const saveWindowIdKey = (id: number) => {
  localStorage.setItem(windowIdKey, id.toString());
};

export const getWindowIdKey = (): number => {
  const str = localStorage.getItem(windowIdKey);
  if (str) {
    return Number(str);
  }
  return -1;
};

export const deleteWindowIdKey = () => {
  localStorage.removeItem(windowIdKey);
};
