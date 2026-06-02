import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { homedir } from "node:os";

export const MAX_SAMPLES = 50;
export const MAX_AGE_DAYS = 180;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

export type Formality = "casual" | "neutral" | "formal";

export type VoiceFeatures = {
  words: number;
  sentences: number;
  averageSentenceLength: number;
  opener: string;
  contractions: number;
  exclamations: number;
  formalityScore: number;
  formality: Formality;
};

export type VoiceSample = {
  text: string;
  channel: string;
  recordedAt: string;
  features: VoiceFeatures;
};

export type VoiceProfile = {
  version: number;
  samples: VoiceSample[];
};

export function profilePath(): string {
  const override = process.env.OUTREACH_STACK_HOME;
  if (override) return join(override, "voice-profile.json");
  const configBase = process.env.XDG_CONFIG_HOME || join(homedir(), ".config");
  return join(configBase, "outreach-stack", "voice-profile.json");
}

export function loadProfile(path: string): VoiceProfile {
  if (!existsSync(path)) return { version: 1, samples: [] };
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as VoiceProfile;
    if (!Array.isArray(parsed.samples)) return { version: 1, samples: [] };
    return parsed;
  } catch {
    return { version: 1, samples: [] };
  }
}

export function saveProfile(path: string, profile: VoiceProfile): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(profile, null, 2));
}

function splitSentences(text: string): string[] {
  return text
    .split(/[.!?]+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function countWords(text: string): number {
  const matched = text.trim().match(/\S+/g);
  return matched ? matched.length : 0;
}

function detectOpener(text: string): string {
  const firstLine = text.trim().split(/\n/)[0] || "";
  return firstLine.split(/\s+/).slice(0, 5).join(" ");
}

function formalitySignals(text: string, casualPunctuation: number): number {
  const lowered = text.toLowerCase();
  const casualWords = /\b(hey|yo|cheers|gonna|wanna|yeah|thanks|lol|btw)\b/g;
  const formalWords = /\b(dear|sincerely|regards|kindly|hereby|aforementioned)\b/g;
  const casual = casualPunctuation + (lowered.match(casualWords) || []).length + (/\bhi there\b/.test(lowered) ? 1 : 0);
  const formal =
    (lowered.match(formalWords) || []).length +
    (/i am writing to/.test(lowered) ? 1 : 0) +
    (/to whom it may concern/.test(lowered) ? 2 : 0) +
    (/please find/.test(lowered) ? 1 : 0);
  return formal - casual;
}

export function formalityLabel(score: number): Formality {
  if (score >= 1) return "formal";
  if (score <= -1) return "casual";
  return "neutral";
}

export function extractFeatures(text: string): VoiceFeatures {
  const sentences = splitSentences(text);
  const words = countWords(text);
  const sentenceCount = Math.max(sentences.length, 1);
  const contractions = (text.match(/\b\w+'\w+\b/g) || []).length;
  const exclamations = (text.match(/!/g) || []).length;
  const formalityScore = formalitySignals(text, contractions + exclamations);
  return {
    words,
    sentences: sentences.length,
    averageSentenceLength: Math.round((words / sentenceCount) * 10) / 10,
    opener: detectOpener(text),
    contractions,
    exclamations,
    formalityScore,
    formality: formalityLabel(formalityScore),
  };
}

export function prune(samples: VoiceSample[], now: number): VoiceSample[] {
  const fresh = samples.filter((sample) => {
    const age = (now - Date.parse(sample.recordedAt)) / MS_PER_DAY;
    return Number.isFinite(age) ? age <= MAX_AGE_DAYS : true;
  });
  return fresh.slice(-MAX_SAMPLES);
}

export function recencyWeight(recordedAt: string, now: number): number {
  const age = (now - Date.parse(recordedAt)) / MS_PER_DAY;
  if (!Number.isFinite(age) || age < 0) return 1;
  return Math.max(0.2, 1 - age / MAX_AGE_DAYS);
}

function sampleScore(sample: VoiceSample): number {
  if (typeof sample.features.formalityScore === "number") return sample.features.formalityScore;
  if (sample.features.formality === "formal") return 1;
  if (sample.features.formality === "casual") return -1;
  return 0;
}

export type VoiceSummary = {
  samples: number;
  channel: string | null;
  averageSentenceLength: number;
  formality: Formality;
  recentOpeners: string[];
};

export function summarize(profile: VoiceProfile, now: number, channel?: string): VoiceSummary | null {
  const pool = channel ? profile.samples.filter((sample) => sample.channel === channel) : profile.samples;
  if (pool.length === 0) return null;
  let weightTotal = 0;
  let lengthTotal = 0;
  let scoreTotal = 0;
  const openers: string[] = [];
  for (const sample of pool) {
    const weight = recencyWeight(sample.recordedAt, now);
    weightTotal += weight;
    lengthTotal += sample.features.averageSentenceLength * weight;
    scoreTotal += sampleScore(sample) * weight;
    if (sample.features.opener) openers.push(sample.features.opener);
  }
  const meanScore = scoreTotal / weightTotal;
  return {
    samples: pool.length,
    channel: channel ?? null,
    averageSentenceLength: Math.round((lengthTotal / weightTotal) * 10) / 10,
    formality: meanScore >= 0.5 ? "formal" : meanScore <= -0.5 ? "casual" : "neutral",
    recentOpeners: openers.slice(-5),
  };
}

export function renderSummary(summary: VoiceSummary | null): string {
  if (!summary) {
    return "no voice profile yet: write plainly and ask the user to approve messages so the profile can build.";
  }
  return [
    `samples: ${summary.samples}${summary.channel ? ` (channel: ${summary.channel})` : ""}`,
    `average sentence length: ${summary.averageSentenceLength} words`,
    `formality: ${summary.formality}`,
    `recent openers: ${summary.recentOpeners.join(" | ") || "none"}`,
    "match this voice: mirror the sentence length, reuse the same kind of opener, and hold the formality.",
  ].join("\n");
}

export function parseFlags(args: string[]): Record<string, string> {
  const flags: Record<string, string> = {};
  for (let i = 0; i < args.length; i += 1) {
    const token = args[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = args[i + 1];
    if (next && !next.startsWith("--")) {
      flags[key] = next;
      i += 1;
    } else {
      flags[key] = "true";
    }
  }
  return flags;
}

export function flagValue(flags: Record<string, string>, key: string): string | undefined {
  const value = flags[key];
  return value && value !== "true" ? value : undefined;
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
}

function statsText(profile: VoiceProfile, path: string): string {
  if (profile.samples.length === 0) return `no samples yet at ${path}`;
  const byChannel: Record<string, number> = {};
  let oldest = profile.samples[0].recordedAt;
  let newest = profile.samples[0].recordedAt;
  for (const sample of profile.samples) {
    byChannel[sample.channel] = (byChannel[sample.channel] || 0) + 1;
    if (sample.recordedAt < oldest) oldest = sample.recordedAt;
    if (sample.recordedAt > newest) newest = sample.recordedAt;
  }
  const channels = Object.keys(byChannel)
    .sort()
    .map((name) => `  ${name}: ${byChannel[name]}`)
    .join("\n");
  return [`total samples: ${profile.samples.length}`, channels, `oldest: ${oldest}`, `newest: ${newest}`, `path: ${path}`].join("\n");
}

async function main(): Promise<void> {
  const [command, ...rest] = process.argv.slice(2);
  const flags = parseFlags(rest);
  const path = profilePath();
  const now = Date.now();

  if (command === "add") {
    const text = (flagValue(flags, "text") ?? (await readStdin())).trim();
    if (!text) {
      process.stderr.write("nothing to record: pass --text or pipe the message on stdin\n");
      process.exit(1);
    }
    const channel = flagValue(flags, "channel") ?? "unknown";
    const profile = loadProfile(path);
    profile.samples.push({ text, channel, recordedAt: new Date(now).toISOString(), features: extractFeatures(text) });
    profile.samples = prune(profile.samples, now);
    saveProfile(path, profile);
    process.stdout.write(`recorded one ${channel} sample (${profile.samples.length} kept) at ${path}\n`);
    return;
  }

  if (command === "summary") {
    const profile = loadProfile(path);
    const channel = flagValue(flags, "channel");
    const summary = summarize(profile, now, channel);
    if (flags.json === "true") {
      process.stdout.write(JSON.stringify(summary) + "\n");
    } else {
      process.stdout.write(renderSummary(summary) + "\n");
    }
    return;
  }

  if (command === "stats") {
    process.stdout.write(statsText(loadProfile(path), path) + "\n");
    return;
  }

  if (command === "clear") {
    const profile = loadProfile(path);
    const channel = flagValue(flags, "channel");
    const before = profile.samples.length;
    profile.samples = channel ? profile.samples.filter((sample) => sample.channel !== channel) : [];
    saveProfile(path, profile);
    process.stdout.write(`cleared ${before - profile.samples.length} sample(s)${channel ? ` from ${channel}` : ""}\n`);
    return;
  }

  if (command === "path") {
    process.stdout.write(path + "\n");
    return;
  }

  process.stderr.write("usage: voice-profile.ts <add|summary|stats|clear|path> [--channel <name>] [--text <message>] [--json]\n");
  process.exit(1);
}

if (import.meta.main) {
  main();
}
