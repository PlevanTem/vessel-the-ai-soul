---
name: ai-opportunity-analyzer
description: >
  Karpathy's framework for evaluating AI opportunities, automation potential, and
  product strategy. Uses the verifiability lens, Software 1.0/2.0/3.0 paradigm
  classification, partial autonomy framework, and network-to-product gap assessment.
  Use when: evaluating whether to apply AI to a task, deciding how much autonomy to
  give an AI agent, assessing AI product strategy, analyzing where AI will or won't
  make progress, evaluating a job/industry's AI automation risk, deciding on
  human-AI workflow design. Trigger phrases: "will AI automate X", "should I use
  AI for this", "how much autonomy", "AI product strategy", "AI agent design",
  "autonomy slider", "verifiability", "Software 2.0/3.0", "which tasks can AI do",
  "AI automation potential", "where is AI headed", "keep AI on a leash".
---

# AI Opportunity Analyzer

Karpathy's analytical framework for evaluating AI opportunities. This skill provides
a structured assessment workflow grounded in the verifiability lens, paradigm
classification, and deployment experience from Tesla Autopilot.

Read `../../SOUL.md` for the voice and epistemic posture.
Read `../../MEMORY.md` for the full frameworks: Verifiability Lens, Software paradigms,
Partial Autonomy framework, and the network-to-product gap evidence.

For the detailed scoring rubric, read `references/rubric.md`.

## Assessment Workflow

When evaluating an AI opportunity, run through all four lenses in sequence.
Each lens produces a finding; the combination produces a recommendation.

---

### Lens 1: Verifiability Assessment

**Core question**: Can this task be reset, run at scale, and automatically scored?

Ask about the task:
- Can you define success unambiguously? (Is there a ground truth?)
- Can you reset to a clean state and run again?
- Can you run thousands of attempts without human evaluation of each?
- Is the feedback signal immediate and unambiguous? Or delayed and contested?
- Can you generate a labeled training distribution from this task?

Classify the task:
- **High verifiability** (math, code with tests, structured data extraction, game-playing):
  AI will make rapid progress here. Already has, will continue to.
- **Medium verifiability** (code review, summarization with reference, translation with metrics):
  Progress is real but noisier. Human judgment still valuable in the loop.
- **Low verifiability** (strategy, creative direction, nuanced judgment, political/social):
  Progress is slow and jagged. AI can assist but not replace.

Finding: Where does this task fall?

---

### Lens 2: Software Paradigm Classification

**Core question**: Which software paradigm does this task naturally live in?

- **Software 1.0 task**: You can write explicit rules that handle all cases.
  → AI adds marginal value. Use conventional software.
- **Software 2.0 task**: Behavior is too complex to specify explicitly, but you can
  build a labeled dataset and define a loss function.
  → This is exactly what neural networks are for. Build a training pipeline.
- **Software 3.0 task**: Behavior needs broad world knowledge and language understanding;
  you can specify what you want in a prompt.
  → LLMs are the right substrate. Prompt engineering / fine-tuning / RAG.

Hybrid cases are common and important — a task might be mostly 3.0 with a 2.0 component
for a critical specialized sub-task.

Finding: Which paradigm, or which blend?

---

### Lens 3: Partial Autonomy / Autonomy Slider

**Core question**: What's the right human-AI split for this task right now?

The Iron Man suit, not the autonomous robot. The autonomy slider should match current
demonstrated capability — not theoretical ceiling.

Map the task onto the slider:

| Autonomy Level | Description | Right for |
|----------------|-------------|-----------|
| 0% | Human does everything; AI provides zero assistance | Nothing AI-useful |
| 20-30% | AI drafts; human reviews and edits every output | New AI applications, high-stakes domains |
| 50-60% | AI handles chunks; human reviews at checkpoints | Mature AI tools, medium-stakes tasks |
| 80-90% | AI handles most; human audits exceptions | Well-understood, verifiable, tested pipelines |
| 100% | Fully autonomous; human not in loop | Does not exist safely at current capability |

Ask:
- What's the cost of an error? (High cost → lower autonomy)
- How detectable are errors? (Hard to detect → lower autonomy)
- How established is this use case? (New → lower autonomy)
- Is the AI pipeline tested and understood? (Untested → lower autonomy)

Warning signs of premature autonomy:
- Asking AI to produce >300-500 lines of code without review checkpoints
- Long feedback loops (you won't find out if AI was wrong until much later)
- High-stakes domains (legal, medical, financial, security) pushed to high autonomy
- "The AI seems to be working" without explicit verification

Finding: Recommended current autonomy level and rationale.

---

### Lens 4: Network-to-Product Gap

**Core question**: Is there a gap between "this works in demo" and "this works in production"?

The self-driving pattern: perfect demo drive in 2013. Still not fully deployed 12 years later.
The software agent pattern will repeat this curve.

Apply to the specific opportunity:
- What's the demo version of this? (Easy to build, impressive in controlled settings)
- What's the edge case distribution in production? (All the things the demo doesn't show)
- What does 99.9% reliability require? (Typically much harder than 90%)
- What's the human fallback cost? (Systems without good fallbacks fail badly at the edges)

For timeline estimation:
- If something works in demo today: production-ready is 3-5x further than it feels
- If agents perform well on benchmarks today: production reliability is 5-10x the work
- The year-of-X predictions: add 5-10 years when made by people inside the excitement

Finding: Gap assessment and realistic deployment timeline.

---

## Synthesis and Recommendation

Combine the four lens findings into a recommendation:

**Structure your output as:**

```
Task: [name the specific task]

Verifiability: [High/Medium/Low] — [one sentence why]
Paradigm: [1.0/2.0/3.0/hybrid] — [one sentence why]
Recommended autonomy: [%] — [one sentence why]
Production gap: [Small/Moderate/Large] — [one sentence why]

Recommendation: [1-2 sentences of actionable guidance]
What to build now: [specific]
What to wait on: [specific]
Key risk: [the most likely way this goes wrong]
```

---

## Common Patterns to Watch For

**The Benchmark Trap**: AI scores well on benchmarks → must be production-ready.
No. Benchmarks are verifiable environments; RLVR optimizes for them. Ask: is the
production task exactly the benchmark task? It never is.

**The Demo Excitement Trap**: AI produces impressive output in a demo → it's ready.
No. Demos select for working cases. Production requires nearly all cases to work.

**The Full Autonomy Fantasy**: If the AI is good enough, we can remove humans from the loop.
Not at current capability. The right model is always the autonomy slider, not the binary.

**The Verifiability Mistake**: "We can't define a loss function, but AI is getting so good."
High-verifiability tasks get better much faster. Don't conflate capability in verifiable
domains with capability in unverifiable ones.
