export class TestUtils {
  static Characters = class {
    public static NUMBERS = '0123456789';
    public static UPPERCASE_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    public static LOWERCASE_LETTERS = 'abcdefghijklmnopqrstuvwxyz';
    public static ALPHANUMERIC =
      this.UPPERCASE_LETTERS + this.LOWERCASE_LETTERS + this.NUMBERS;
  };

  public static randomString(length: number, ...args: string[]): string {
    const characters = (
      args.length
        ? args.reduce((prev, current) => prev + current)
        : this.Characters.ALPHANUMERIC
    )
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');

    return Array(length)
      .fill(0)
      .reduce(
        (prev) =>
          prev +
          characters.charAt(Math.floor(Math.random() * characters.length)),
        '',
      );
  }
}
