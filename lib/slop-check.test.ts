import { test, expect, describe } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { lintDraft, scanForEmDash } from "./slop-check.ts";

const EM_DASH = String.fromCharCode(0x2014);

describe("lintDraft", () => {
  test("passes a clean direct message", () => {
    const findings = lintDraft("Saw your CI thread. We cut ours to near zero at Linear. Worth 15 minutes Tuesday?");
    expect(findings.emDashes).toBe(0);
    expect(findings.banned).toHaveLength(0);
  });

  test("flags an em dash", () => {
    const findings = lintDraft(`Quick one ${EM_DASH} worth 15 minutes?`);
    expect(findings.emDashes).toBe(1);
  });

  test("flags a banned phrase regardless of case", () => {
    const findings = lintDraft("I Hope This Email Finds You Well. Quick question.");
    expect(findings.banned).toContain("i hope this email finds you well");
  });

  test("warns on more than one link", () => {
    const findings = lintDraft("See https://a.com and https://b.com for details.");
    expect(findings.warnings.some((w) => w.includes("links"))).toBe(true);
  });
});

describe("scanForEmDash", () => {
  test("finds an em dash in a file and reports its line", () => {
    const dir = mkdtempSync(join(tmpdir(), "slop-"));
    const file = join(dir, "bad.md");
    writeFileSync(file, `clean line\nthis one has ${EM_DASH} a dash\n`);
    const hits = scanForEmDash([file]);
    expect(hits).toHaveLength(1);
    expect(hits[0].line).toBe(2);
  });

  test("reports nothing for clean files", () => {
    const dir = mkdtempSync(join(tmpdir(), "slop-"));
    const file = join(dir, "good.md");
    writeFileSync(file, "all clean here\nno dashes at all\n");
    expect(scanForEmDash([file])).toHaveLength(0);
  });
});
