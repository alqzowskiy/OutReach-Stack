# outreach-stack

[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg)](LICENSE)

A skill pack for [Claude Code](https://claude.com/claude-code) that turns cold outreach into a disciplined process instead of a blank "write me an email" prompt. It interrogates before it writes, respects the physical limits of each channel (subject lines, word counts, character caps, one CTA), offers strategic variants that lead to different outcomes rather than different tones, and strips the tells that make a message read as machine-written. Open source, MIT, built to be forked.

## Why it is different

Most outreach tools are a thin wrapper over "generate an email", so they produce "I hope this email finds you well" and a list of features. outreach-stack does the opposite. The quality of an outreach message is decided before a single word is written, so the skills refuse to skip the interrogation:

```
you: write a cold email to a VP of Eng about our CI tool

cold-email: Before I draft anything, a few questions so this is not generic.
  1) Who exactly, and what do they own?  (a name and what they are measured on)
  2) What is the single ask?             (a call, a reply, an intro, a trial)
  3) What is your real leverage here?    (shared contact, a number, a specific pain)
  4) Warm or fully cold?
  5) What does "yes" actually look like?  (that is your CTA)

...then it drafts one tight email, runs it through the anti-slop checklist,
and hands you two or three approaches that lead to different outcomes.
```

## Before / after

Same goal both times: a founder asking a VP of Engineering for 15 minutes.

**Before** (a generic "write me a cold email" prompt):

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

What changed: the dead opener, the feature dump, and the vague "synergies" close are gone. The subject is specific. The ask lands in the first third and is one easy action. The opener is a real, verifiable detail about the recipient, and the leverage (we did this at Linear) is concrete. It reads like one busy person emailing another.

## Requirements

- [Claude Code](https://claude.com/claude-code). The skills are instructions the agent runs; the core writing skills need no API key and no paid service.
- [Bun](https://bun.sh) is optional. It powers voice memory and the draft slop-linter. Without it, those features degrade quietly and everything else still works.

## Install

```sh
git clone https://github.com/YOUR-GH-USERNAME/outreach-stack && cd outreach-stack && ./setup
```

`setup` symlinks each skill into `~/.claude/skills/`, so a later `git pull` updates your skills with no reinstall. It is safe to re-run.

```sh
./setup --list       # see what is installed
./setup --uninstall  # remove the symlinks
```

Set `CLAUDE_SKILLS_HOME` to install somewhere other than `~/.claude/skills`.

## Skills

| skill | what it does |
| --- | --- |
| `cold-email` | Cold and warm outbound email: forcing questions, channel rules, anti-slop pass, strategic variants. |
| `inmail` | LinkedIn InMail, connection notes, and DMs, with the channel's character caps and link limits. |
| `follow-up` | Follow-ups and break-up emails that add a new angle instead of re-sending. |
| `outreach-research` | Optional recipient research that surfaces one concrete hook before you write. |

**Voice memory (optional).** With Bun installed, every message you approve trains a local voice profile (`lib/voice-profile.ts`) that biases future drafts toward your real sentence length, openers, and formality. It is stored only in your config directory, never transmitted, and never holds recipient details. Clear it any time with `bun lib/voice-profile.ts clear`.

**Draft linter (optional).** `lib/slop-check.ts` is a deterministic backstop to the anti-slop pass. Lint any draft:

```sh
printf '%s' "your draft here" | bun lib/slop-check.ts --stdin
```

## Philosophy

Writing is a process, not a prompt: forcing questions first, then a draft against hard channel constraints, then a self-review that removes anything that sounds generated, then strategic variants you choose between by outcome. The approach is borrowed from gstack's process-over-prompt skills, which push back on your framing before producing anything.

## License

MIT. See [LICENSE](LICENSE).
