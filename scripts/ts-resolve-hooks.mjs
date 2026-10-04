// Test-only resolver: maps "@/" and extensionless relative imports to .ts files.
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve as resolvePath } from "node:path";

const srcRoot = resolvePath(import.meta.dirname, "../src");

export function resolve(specifier, context, nextResolve) {
  let base;
  if (specifier.startsWith("@/")) base = resolvePath(srcRoot, specifier.slice(2));
  else if (specifier.startsWith(".") && context.parentURL?.startsWith("file:")) {
    base = resolvePath(dirname(fileURLToPath(context.parentURL)), specifier);
  }
  if (base && !/\.\w+$/.test(base) && existsSync(`${base}.ts`)) {
    return nextResolve(pathToFileURL(`${base}.ts`).href, context);
  }
  if (specifier === "next/server") return nextResolve("next/server.js", context);
  return nextResolve(specifier, context);
}
