export default class UniqueId {
  private static base62Chars =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  readonly prefix: string;
  readonly length: number;

  constructor(prefix: string, length: number = 6) {
    this.prefix = prefix;
    this.length = length;
  }

  private base62Id = () => {
    let id = '';

    for (let i: number = 0; i < this.length; i++) {
      const random = Math.floor(Math.random() * 62);

      id = id.concat(UniqueId.base62Chars[random]);
    }

    return id;
  };

  public readonly id = this.base62Id();
  public readonly key = `${this.prefix}:${this.id}`;

  static getKeyFromId = (prefix: string, id: string) => `${prefix}:${id}`;
}
