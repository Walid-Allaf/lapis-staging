import "server-only";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { DatabaseError } from "./errors";

export interface Migration {
  version: number;
  name: string;
  checksum: string;
  text: string;
}
export const migrationDirectory = () => path.join(process.cwd(), "db", "migrations");

// Lexer for safety checks only. SQL files are trusted, reviewed code, not user input.
// It preserves newlines and handles nested comments/escaped SQL strings/identifiers.
export function executableSql(text: string): string {
  let output = "";
  let i = 0;
  while (i < text.length) {
    if (text.startsWith("--", i)) {
      while (i < text.length && text[i] !== "\n") i++;
      continue;
    }
    if (text.startsWith("/*", i)) {
      let depth = 1; i += 2; output += " ";
      while (i < text.length && depth) {
        if (text.startsWith("/*", i)) { depth++; i += 2; }
        else if (text.startsWith("*/", i)) { depth--; i += 2; }
        else { if (text[i] === "\n") output += "\n"; i++; }
      }
      if (depth) throw new DatabaseError("DB_MIGRATION_INVALID");
      continue;
    }
    const quote = text[i];
    if (quote === "'" || quote === '"' || quote === "[") {
      const end = quote === "[" ? "]" : quote;
      let closed = false; i++; output += " ";
      while (i < text.length) {
        if (text[i] === end) {
          if (text[i + 1] === end) { i += 2; continue; }
          i++; closed = true; break;
        }
        if (text[i] === "\n") output += "\n";
        i++;
      }
      if (!closed) throw new DatabaseError("DB_MIGRATION_INVALID");
      continue;
    }
    output += text[i++];
  }
  return output;
}

export function validateMigrationSql(text: string): void {
  const executable = executableSql(text);
  if (!executable.trim() || /^\s*GO(?:\s+\d+)?\s*;?\s*$/im.test(executable) ||
      /\b(?:USE|DROP|TRUNCATE|COMMIT|ROLLBACK|SAVE|EXEC|EXECUTE|RETURN)\b/i.test(executable) ||
      /\bBEGIN\s+(?:DISTRIBUTED\s+)?TRAN(?:SACTION)?\b/i.test(executable) ||
      /\b(?:CREATE|ALTER)\s+(?:DATABASE|LOGIN|SERVER)\b/i.test(executable) ||
      /\bSET\s+(?:IMPLICIT_TRANSACTIONS|XACT_ABORT)\b/i.test(executable) || /^\s*:/m.test(executable)) {
    throw new DatabaseError("DB_MIGRATION_INVALID");
  }
}

export async function loadMigrations(directory = migrationDirectory()): Promise<Migration[]> {
  try {
    // Explicit /api/health tracing includes only db/migrations, not an arbitrary CLI test directory.
    const entries = await readdir(/* turbopackIgnore: true */ directory, { withFileTypes: true });
    const migrations: Migration[] = [];
    for (const entry of entries) {
      if (!entry.name.toLowerCase().endsWith(".sql")) continue;
      if (!entry.isFile() || !/^\d{4}_[a-z0-9_]+\.sql$/.test(entry.name) || entry.name.length > 200) {
        throw new DatabaseError("DB_MIGRATION_INVALID");
      }
      const bytes = await readFile(/* turbopackIgnore: true */ path.join(/* turbopackIgnore: true */ directory, entry.name));
      const text = bytes.toString("utf8");
      validateMigrationSql(text);
      migrations.push({ version: Number(entry.name.slice(0, 4)), name: entry.name,
        checksum: createHash("sha256").update(bytes).digest("hex"), text });
    }
    migrations.sort((a, b) => a.version - b.version);
    if (!migrations.length || migrations.some((migration, index) => migration.version !== index + 1)) {
      throw new DatabaseError("DB_MIGRATION_INVALID");
    }
    return migrations;
  } catch (error) {
    if (error instanceof DatabaseError) throw error;
    throw new DatabaseError("DB_MIGRATION_INVALID");
  }
}
