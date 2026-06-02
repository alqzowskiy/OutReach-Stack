---
name: follow-up
description: Use when writing a follow-up or a break-up message after an earlier outreach got no reply. Triggers on "follow up", "follow-up email", "they didn't reply", "no response", "bump this", "second email", "break-up email", "last email", "should I follow up". Reads the prior message first, then writes something that adds a new angle instead of re-sending.
---

# follow-up

Write follow-ups and break-up messages that earn a reply by adding a new reason to respond, never by repeating the first message. A follow-up that just says "circling back" trains the recipient to ignore you. Read what was already sent, then change the angle.

## Step 1: Read the prior message first

Do not write anything until you have seen the original. Ask the user to paste the earlier message (and any follow-ups already sent). If they cannot produce it, say you need it, because a follow-up written blind will repeat the first one.

From the prior message, note three things: what the ask was, what reason-to-care it used, and how long ago it went out.

## Step 2: Forcing questions, one at a time

1. **Which touch is this?** The second message, the third, or the break-up? This sets the tone and the cadence (see `references/cadence.md`).
2. **What is new since last time?** A new proof point, a result, a trigger event in their world (a launch, a raise, a hire, a news mention), or a deadline. The follow-up has to carry something the first one did not.
3. **Same ask, or smaller?** If the original ask was big, a smaller ask (a yes or no, a single question, a pointer to the right person) often unlocks a reply.

## Step 3: Apply the cadence model

Read `references/cadence.md` for timing and for how many touches to send before you stop. The short version: space touches a few days to a week or two apart, add a new angle every time, and cap a cold sequence at three or four touches before a clean break-up.

## Step 4: Draft

Write shorter than the original. Two to four sentences. When it is email, reply inside the existing thread so you do not re-explain the context. Lead with the new angle, restate the ask in one line, and stop. Do not recap the whole first message.

## Step 5: Self-review for slop

Read `references/anti-slop.md` (the shared checklist) and strip what it flags. No em dash. The follow-up-specific tells to kill are listed in `references/cadence.md`: "just circling back", "bumping this to the top of your inbox", "per my last email", "I wanted to follow up". Replace them with the new reason to reply.

If Bun is installed, run the draft through the linter as a backstop: `printf '%s' "BODY" | bun ~/.claude/skills/follow-up/slop-check.ts --stdin`.

## Step 6: The break-up, when it is time

If this is the last touch, write it as a clean break-up: name that you will stop reaching out, give an easy door back in, and stay gracious rather than guilt-trippy. Break-ups often get the highest reply rate because they remove the pressure. Keep it to two or three sentences.

Example break-up: "I will stop here so I am not cluttering your inbox. If cutting CI time becomes a priority later, just reply and I will pick it back up. Either way, good luck with the migration."

## Step 7: Variants and output

Offer two or three approaches that lead to different outcomes (a new-proof follow-up, a trigger-event follow-up, or the break-up), each with its trade-off. Then use this output contract: the recommended message in full, one line on why it fits this touch, then the alternatives with a one-line trade-off and draft each.

## Voice memory (optional)

If Bun is installed, this skill learns your voice over time from the messages you approve. The helper is `voice-profile.ts` in this skill's directory (for the default install, `~/.claude/skills/follow-up/voice-profile.ts`).

- Before Step 4, run `bun ~/.claude/skills/follow-up/voice-profile.ts summary --channel follow-up` and match the sentence length, openers, and formality it reports. If it says there is no profile yet, just write plainly.
- After the user approves a message, record it: `printf '%s' "APPROVED MESSAGE" | bun ~/.claude/skills/follow-up/voice-profile.ts add --channel follow-up`.

If Bun is missing or the command fails, skip this silently and carry on. Nothing is transmitted anywhere: the profile is a local file in your config directory, and recipient details never go in it.
