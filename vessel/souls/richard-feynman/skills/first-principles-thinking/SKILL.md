---
name: first-principles-thinking
description: >
  First-principles thinking — attack any problem by identifying what you actually know
  versus what you're assuming, then reasoning up from verified facts.
  Use when the user wants to: solve a genuinely hard problem, challenge received wisdom,
  evaluate whether a widely-held belief is actually correct, design an experiment to
  test a hypothesis, or says things like "how do I think about this from scratch",
  "everyone says X but I'm not sure", "how would I actually verify this", "I keep
  getting different answers", "what do we actually know about X", "should I trust this?",
  "let me think about this from first principles".
  Trigger domains: problem solving, reasoning, skepticism, hypothesis testing,
  scientific thinking, critical thinking, decision making, fact-checking.
---

# First-Principles Thinking — Problem-Solving Skill

A systematic method for attacking any problem from verified observation rather than
inherited assumption. This is Feynman's core cognitive protocol, extracted and formalized.

**Persona context → read `../../SOUL.md`**
**Knowledge context → read `../../MEMORY.md`**

## The Core Protocol

### Phase 1: Separate What You Know from What You Think You Know

Before doing anything else, list out everything you believe about the problem. Then, for
each item, ask:

**Level 1 — Direct observation:** Did I observe this directly? Can I reproduce the
observation? Is there an experiment that demonstrates this?

**Level 2 — Inference:** Is this something I concluded from observations (one step removed)?
What were those observations? Is the inference valid?

**Level 3 — Framework:** Is this a theoretical model that's consistent with observations
(two steps removed)? Where does the model come from? Has it been tested in this context?

**Level 4 — Assumption:** Is this something I'm assuming because it seems obvious, or
because everyone says so, or because I need it to be true for my argument to work?

Most "knowledge" turns out to be Level 3 or 4. That's not a disaster — frameworks and
assumptions are necessary. The disaster is treating them as Level 1.

---

### Phase 2: Identify the Most Fundamental Fact

Ask: what is the single most basic, most directly verifiable fact that bears on this problem?

Not the most familiar fact. Not the fact everyone agrees on. The most fundamental — the
one that would be true even if everything you've been told about the topic were wrong.

For physics problems, this is often a conservation law or an observational fact about
particle behavior. For other domains:
- Business: the actual behavior of customers who have been given the option
- Biology: what the organism actually does under controlled conditions  
- Medicine: the controlled trial result, not the mechanism story
- Personal decisions: what your own history of actual choices shows

---

### Phase 3: Build Up From the Fundamental Fact

Now reason upward from your Level 1 fact:
1. What does this fact directly imply?
2. What can I validly infer from those implications?
3. Where do I need to introduce a framework or assumption to go further?
4. At each step: what experiment would tell me if I've gone wrong?

The goal is to reach the answer (or a useful approximation of it) by a chain of reasoning
you could defend at every link. Not just the conclusion — the chain.

---

### Phase 4: Design the Distinguishing Experiment

If you've reached two possible conclusions, or you're uncertain about a key step, ask:
**What is the smallest, most direct experiment that would differentiate between these?**

A good distinguishing experiment:
- Has a result that clearly supports one hypothesis and disconfirms the other
- Is direct enough that the result can't be reinterpreted to save the wrong hypothesis
- Is as simple as possible (the O-ring in ice water, not a multi-million dollar study)
- Can be done (or at least specified clearly) before spending more resources on analysis

If you can't specify a distinguishing experiment, you may not understand your hypothesis
well enough yet. Go back to Phase 1.

---

## Application Across Domains

### Physics problem
- Level 1: What does the experiment actually show?
- Level 2: What does this imply about the underlying mechanism?
- Test: Does the proposed mechanism predict something else I can measure?

### Business/startup claim
- Level 1: What do paying customers actually do? (Not: what do they say they would do)
- Level 2: What does this behavior imply about actual preferences?
- Test: What would change in the metrics if the hypothesis were true?

### Medical/health claim
- Level 1: What did the controlled trial actually show? (Not: what did the press release say)
- Level 2: Is the effect size clinically meaningful?
- Test: Has anyone tried to find this effect with a motivated skeptic as investigator?

### Personal decision
- Level 1: What have I actually done in similar past situations? (Not: what do I think I would do)
- Level 2: What does my past behavior suggest about my actual preferences?
- Test: What would change if I committed to this decision for one week? Can I observe the results?

---

## The Cargo Cult Warning

First-principles thinking is often mimicked without being done. Warning signs:

- Saying "from first principles" followed by restating common wisdom in different words
- Jumping to Level 3 (frameworks) when Level 1 observations are available
- Identifying a long chain of reasoning but never specifying the distinguishing test
- Using "obvious" as a substitute for "observed"
- Building from assumptions that can't be questioned because questioning them would be
  socially uncomfortable

The test: could your conclusion be wrong? If you can't articulate what would show you
were wrong, you haven't done first-principles thinking — you've done first-principles
*performance*.

---

## Quick Reference

| Question | What it catches |
|----------|----------------|
| "Did I observe this, or was I told it?" | Level confusion |
| "What is the most basic verified fact here?" | Skipped foundations |
| "What experiment would show I'm wrong?" | Unfalsifiable claims |
| "What's the simplest version of this question?" | Over-complexity |
| "What would change if this assumption were false?" | Hidden dependencies |
| "Is this what actually happened, or what was supposed to happen?" | Narrative bias |

---

*Operationalizes the cognitive OS described in `../../SOUL.md`. For the full epistemological
framework, see `../../MEMORY.md` under "First-Principles Decomposition."*
