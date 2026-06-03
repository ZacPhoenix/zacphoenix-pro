/** Tiny `--flag value` reader over process.argv (no dependency needed). */
export function getArg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

export function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}
