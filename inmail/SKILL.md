---
name: inmail
description: Use when writing LinkedIn outreach: an InMail, a connection request note, or a DM to someone you are not yet talking to. Triggers on "LinkedIn message", "InMail", "connection request", "connection note", "add a note", "LinkedIn DM", "reach out on LinkedIn", "message this person on LinkedIn". Run this process instead of generating a generic message.
---

# inmail

LinkedIn outreach with the same discipline as a cold email, under LinkedIn's tighter physical limits. Interrogate first, draft against the character caps, strip anything that reads as machine-written, then offer strategic variants. Never jump straight to a finished message.

LinkedIn has three surfaces with different limits. Find out which one before anything else, because a connection note and an InMail are not the same job.

## Step 1: Which surface?

Ask first, with AskUserQuestion:

- **Connection request note** (about 300 characters, no links, one idea). The note's job is to earn the accept, not to pitch.
- **InMail** (a paid or premium message to someone you are not connected to: a subject line plus a longer body, links allowed but used sparingly).
- **DM** (you are already connected: conversational, no subject).

If the user already said which, skip this and move on.

## Step 2: Forcing questions, one at a time

Same spine as a cold email. Ask one per turn, offer concrete options, skip what the user already gave you:

1. **Who is the recipient, by role?** Function and what they care about, not just the company name.
2. **What is the one ask?** For an InMail or DM, a single action. For a connection note, the ask is usually just "accept", so the note only needs a reason, not a pitch.
3. **What is your real leverage?** A shared contact, a specific result, a number, or a pain specific to this person.
4. **What happens if they say yes?** The concrete next step, which is your CTA.

Why fewer questions than email: LinkedIn is warmer and shorter, so context matters less and brevity matters more.

## Step 3: One concrete hook

Ask for one specific, verifiable detail (a post they wrote, something they shipped, a shared group or contact). On LinkedIn the hook is usually sitting right on their profile, so there is no excuse for a generic opener. If `outreach-research` is available, use it. If there is nothing specific, keep it to one honest sentence rather than faking it.

## Step 4: Load the channel rules

Read `references/channels.md` and treat the caps as hard limits. The short version: a connection note is one sentence under 300 characters with no link; an InMail is a short subject plus a tight body that front-loads the ask; a DM skips the subject and gets to the point in the first line.

## Step 5: Draft

Write one message for the chosen surface. Put the reason and the ask early. For a connection note, write one sentence and stop. For an InMail, write a subject under ten words and a body a person reads on a phone without scrolling.

Connection note examples (under 300 characters):
- Good: "Saw your talk on cutting on-call pages at Acme. I run a tool that does the alert-dedup part automatically and would like to follow your work."
- Bad: "I'd love to add you to my professional network and explore potential synergies between our companies."

## Step 6: Self-review for slop

Read `references/anti-slop.md` (the shared checklist) and strip everything it flags. No em dash. On LinkedIn the worst offenders are the automated-tool tells: "I'd love to add you to my professional network", "I came across your profile", or a pitch crammed into a connection note.

If Bun is installed, run the draft through the linter as a backstop: `printf '%s' "MESSAGE" | bun ~/.claude/skills/inmail/slop-check.ts --stdin`.

## Step 7: Variants and output

Offer two or three approaches that lead to different outcomes (connect now and pitch later, versus ask directly in an InMail, versus a warm DM through a shared group), each with its trade-off. Then use this output contract: the recommended message in full, one line on why it fits, then the alternatives with a one-line trade-off and draft each.

## Voice memory (optional)

If Bun is installed, this skill learns your voice over time from the messages you approve. The helper is `voice-profile.ts` in this skill's directory (for the default install, `~/.claude/skills/inmail/voice-profile.ts`).

- Before Step 5, run `bun ~/.claude/skills/inmail/voice-profile.ts summary --channel inmail` and match the sentence length, openers, and formality it reports. If it says there is no profile yet, just write plainly.
- After the user approves a message, record it: `printf '%s' "APPROVED MESSAGE" | bun ~/.claude/skills/inmail/voice-profile.ts add --channel inmail`.

If Bun is missing or the command fails, skip this silently and carry on. Nothing is transmitted anywhere: the profile is a local file in your config directory, and recipient details never go in it.
