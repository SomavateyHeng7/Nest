import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const src = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src");

function withExtension(file) {
  for (const candidate of [file, `${file}.ts`, `${file}.tsx`, path.join(file, "index.ts")]) {
    if (path.extname(candidate) && existsSync(candidate)) return candidate;
  }
  return file;
}

export function resolve(specifier, context, next) {
  if (specifier.startsWith("@/")) {
    return next(pathToFileURL(withExtension(path.join(src, specifier.slice(2)))).href, context);
  }
  return next(specifier, context);
}
