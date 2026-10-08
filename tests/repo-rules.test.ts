import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { describe, it } from "node:test";
import ts from "typescript";

// npm runs tests from the repo root.
const ROOT = process.cwd();
const SKIP_DIRS = new Set([".git", ".next", "node_modules", "out", "build", "coverage", ".vercel"]);
const SKIP_FILES = new Set(["package-lock.json", "next-env.d.ts"]);
const BINARY_EXTENSIONS = new Set([".ico", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif", ".woff", ".woff2", ".ttf", ".pdf"]);
const CODE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".mts", ".cts"]);

// Never read real secrets (.env, .env.local) or OS metadata files.
function isLocalOnly(name: string): boolean {
  return name === ".DS_Store" || name === "Icon\r" || (name.startsWith(".env") && name !== ".env.example");
}

function listFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) files.push(...listFiles(join(dir, entry.name)));
    } else if (entry.isFile() && !SKIP_FILES.has(entry.name) && !isLocalOnly(entry.name)) {
      files.push(join(dir, entry.name));
    }
  }
  return files;
}

const repoFiles = listFiles(ROOT).filter((file) => !BINARY_EXTENSIONS.has(extname(file)));

describe("import boundary", () => {
  // Each SDK may only be loaded at runtime by its guarded module. Type-only imports are fine.
  const BOUNDARIES: Record<string, string> = {
    "contentful-management": "src/lib/contentful/management.ts",
    "contentful-migration": "src/lib/contentful/migration-runner.ts",
  };

  function runtimeImportsOfRestricted(file: string, RESTRICTED: string): number {
    const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
    let count = 0;
    const visit = (node: ts.Node) => {
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier) && node.moduleSpecifier.text === RESTRICTED) {
        const clause = node.importClause;
        const typeOnly =
          clause !== undefined &&
          (clause.isTypeOnly ||
            (clause.name === undefined &&
              clause.namedBindings !== undefined &&
              ts.isNamedImports(clause.namedBindings) &&
              clause.namedBindings.elements.every((element) => element.isTypeOnly)));
        if (!typeOnly) count++;
      }
      if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier) && node.moduleSpecifier.text === RESTRICTED && !node.isTypeOnly) {
        count++;
      }
      if (
        ts.isCallExpression(node) &&
        (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
          (ts.isIdentifier(node.expression) && node.expression.text === "require")) &&
        node.arguments.some((argument) => ts.isStringLiteral(argument) && argument.text === RESTRICTED)
      ) {
        count++;
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
    return count;
  }

  const appCode = repoFiles.filter((file) => {
    const path = relative(ROOT, file);
    return CODE_EXTENSIONS.has(extname(file)) && /^(src|scripts|migrations)\//.test(path);
  });

  for (const [restricted, allowed] of Object.entries(BOUNDARIES)) {
    it(`${restricted} is only loaded by ${allowed}`, () => {
      const offenders = appCode
        .filter((file) => relative(ROOT, file) !== allowed)
        .filter((file) => runtimeImportsOfRestricted(file, restricted) > 0)
        .map((file) => relative(ROOT, file));
      assert.deepEqual(offenders, []);
    });

    it(`${allowed} is found by the scan`, () => {
      const allowedFile = repoFiles.find((file) => relative(ROOT, file) === allowed);
      assert.ok(allowedFile && runtimeImportsOfRestricted(allowedFile, restricted) > 0);
    });
  }
});

describe("copy rules", () => {
  it("no em dashes anywhere in the repo", () => {
    const EM_DASH = String.fromCharCode(0x2014);
    const hits: string[] = [];
    for (const file of repoFiles) {
      readFileSync(file, "utf8")
        .split("\n")
        .forEach((line, index) => {
          if (line.includes(EM_DASH)) hits.push(`${relative(ROOT, file)}:${index + 1}`);
        });
    }
    assert.deepEqual(hits, [], "Use hyphens instead of em dashes.");
  });
});
