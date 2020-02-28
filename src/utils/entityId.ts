export type EntityId = {
  prefix: string;
  id: string;
  key: string;
};

export const generateEntityId = (prefix: string, length: number = 6) => {
  const base62Chars =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  let id = '';

  for (let i: number = 0; i < length; i++) {
    const random = Math.floor(Math.random() * 62);

    id = id.concat(base62Chars[random]);
  }

  const entityId: EntityId = {
    prefix: prefix,
    id: id,
    key: `${prefix}:${id}`
  };

  return entityId;
};

export const getEntityIdfromID = (prefix: string, id: string) => {
  return {
    prefix,
    id,
    key: `${prefix}:${id}`
  } as EntityId;
};

export const getEntityIdfromKey = (key: string) => {
  const [prefix, id] = key.split(':');

  return {
    prefix,
    id,
    key
  } as EntityId;
};
