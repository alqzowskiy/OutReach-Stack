# outreach-stack skills

A deep dive into each skill: what it does, the process it runs, and the constraints it enforces. The whole pack follows one rule borrowed from gstack's process-over-prompt skills: interrogate before you write, respect the channel, and strip anything that reads as machine-written.

## The shared spine

Every writing skill (`cold-email`, `inmail`, `follow-up`) runs the same sequence:

1. **Forcing questions, one at a time.** Never dumped as a list. They pin down the recipient by role, the single ask, the real leverage, whether the contact is warm or cold, and what a "yes" actually looks like (that is the CTA).
2. **One concrete hook.** A specific, verifiable detail about the recipient. `outreach-research` can fill this automatically when a web tool is available.
3. **Load the channel rules** and treat them as hard limits, not suggestions.
4. **Draft one message.**
5. **Self-review against the shared anti-slop checklist.**
6. **Offer two or three strategic variants** that lead to different outcomes, not different tones.
7. **Output** the recommended variant plus alternatives, and optionally record the approved message to voice memory.

The point of the spine is that the quality of an outreach message is set before a single word is written. Vague inputs cannot produce a sharp email, so the skills refuse to skip the interrogation.

### The anti-slop checklist

`shared/anti-slop.md` is the single source of truth, symlinked into each skill so there is one copy and no drift. It flags three families of problems:

- **AI tells**, with the em dash banned first, then the rule-of-three cadence, "not just X but Y" constructions, tell words (delve, leverage, robust, seamless), and hollow openers like "I hope this email finds you well".
- **Fake personalization**: compliments with no specific detail, and merge-field phrasing.
- **Structural sins**: the ask buried at the bottom, more than one CTA, a paragraph about the sender before the point lands, feature dumps, and hedging stacks.

### Voice memory

`lib/voice-profile.ts` is an optional Bun helper that learns the user's voice from approved messages. It exposes three commands:

- `summary [--channel <name>]` prints a compact voice description (sentence length, formality, recent openers) for the skill to match. With no profile it returns a clear "no profile yet" so the skill degrades to plain writing.
- `add --channel <name>` reads a message from stdin or `--text`, extracts features, and appends a sample.
- `stats` prints sample counts per channel and the oldest and newest entries.
- `clear [--channel <name>]` deletes the whole profile, or just one channel's samples, for when you want a clean slate.
- `path` prints the resolved profile location.

Samples decay: the helper keeps the most recent 50, drops anything older than 180 days, and weights recent samples more heavily when summarizing. The profile lives at `${XDG_CONFIG_HOME:-~/.config}/outreach-stack/voice-profile.json` (override with `OUTREACH_STACK_HOME`), is gitignored, and is never transmitted. Recipient details are never written to it.

## cold-email

Cold and warm outbound email. Runs the full spine. Its `references/channels.md` encodes the physical limits: a 3 to 6 word subject, a first line that carries the open (no warm-up), a 50 to 125 word body, exactly one CTA placed in the first third, at most one link, and the difference between a cold first line (earn your place in the inbox) and a warm one (name the connection up front).

## inmail

LinkedIn InMail, connection notes, and DMs. It first asks which of the three surfaces is in play, because the limits differ sharply:

- **Connection note**: about 300 characters, no links, one idea. Its only job is to earn the accept, so it does not pitch. If there is nothing specific to say, no note is a valid choice.
- **InMail**: a short required subject plus a tight body well under the character ceiling, links used sparingly. It costs a credit, so it does not get wasted on a feature dump.
- **DM**: no subject, conversational, ask stated early.

All three are mobile-first and reuse the shared anti-slop checklist, with extra attention to LinkedIn's automated-tool tells.

## follow-up

Follow-ups and break-up messages. It refuses to write until it has seen the prior message, because a follow-up that repeats the first one trains the recipient to ignore you. Its `references/cadence.md` encodes the timing (touch two at 3 to 4 days, touch three about a week later, a break-up at one to two weeks), caps a cold sequence at three or four touches, lists the new angles to rotate through, and bans follow-up-specific slop ("just circling back", "bumping this to the top of your inbox", "per my last email"). The break-up message gets its own treatment: a clean, gracious close that often earns the highest reply rate of the sequence.

## outreach-research

Optional recipient research that surfaces one concrete hook before any message is written. It first checks whether a web search, fetch, or browser tool is available; if none is, it says it is research-blind and hands back rather than inventing details. When it can research, it looks for the recipient's real role, recent public activity, and company trigger events, then returns exactly one hook with its source. Its `references/playbook.md` defines what counts as a usable hook and the red lines: no fabrication, no sensitive or personal information, and nothing written to disk. Research stays in the conversation.

## Install and layout

`setup` symlinks every folder that contains a `SKILL.md` into `~/.claude/skills/` (override with `CLAUDE_SKILLS_HOME`), so a later `git pull` updates the skills with no reinstall. It is idempotent and refuses to clobber a real file or directory that already occupies a skill name.

Shared files (the anti-slop checklist, the voice helper) live once in `shared/` and `lib/` and are reached through in-repo relative symlinks inside each skill. Because the symlinks are relative, they resolve inside the repository even after the skill folder itself is symlinked into `~/.claude/skills/`, which is what keeps a single source of truth working across the install boundary.

## Quality gates

`lib/slop-check.ts` is a deterministic backstop to the anti-slop pass. In repo mode (`bun lib/slop-check.ts`) it fails if an em dash appears in any prose file, which is what lets the no-em-dash rule survive future edits. In draft mode (`bun lib/slop-check.ts --stdin`) it lints a pasted message for em dashes, banned phrases, and structural smells, so the writing skills can run a draft through it as a mechanical check.

`bun test` covers the voice helper (feature extraction, decay, summary, the CLI round-trip) and the linter. GitHub Actions runs the installer syntax check, the repo slop check, and the tests on every push and pull request.

