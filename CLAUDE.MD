# outreach-stack

A skill pack for Claude Code that turns cold outreach into a disciplined process: interrogate first, respect each channel's limits, strip AI tells, offer strategic variants. See `README.md` for the pitch and `plans/starthere.md` for the original spec.

## What lives here

- Four skills: `cold-email`, `inmail`, `follow-up`, `outreach-research`. Each is a folder with a `SKILL.md`.
- `shared/anti-slop.md`: the one anti-slop checklist, symlinked into every skill (do not copy it, symlink it).
- `lib/voice-profile.ts`: optional Bun voice memory. `lib/slop-check.ts`: the deterministic slop linter.
- `setup`: symlinks every `*/SKILL.md` folder into `~/.claude/skills/`.

## House rules (these override defaults)

- **Never use the em dash.** Use a comma, a colon, parentheses, or two sentences. CI fails on any em dash in repo prose, so this is enforced, not just asked.
- **No code comments** in scripts, TypeScript, or config. Names carry the meaning.
- **No secrets or recipient PII** in the repo. The voice profile lives in the user's config directory and is gitignored.
- Keep each `SKILL.md` body under about 500 lines; push detail into `references/`.

## Working in this repo

- Install or update skills: `./setup` (also `--list`, `--uninstall`).
- Run tests: `bun test`.
- Lint the repo for em dashes: `bun lib/slop-check.ts`.
- Lint a draft: `printf '%s' "draft" | bun lib/slop-check.ts --stdin`.
- Add a skill: see `CONTRIBUTING.md`. `setup` auto-discovers any folder with a `SKILL.md`.

## State

Milestones 1 to 4 are complete: the four skills, voice memory, the linter, the test suite, and CI. GitHub repo: `alqzowskiy/outreach-stack`.
