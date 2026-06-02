# outreach-stack

[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg)](LICENSE)

> Most cold outreach is "I hope this email finds you well" and a wall of features. The recipient deletes it in two seconds. outreach-stack writes the other kind.

I got tired of asking an AI to "write a cold email" and getting back something that screams a bot wrote it: the dead opener, the feature dump, the ask buried at the bottom, and an em dash in every other sentence. So I built the opposite.

**outreach-stack turns Claude Code into a disciplined outbound writer.** It interrogates you before it writes a single word, respects the physical limits of every channel (subject lines, word counts, character caps, one ask), offers strategic variants that lead to different outcomes instead of different adjectives, and strips every tell that makes a message read as generated. Four skills, one shared anti-slop checklist, local voice memory, and a linter that fails the build if a single em dash sneaks in. All Markdown, all free, MIT license.

This is the difference between a copilot and a closer. A copilot autocompletes your slop faster. outreach-stack refuses to write the slop in the first place.

Fork it. Improve it. Make it yours.

**Who this is for:**
- **Founders and salespeople** running real outbound who are sick of template-grade email
- **Job seekers** cold-emailing hiring managers and asking for intros
- **Anyone on LinkedIn** who has ever sent "I'd love to add you to my professional network"
- **Claude Code users** who want a process instead of a blank prompt

## Quick start

1. Install (30 seconds, see below).
2. Type `write a cold email to <person, by role> asking for <one thing>`.
3. Answer the five forcing questions it asks you, one at a time.
4. Pick one of the strategic variants it hands back.
5. Send something a human would actually reply to.

## Install

**Requirements:** [Claude Code](https://claude.com/claude-code). [Bun](https://bun.sh) is optional and only powers voice memory and the draft linter; the writing skills need no Bun, no API key, and no paid service.

```sh
git clone https://github.com/alqzowskiy/outreach-stack && cd outreach-stack && ./setup
```

`setup` symlinks each skill into `~/.claude/skills/`, so a later `git pull` updates everything with no reinstall. It is safe to re-run.

```sh
./setup --list       # see what is installed
./setup --uninstall  # remove the symlinks
```

Set `CLAUDE_SKILLS_HOME` to install somewhere other than `~/.claude/skills`.

## See it work

```
you:        write a cold email to a VP of Eng about our CI tool

cold-email: Before I draft anything, five questions. One at a time.
            Who exactly, and what do they own?

you:        Priya, VP Eng at a Series B. She owns developer experience.

cold-email: What is the single ask?

you:        A 15 minute call.

cold-email: What is your real leverage? A shared contact, a number,
            a result, or a pain specific to her?

you:        We cut flaky CI from a day a week to near zero at Linear.

cold-email: Cold or warm, and what does "yes" look like?

you:        Cold. Yes means she replies with a time.

cold-email: One hook. Anything specific she said or shipped?

you:        She posted about losing a day a week to flaky CI.

cold-email: Recommended draft below, then two alternatives.
            [drafts a 90-word email, runs the anti-slop pass, zero em dashes]
            A: direct ask  ·  B: value first  ·  C: route through a mutual
```

It asked who she is, not what your product does. Five questions, then a tight email and three approaches that lead to different outcomes. That is not autocomplete. That is an outbound writer.

## Before / after

Same goal both times: a founder asking a VP of Engineering for 15 minutes.

**Before** (a plain "write me a cold email" prompt):

> **Subject:** Revolutionizing Your Development Workflow
>
> Dear Sir/Madam,
>
> I hope this email finds you well. My name is Alex and I am the founder and CEO of FlowCI, a cutting-edge platform that leverages AI to deliver robust, seamless, and scalable CI/CD pipelines for modern engineering teams.
>
> In today's fast-paced development landscape, teams are constantly looking to unlock new efficiencies. Our solution offers automated testing, intelligent caching, and real-time analytics that can transform the way your team ships software.
>
> I would love to hop on a quick call to explore potential synergies. Please let me know your thoughts and availability.
>
> Best regards,
> Alex

**After** (the `cold-email` skill, after the forcing questions):

> **Subject:** cutting your CI flakes
>
> Hi Priya,
>
> Saw your thread about the team losing roughly a day a week to flaky CI on the monorepo. We hit the same wall at Linear and got it to near zero by isolating test state per worker.
>
> I run FlowCI, a small tool that does that automatically. Worth 15 minutes to show how it maps to your setup? I can do Tuesday or Thursday afternoon your time.
>
> Either way, happy to just send you the writeup of how we fixed it.
>
> Alex
> FlowCI · flowci.dev

What changed: the dead opener, the feature dump, and the vague "synergies" close are gone. The subject is specific. The ask lands in the first third and is one easy action. The opener is a real detail about the recipient, and the leverage is concrete. It reads like one busy person emailing another.

## The process

outreach-stack is a process, not a prompt. Every writing skill runs the same beats, in order:

**Interrogate → Hook → Draft → De-slop → Variants**

Nothing skips ahead. The quality of a cold message is decided before the first word, so the skill refuses to write until it knows who you are talking to, the one ask, your real leverage, and what "yes" looks like. Then it drafts against hard channel limits, runs the shared anti-slop checklist, and hands you strategic variants you choose between by outcome.

| Skill | Your specialist | What they do |
|---|---|---|
| `cold-email` | **The Outbound Writer** | Cold and warm email. Five forcing questions, a 50 to 125 word draft against real deliverability rules, one CTA in the first third, then strategic variants. |
| `inmail` | **The LinkedIn Operator** | InMail, connection notes, and DMs. Knows the 300-character note cap, the no-links rule, and that a connection note earns the accept instead of pitching. |
| `follow-up` | **The Cadence Manager** | Follow-ups and break-ups that add a new angle instead of "just circling back." Reads your prior message first, then changes the angle, and knows when to stop. |
| `outreach-research` | **The Researcher** | Finds one concrete, verifiable hook about the recipient before you write, and cites the source. Degrades honestly to "research-blind" when no web tool is available. |

### Power tools

| Tool | What it does |
|---|---|
| Voice memory | With Bun installed, every message you approve trains a local voice profile (`lib/voice-profile.ts`) that biases future drafts toward your real sentence length, openers, and formality. Stored only on your machine, never transmitted, never holds recipient details. Wipe it any time with `bun lib/voice-profile.ts clear`. |
| Slop linter | `lib/slop-check.ts` is a deterministic backstop to the anti-slop pass. Lint any draft: `printf '%s' "your draft" \| bun lib/slop-check.ts --stdin`. It also guards the repo in CI, so an em dash can never ship. |

## The anti-slop rule

Every skill ends by stripping the tells: the em dash (banned outright), "I hope this email finds you well," fake personalization, the feature dump, the buried ask, and the rule-of-three cadence. The full kill-list lives in `shared/anti-slop.md`, shared by every skill so the standard is identical across channels. CI runs the linter on every push, so the rule is enforced, not just requested.

## Uninstall

```sh
./setup --uninstall
```

This removes the symlinks the repo created from `~/.claude/skills/`. Your voice profile in the config directory is left alone; clear it with `bun lib/voice-profile.ts clear` or by removing `~/.config/outreach-stack/`.

## Philosophy

Writing is a process, not a prompt. Forcing questions first, then a draft against hard constraints, then a self-review that removes anything that sounds generated, then strategic variants you pick between by outcome. The approach is borrowed from gstack's process-over-prompt skills, which push back on your framing before producing anything. outreach-stack applies the same idea to the one place AI slop does the most damage: the first message to someone who does not know you yet.

Built to be forked. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT. Free forever. Go send something worth replying to.
