export const generateBase62Id = (length: number = 6) => {
  const base62Chars =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  let id = '';

  for (let i: number = 0; i < length; i++) {
    const random = Math.floor(Math.random() * 62);

    id = id.concat(base62Chars[random]);
  }

  return id;
};
