---
name: cold-email
description: Use when writing any cold or warm outbound email: sales prospecting, networking, pitching, asking for an intro, advice, or a meeting, or phrasing like "write a cold email", "reach out to", "email this prospect", "email this investor", "email this recruiter", "cold outreach", "напиши письмо". Run this process instead of generating a generic email.
---

# cold-email

Write cold and warm outbound emails through a disciplined process: interrogate first, draft against hard channel limits, strip anything that reads as machine-written, then offer strategic variants. Never jump straight to a finished email.

Reach for this skill whenever the user wants to contact someone they do not already have a live thread with. If the channel is LinkedIn (InMail, connection note, DM) hand off to `inmail`. If this is a reply to an earlier message that got no response, hand off to `follow-up`.

## Step 1: Forcing questions, one at a time

Ask these before writing anything, using AskUserQuestion, one question per turn. Never paste the whole list. Offer concrete options drawn from what the user already told you, plus room for their own answer. Skip a question only when they already answered it.

1. **Who is the recipient, by role?** Their function and what they are measured on, not just the company name. "VP of Eng who owns the on-call burden" beats "someone at Acme". If the user only gave a company, ask who specifically and what that person owns.
2. **What is the one ask?** A single thing you want them to do. If the user lists two, make them choose; offer the options as the likely candidates (a call, a reply, an intro, a trial) so the choice is fast.
3. **What is your real leverage?** The honest reason they should care. Offer the usual shapes as options: a shared contact, a concrete result you produced, a specific number, or a pain that is specific to this person. If the only honest answer is "we built a good product", record that, and the email will lean on brevity instead.
4. **Warm or fully cold?** Have you interacted before, is there a shared connection, or is this first contact with no link? This sets the first line.
5. **What happens if they say yes?** The concrete next step. This is the CTA, so it must be one easy action (a 15 minute call, a reply with a date, an intro forward), not "let me know your thoughts".

Why this order: the email's ceiling is set by these answers. A sharp ask plus real leverage almost writes itself. Vague inputs produce slop that no amount of wording fixes.

## Step 2: One concrete hook

Ask for a single specific, verifiable detail about this recipient: something they shipped, wrote, said, or are visibly dealing with. One real detail beats three generic compliments.

If the user has nothing specific, do not invent it and do not write "I loved your recent work". Tell them the email is research-blind, and keep it short and direct so honesty carries it. If the `outreach-research` skill is available, use it to fill this step with a verified hook before you draft.

## Step 3: Load the channel rules

Read `references/channels.md` before drafting and treat it as hard constraints. The short version: a 3 to 6 word subject, a first line that carries the open, a 50 to 125 word body, exactly one CTA in the first third, and at most one link. The file also lists the deliverability traps that send a first email to spam.

## Step 4: Draft the primary email

Write one email: a subject line and a body. Lead with the hook or the leverage, land the ask inside the first third, keep one CTA, and stop early. If you have a sample of the user's voice (see Voice memory below), match it; otherwise write plainly, the way one busy person emails another.

Subject lines, concretely:
- Good: "question about your on-call rotation", "Maria suggested I email you", "cut your CI flakes".
- Bad: "Revolutionizing Your Workflow", "Quick question", "Touching base", "Partnership opportunity".

## Step 5: Self-review for slop

Read `references/anti-slop.md` (the shared checklist) and run the draft through it. Remove every item it flags before showing the user anything. The non-negotiable ones: no em dash, no "I hope this email finds you well", no fake personalization, no paragraph about the sender before the point lands, and the ask is never buried. Apply the same filter to the variants.

If Bun is installed, you can also run the draft through the deterministic linter as a backstop: `printf '%s' "BODY" | bun ~/.claude/skills/cold-email/slop-check.ts --stdin`. Treat any hit as something to fix, not a hard gate.

## Step 6: Offer strategic variants

Offer two or three approaches that lead to different outcomes, not different tones. For example:

- **Direct ask.** State the ask in the first two sentences and request 15 minutes. Trade-off: efficient, but builds no goodwill first.
- **Value first.** Open with something useful to them (a relevant insight, a resource, a result), ask second. Trade-off: higher reply rate, but longer and slower.
- **Route through a contact.** Lead with the shared name and let it carry the open. Trade-off: strongest when the contact is real and relevant, useless otherwise.

Pick the approaches the user's actual leverage can support. Let them choose an outcome, then refine that one.

## Step 7: Output

Use this contract every time:
1. The recommended variant, labeled, with its subject and body in a copyable block.
2. One line on why this approach fits the leverage.
3. The other variants, each with a one-line trade-off and its draft.

Keep the recommendation honest: pick the variant the leverage supports, not the longest one.

## Voice memory (optional)

If Bun is installed, this skill learns your voice over time from the messages you approve. The helper is `voice-profile.ts` in this skill's directory (for the default install, `~/.claude/skills/cold-email/voice-profile.ts`).

- Before Step 4, run `bun ~/.claude/skills/cold-email/voice-profile.ts summary --channel cold-email` and match the sentence length, openers, and formality it reports. If it says there is no profile yet, just write plainly.
- After the user approves a draft, record it: `printf '%s' "APPROVED BODY" | bun ~/.claude/skills/cold-email/voice-profile.ts add --channel cold-email`.

If Bun is missing or the command fails, skip this silently and carry on. Nothing is transmitted anywhere: the profile is a local file in your config directory, and recipient details never go in it.
