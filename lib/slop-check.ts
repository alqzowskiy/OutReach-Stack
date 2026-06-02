import { readFileSync, readdirSync, lstatSync } from "node:fs";
import { join } from "node:path";

const EM_DASH = String.fromCharCode(0x2014);
const EN_DASH = String.fromCharCode(0x2013);
const EN_DASH_SEPARATOR = new RegExp(`\\s${EN_DASH}\\s`, "g");

export const BANNED_PHRASES = [
  "i hope this email finds you well",
  "i hope this finds you well",
  "i came across your profile",
  "i wanted to reach out",
  "just circling back",
  "circling back",
  "touching base",
  "touch base",
  "per my last email",
  "to whom it may concern",
  "let me know your thoughts",
  "i'd love to add you to my professional network",
  "explore synergies",
  "synergy",
  "leverage",
  "robust",
  "seamless",
  "cutting-edge",
  "game-changer",
  "game changer",
  "unlock",
  "elevate",
  "delve",
  "in today's",
  "fast-paced",
  "best-in-class",
  "move the needle",
  "low-hanging fruit",
];

export type DraftFindings = {
  emDashes: number;
  enDashes: number;
  banned: string[];
  warnings: string[];
};

export function lintDraft(text: string): DraftFindings {
  const lowered = text.toLowerCase();
  const banned = BANNED_PHRASES.filter((phrase) => lowered.includes(phrase));
  const warnings: string[] = [];

  const links = text.match(/https?:\/\/\S+/g) || [];
  if (links.length > 1) warnings.push(`${links.length} links (one at most on a cold message)`);

  const exclamations = (text.match(/!/g) || []).length;
  if (exclamations > 1) warnings.push(`${exclamations} exclamation marks`);

  const shouty = text.match(/\b[A-Z]{4,}\b/g) || [];
  if (shouty.length > 0) warnings.push(`all-caps words: ${shouty.join(", ")}`);

  return {
    emDashes: text.split(EM_DASH).length - 1,
    enDashes: (text.match(EN_DASH_SEPARATOR) || []).length,
    banned,
    warnings,
  };
}

export type RepoHit = { file: string; line: number; text: string };

const SKIP_DIRS = new Set([".git", "node_modules", "dist", "plans"]);

function collectMarkdown(root: string, skipBasenames: string[]): string[] {
  const found: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      if (SKIP_DIRS.has(entry)) continue;
      const full = join(dir, entry);
      const stat = lstatSync(full);
      if (stat.isSymbolicLink()) continue;
      if (stat.isDirectory()) {
        walk(full);
      } else if (entry.endsWith(".md") && !skipBasenames.includes(entry)) {
        found.push(full);
      }
    }
  };
  walk(root);
  return found;
}

export function scanForEmDash(files: string[]): RepoHit[] {
  const hits: RepoHit[] = [];
  for (const file of files) {
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, index) => {
      if (line.includes(EM_DASH)) hits.push({ file, line: index + 1, text: line.trim() });
    });
  }
  return hits;
}

function runDraft(text: string): number {
  const findings = lintDraft(text);
  let failed = false;
  if (findings.emDashes > 0) {
    process.stdout.write(`SLOP: ${findings.emDashes} em dash(es). Replace with a comma, colon, or two sentences.\n`);
    failed = true;
  }
  if (findings.enDashes > 0) {
    process.stdout.write(`SLOP: ${findings.enDashes} en dash(es) used as a separator.\n`);
    failed = true;
  }
  for (const phrase of findings.banned) {
    process.stdout.write(`SLOP: banned phrase "${phrase}".\n`);
    failed = true;
  }
  for (const warning of findings.warnings) {
    process.stdout.write(`warn: ${warning}.\n`);
  }
  process.stdout.write(failed ? "FAIL\n" : "PASS\n");
  return failed ? 1 : 0;
}

function runRepo(files: string[]): number {
  const hits = scanForEmDash(files);
  for (const hit of hits) {
    process.stdout.write(`${hit.file}:${hit.line}: ${hit.text}\n`);
  }
  if (hits.length > 0) {
    process.stdout.write(`FAIL: ${hits.length} em dash(es) in repo prose\n`);
    return 1;
  }
  process.stdout.write("PASS: no em dashes in repo prose\n");
  return 0;
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.includes("--stdin")) {
    process.exit(runDraft((await readStdin()).trim()));
  }
  const fileArgs = args.filter((arg) => !arg.startsWith("--"));
  const repoRoot = join(import.meta.dir, "..");
  const files = fileArgs.length > 0 ? fileArgs : collectMarkdown(repoRoot, ["starthere.md"]);
  process.exit(runRepo(files));
}

if (import.meta.main) {
  main();
}
