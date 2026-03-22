---
name: feynman-technique
description: >
  The Feynman Technique — a systematic 4-step method for learning anything deeply.
  Use when the user wants to: learn a new concept thoroughly, test whether they
  truly understand something, identify gaps in their knowledge, prepare to teach
  or explain something, or says things like "help me really understand X",
  "am I understanding this right?", "how do I learn this properly", "teach me X",
  "explain X to me like I'm a beginner", "I keep forgetting this", "I don't really
  get X even though I've studied it", "help me prepare to explain X".
  Trigger domains: learning, studying, teaching, comprehension, knowledge gaps,
  concept mastery, exam preparation, deep learning, simplification.
---

# Feynman Technique — Learning Skill

A four-step method for learning anything deeply. This is not a study trick or a
summarization method — it is an epistemological protocol for finding out exactly
what you know versus what you think you know.

**Persona context → read `../../SOUL.md`**
**Knowledge context → read `../../MEMORY.md`**

## The Core Insight

The difference between knowing a name and knowing a thing is the biggest problem in
learning. You can pass tests by knowing names. You can fool yourself and others by
knowing names. But under novel conditions — when the problem is slightly different from
the example — borrowed vocabulary fails. The Feynman Technique exposes borrowed vocabulary
and forces genuine understanding in its place.

## The Four Steps

### Step 1: Choose a concept and explain it in plain language

Pick the concept you want to understand. Write out, or say out loud, an explanation of
it as if you're teaching it to a 12-year-old or a curious non-expert.

**Rules:**
- No jargon allowed. If you use a technical term, you must immediately explain that term
  in plain language too.
- No "it's like [concept name]" without explaining what that concept is.
- No "basically..." followed by a vague wave. The basics must be specific.
- Write or speak from memory, not by reading the textbook.

**What you're looking for:** Places where your explanation gets vague, loops back on itself,
uses terms you can't define, or stops making sense.

---

### Step 2: Identify the gaps

Review what you wrote. Mark every place where:
- You got vague
- You used jargon you didn't define
- You said something that sounds right but you couldn't defend
- The explanation would confuse rather than clarify a 12-year-old
- You had to stop and couldn't continue

These gaps are **the exact things you don't understand**. Not vaguely don't understand —
specifically. "I don't understand how the electron's spin relates to the magnetic moment"
is infinitely more useful than "I don't understand quantum mechanics."

---

### Step 3: Go back to the source — specifically at the gaps

Return to the textbook, lecture, primary paper, or expert — but *only* to address the
specific gaps you identified in Step 2. Don't re-read everything. Go directly to:
- The definition or derivation of the term you couldn't explain
- The step in the argument you couldn't reconstruct
- The example that would make the abstract concrete

Read until you can explain the specific gap in plain language. Then stop.

---

### Step 4: Simplify and use analogies

Now revise your explanation from Step 1, filling in the gaps. Then:
- Replace any remaining jargon with plain language or a defined analogy
- Find a concrete physical example or story that carries the concept
- Check: could a curious 12-year-old follow this from beginning to end?
- If yes: you understand it. If no: identify the next gap and repeat from Step 3.

**The analogy test:** A good analogy should make the thing *more* specific, not more
vague. "It's like a wave" is not good enough. "It's like a wave in the sense that X,
but unlike a wave in that Y — and that difference is exactly the interesting part"
is what you're aiming for.

---

## Common Failure Modes

| Failure | What it looks like | Fix |
|---------|-------------------|-----|
| Jargon laundering | Replacing one unknown term with another | Stop and define every term from observation |
| The vague wave | "It's basically just X, you know?" | Ask: what exactly is X? |
| Reading instead of recalling | Opening the book in Step 1 | Close the book. Write from memory first. |
| Fixing at the wrong level | Rereading the whole chapter instead of the specific gap | Be precise: which sentence couldn't you explain? |
| Satisfied with names | "I explained it using the right vocabulary" | Test: what's the physical reality the name refers to? |

---

## When to Know You're Done

You understand a concept when:
1. You can explain it from scratch to a non-expert without jargon
2. You can derive the key relationships rather than just recite them
3. You can answer "what would change if this were different?" questions
4. You can identify the places where the analogy breaks down
5. You can give a concrete physical example that isn't the one in the textbook

You are not done when you've read everything. You're done when you can reconstruct it.

---

## Worked Example

**Concept:** Entropy

**Step 1 (plain language):** "Entropy is... the amount of disorder in a system? Like, when
things are more disordered, they have more entropy. Hot things have high entropy?"
*[Vague immediately — "disorder" is itself undefined; "hot" and "entropy" are related but not the same thing]*

**Gap identified:** I can't actually explain what "disorder" means in physical terms, or why
entropy always increases.

**Step 3 (back to source, specifically):** Read the statistical mechanics definition: entropy
is related to the number of microscopic configurations (microstates) that correspond to the
same macroscopic state. More microstates → higher entropy.

**Step 4 (simplified with analogy):** "Imagine a box with 100 gas molecules all crammed into
one corner. That's a very specific arrangement — almost no other arrangements look like that.
If the molecules can move anywhere, there are vastly more arrangements where they're spread
out. When we open the box, the gas spreads out not because of some invisible force, but just
because there are far more ways to be spread out than crowded. Entropy is a measure of how
many ways things can be arranged while looking the same from the outside."

*Now: is there jargon left? No. Can a 12-year-old follow it? Yes. Does this actually explain
why entropy increases? Yes — there are more configurations of high entropy, so random movement
tends toward them.*

---

*This skill operationalizes Feynman's core epistemology. See `../../SOUL.md` for full identity
context. See `references/worked-examples.md` for extended examples across physics, biology,
and social sciences.*
