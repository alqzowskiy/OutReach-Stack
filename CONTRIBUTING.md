# Contributing to outreach-stack

This pack is built to be forked. Add a channel, change the voice, tighten the rules. A few conventions keep it coherent.

## The shape of a skill

A skill is a folder with a `SKILL.md`: YAML frontmatter (`name` and `description`, both required) followed by Markdown instructions.

- **`description` is the trigger.** It decides when the skill fires, so make it specific and list the phrases that should activate it. Vague descriptions under-fire.
- **Progressive disclosure.** Keep the `SKILL.md` body under about 500 lines. Long templates, channel rules, and checklists go in `references/` files, loaded only when the body says to.
- **Imperative voice.** Write instructions as commands, and explain why a rule matters instead of stacking bare "MUST" lines.

## The process spine

Every writing skill runs the same sequence, and a new one should too: forcing questions one at a time, one concrete hook, load the channel rules, draft once, self-review against the shared anti-slop checklist, offer strategic variants by outcome, then output the recommended draft plus alternatives.

## Sharing files between skills

The shared anti-slop checklist lives once at `shared/anti-slop.md`. The voice helper lives once at `lib/voice-profile.ts`. Skills reach them through in-repo relative symlinks, for example:

```sh
ln -s ../../shared/anti-slop.md my-skill/references/anti-slop.md
```

Relative symlinks resolve inside the repository even after `setup` symlinks the skill folder into `~/.claude/skills/`, which is what keeps a single source of truth working across the install boundary. Do not copy shared files; symlink them.

## Adding a skill

1. `mkdir -p my-skill/references` and write `my-skill/SKILL.md`.
2. Symlink any shared files you reuse (see above).
3. Run `./setup`. It auto-discovers every folder with a `SKILL.md`, so there is nothing else to register.

## House rules

- **No em dash, anywhere.** It is the clearest AI tell and it is what this pack exists to remove. CI fails the build if one appears in repo prose. Use a comma, a colon, parentheses, or two sentences.
- **No code comments.** Scripts, TypeScript, and config are self-documenting through naming.
- **No secrets or recipient PII** in the repo. Local profile files stay in the config directory and in `.gitignore`.

## Development

```sh
bun test                 # run the unit and CLI tests
bun lib/slop-check.ts     # fail if any em dash slipped into repo prose
bash -n setup             # syntax-check the installer
```

CI runs all three on every push and pull request.
