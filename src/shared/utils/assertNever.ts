export function assertNever(x: never, message = 'unexpected branch'): never {
  throw new Error(`${message}: ${JSON.stringify(x)}`);
}
