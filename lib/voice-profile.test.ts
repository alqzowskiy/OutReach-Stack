import { test, expect, describe } from "bun:test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  extractFeatures,
  prune,
  recencyWeight,
  summarize,
  parseFlags,
  flagValue,
  formalityLabel,
  saveProfile,
  loadProfile,
  MAX_SAMPLES,
  type VoiceSample,
} from "./voice-profile.ts";

const REFERENCE_NOW = Date.parse("2026-06-02T00:00:00.000Z");
const MS_PER_DAY = 1000 * 60 * 60 * 24;

function daysAgo(days: number): string {
  return new Date(REFERENCE_NOW - days * MS_PER_DAY).toISOString();
}

function sample(overrides: Partial<VoiceSample> & { text: string }): VoiceSample {
  return {
    channel: "cold-email",
    recordedAt: daysAgo(1),
    features: extractFeatures(overrides.text),
    ...overrides,
  };
}

describe("extractFeatures", () => {
  test("counts words and sentences and averages them", () => {
    const features = extractFeatures("Hi there. Quick one.");
    expect(features.words).toBe(4);
    expect(features.sentences).toBe(2);
    expect(features.averageSentenceLength).toBe(2);
  });

  test("scores a casual message as casual", () => {
    const features = extractFeatures("Hey, gonna keep this short. Wanna grab 15?");
    expect(features.formality).toBe("casual");
    expect(features.formalityScore).toBeLessThan(0);
  });

  test("scores a formal message as formal", () => {
    const features = extractFeatures("Dear Dr. Lee, I am writing to request a meeting. Kindly advise. Regards.");
    expect(features.formality).toBe("formal");
    expect(features.formalityScore).toBeGreaterThan(0);
  });

  test("opener is the first five words of the first line", () => {
    expect(extractFeatures("Saw your talk on flaky tests yesterday").opener).toBe("Saw your talk on flaky");
  });
});

describe("formalityLabel", () => {
  test("maps scores to labels with a neutral band", () => {
    expect(formalityLabel(2)).toBe("formal");
    expect(formalityLabel(-2)).toBe("casual");
    expect(formalityLabel(0)).toBe("neutral");
  });
});

describe("prune", () => {
  test("drops samples older than the decay window", () => {
    const samples = [sample({ text: "fresh one", recordedAt: daysAgo(1) }), sample({ text: "stale one", recordedAt: daysAgo(200) })];
    const kept = prune(samples, REFERENCE_NOW);
    expect(kept).toHaveLength(1);
    expect(kept[0].text).toBe("fresh one");
  });

  test("caps the sample count and keeps the most recent", () => {
    const samples = Array.from({ length: 60 }, (_, index) => sample({ text: `m${index}`, recordedAt: daysAgo(1) }));
    const kept = prune(samples, REFERENCE_NOW);
    expect(kept).toHaveLength(MAX_SAMPLES);
    expect(kept[0].text).toBe("m10");
    expect(kept[kept.length - 1].text).toBe("m59");
  });
});

describe("recencyWeight", () => {
  test("is 1 for a brand new sample and floors at 0.2 for an ancient one", () => {
    expect(recencyWeight(daysAgo(0), REFERENCE_NOW)).toBeCloseTo(1, 5);
    expect(recencyWeight(daysAgo(400), REFERENCE_NOW)).toBeCloseTo(0.2, 5);
    expect(recencyWeight(daysAgo(90), REFERENCE_NOW)).toBeCloseTo(0.5, 5);
  });
});

describe("summarize", () => {
  test("returns null with no samples", () => {
    expect(summarize({ version: 1, samples: [] }, REFERENCE_NOW)).toBeNull();
  });

  test("filters by channel", () => {
    const profile = {
      version: 1,
      samples: [sample({ text: "one", channel: "cold-email" }), sample({ text: "two", channel: "inmail" })],
    };
    expect(summarize(profile, REFERENCE_NOW, "inmail")?.samples).toBe(1);
  });

  test("reflects the dominant formality", () => {
    const profile = {
      version: 1,
      samples: [
        sample({ text: "Hey, quick one. Wanna chat?" }),
        sample({ text: "Hey there, gonna keep it short." }),
        sample({ text: "Yo, grab 15?" }),
        sample({ text: "Dear Sir, I am writing to you. Regards." }),
      ],
    };
    expect(summarize(profile, REFERENCE_NOW)?.formality).toBe("casual");
  });
});

describe("save and load roundtrip", () => {
  test("persists and restores samples", () => {
    const dir = mkdtempSync(join(tmpdir(), "vp-roundtrip-"));
    const path = join(dir, "voice-profile.json");
    const profile = { version: 1, samples: [sample({ text: "persist me" })] };
    saveProfile(path, profile);
    expect(loadProfile(path).samples[0].text).toBe("persist me");
  });

  test("returns an empty profile for a missing file", () => {
    expect(loadProfile(join(tmpdir(), "does-not-exist-voice-profile.json")).samples).toHaveLength(0);
  });
});

describe("parseFlags", () => {
  test("parses valued flags and bare boolean flags", () => {
    const flags = parseFlags(["--channel", "cold-email", "--json"]);
    expect(flagValue(flags, "channel")).toBe("cold-email");
    expect(flags.json).toBe("true");
    expect(flagValue(flags, "json")).toBeUndefined();
  });
});

describe("cli", () => {
  test("records over stdin and reports it in the json summary", async () => {
    const dir = mkdtempSync(join(tmpdir(), "vp-cli-"));
    const env = { ...process.env, OUTREACH_STACK_HOME: dir };
    const script = join(import.meta.dir, "voice-profile.ts");

    const add = Bun.spawn(["bun", script, "add", "--channel", "cold-email"], { env, stdin: "pipe", stdout: "pipe" });
    add.stdin.write("Hey, saw your CI thread. Worth 15 minutes Tuesday?");
    add.stdin.end();
    await add.exited;
    expect(add.exitCode).toBe(0);

    const summary = Bun.spawn(["bun", script, "summary", "--channel", "cold-email", "--json"], { env, stdout: "pipe" });
    await summary.exited;
    const parsed = JSON.parse(await new Response(summary.stdout).text());
    expect(parsed.samples).toBe(1);
    expect(parsed.channel).toBe("cold-email");
  });
});
