export {};

declare global {
  interface ObjectConstructor {
    entries(value: Record<string, number[]>): Array<[string, number[]]>;
  }
}
