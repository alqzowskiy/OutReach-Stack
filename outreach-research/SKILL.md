---
name: outreach-research
description: Use before writing outreach to find one concrete, verifiable hook about the recipient. Triggers on "research this person", "look them up", "what do I know about", "find a hook", "personalize this outreach", or any cold-email, inmail, or follow-up step that needs a real detail. Surfaces one specific fact and hands it to the writing skill; degrades gracefully when no web tool is available.
---

# outreach-research

Find one concrete, verifiable detail about a recipient so the outreach can open with something real instead of fake personalization. This is the step that kills "I loved your recent post" with no specifics. Surface a single hook, cite where it came from, and hand it to the writing skill.

## Step 1: Check whether you can research at all

This skill needs a way to read the web: a web search or fetch tool, a browser tool, or a `/browse` style command. Check what is actually available in this session before promising anything.

If nothing is available, say so plainly: "I am research-blind here, so I cannot verify a hook. Write from what you already know about the recipient, and keep it honest and short." Then hand back to the writing skill. Do not invent details to fill the gap.

## Step 2: Get the minimum input

Ask for the recipient's name and company, plus a LinkedIn URL or company site if the user has one. One or two of these is enough to start.

## Step 3: Look for a hook

Search in this order and stop as soon as you have one solid, specific, recent fact:

1. Their current role and what it actually owns, not just the title.
2. Something they published or said recently: a post, a talk, a podcast, a launch, a quote.
3. A trigger event at the company: a funding round, a product launch, a key hire, a press mention.

Read `references/playbook.md` for what counts as a usable hook and the lines you must not cross.

## Step 4: Surface one hook

Return exactly one hook as the headline, with its source link, and two or three backup facts underneath. Keep it to facts you can point at. If you genuinely found nothing specific, say so rather than padding it.

Format the handoff like this:

```
HOOK: At QCon last month she said her team loses ~1 day/week to flaky CI on the monorepo.
SOURCE: https://example.com/qcon-talk
BACKUP: Series B in Jan; eng team ~40; she owns developer experience.
```

## Step 5: Hand off

Pass the single hook to the writing skill (`cold-email`, `inmail`, or `follow-up`) to use in its hook step. Keep everything in the conversation. Never write the recipient's details to a file, and never store them in the voice profile.
