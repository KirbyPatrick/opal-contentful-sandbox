/**
 * Type-checks one seed file with the project's compiler options, without
 * checking the rest of the repo. Used while brand files are written in parallel.
 *
 *   node scripts/seed-typecheck.mjs seed/brands/lumenwork.ts
 */
import ts from "typescript";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/seed-typecheck.mjs <file>");
  process.exit(2);
}
const config = ts.getParsedCommandLineOfConfigFile("tsconfig.json", {}, { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => {} });
const program = ts.createProgram([file], { ...config.options, noEmit: true, incremental: false });
const diagnostics = ts.getPreEmitDiagnostics(program).filter((d) => !d.file || d.file.fileName.includes("/seed/"));
for (const d of diagnostics) {
  const where = d.file ? `${d.file.fileName.split("/seed/")[1] ?? d.file.fileName}:${d.file.getLineAndCharacterOfPosition(d.start ?? 0).line + 1}` : "";
  console.log(`${where} ${ts.flattenDiagnosticMessageText(d.messageText, "\n")}`);
}
console.log(diagnostics.length ? `${diagnostics.length} type errors.` : "No type errors.");
process.exitCode = diagnostics.length ? 1 : 0;
