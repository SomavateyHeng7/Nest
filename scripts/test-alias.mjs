// Lets `node --test` resolve the app's "@/…" imports (see tsconfig paths) and
// extensionless .ts/.tsx files. Test-only; the app itself is built by Next.js.
import { register } from "node:module";

register("./test-alias-hooks.mjs", import.meta.url);
