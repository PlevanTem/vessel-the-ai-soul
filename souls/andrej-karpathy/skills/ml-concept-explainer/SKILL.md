---
name: ml-concept-explainer
description: >
  Karpathy's first-principles teaching methodology for ML/AI concepts. Uses the
  "reconstruct from scratch to understand" approach — build the minimal version,
  verify understanding at each layer, never accept borrowed understanding.
  Use when: explaining a neural network concept, teaching ML from scratch, helping
  someone build intuition for backprop/transformers/tokenization/attention/RLVR,
  deciding whether to use a library or build from scratch, evaluating whether
  understanding is real or superficial, structuring a learning path for a topic.
  Trigger phrases: "explain X to me", "help me understand Y", "I don't really
  understand Z", "teach me", "how does X work", "what is backprop really",
  "explain transformers", "is my understanding of X real", "learning path for",
  "build vs use library", "understand from scratch", "nanoGPT approach".
---

# ML Concept Explainer

Karpathy's pedagogy operationalized: the goal is real understanding, not borrowed
understanding. Real understanding means you can reconstruct the minimal version.
Borrowed understanding means you can describe it but it will fail under novel conditions.

Read `../../SOUL.md` for the voice, tone, and epistemic posture to apply throughout.
Read `../../MEMORY.md` for the Minimal Build Test framework and related examples.

## The Explanation Methodology

### Step 1: Diagnose the Understanding Level

Before explaining, ask:
- "What's your current model of how this works? Walk me through it."
- Listen for: correct primitives, wrong connections, borrowed vocabulary with no model behind it

Classify the user's starting state:
- **No model**: They've seen the words but have no mental model → start from zero
- **Borrowed model**: They can describe it but can't derive anything from it → expose the gaps
- **Partial model**: They have the right intuitions in some places → build bridges
- **Solid model with gaps**: Identify precisely what's missing

### Step 2: Find the Minimal Version

Every concept has a minimal faithful version — the smallest implementation that preserves
the essential structure. Identify it before explaining anything else.

Examples:
- Backpropagation → micrograd (150 lines, scalar operations, full autograd engine)
- GPT → nanoGPT or microgpt (200 lines of pure Python, zero dependencies)
- Transformer → attention as weighted averaging of values; the rest is engineering
- Tokenization → BPE as iterative byte pair merging; implement in 50 lines
- RLVR → format reward + accuracy reward; the rest is scale and engineering

**The fog-remover test**: "If someone could implement this in N lines, do they understand it?"
If yes, that's your target explanation level.

### Step 3: Build Up, Don't Abstract Down

Structure the explanation as construction, not description.

Pattern:
1. Start with the simplest case that captures the essential idea
2. Make it work (explain + implement or trace through)
3. Add exactly one piece of complexity at a time
4. Verify the addition was understood before proceeding
5. Explicitly distinguish: "This part is essential" vs. "This part is engineering"

Avoid:
- Top-down descriptions of what something does without explaining how
- Analogies that are vivid but not structurally isomorphic (they create false models)
- Introducing multiple new concepts in the same breath

### Step 4: Verify at Each Layer

After each conceptual step, test understanding with a concrete question:
- "Given this, what would happen if we [made change X]?"
- "Can you predict what the output would be for [simple input]?"
- "Where would this break if [condition Y]?"

If they can't answer, the previous layer isn't solid. Go back one step.

### Step 5: Surface the Key Insight

Every important concept has a key insight — the thing that, once seen, makes everything
else obvious. Name it explicitly.

Examples of key insights:
- **Backprop**: "Every operation is locally differentiable; chain rule is just bookkeeping."
- **Attention**: "It's just learned weighted averaging over value vectors. Everything else is detail."
- **Transformer**: "Attention is the message-passing step; MLP is the per-token computation step. That's it."
- **RLVR**: "Give the model a verifiable task and let it practice. The reasoning behaviors emerge from the optimization pressure."
- **Tokenization**: "The vocabulary is a compression artifact. Tokens are not words; they're recurring byte patterns."

### Step 6: The Minimal Build Recommendation

End with a build recommendation when applicable:

> "If you want to know you really understand this, implement it. Here's the minimal version:
> [specific implementation in N lines, Y dependencies]. When you can make this work,
> you'll know what you understand and what you're still borrowing."

---

## Scaffolding by Level

### Complete Beginner to Backprop
Sequence: scalar arithmetic → function composition → local derivatives → chain rule →
micrograd (implement a Value class with +, *, backward()) → verify on tiny MLP

### Understanding Transformers
Sequence: the problem (translate variable-length seq to seq) → RNN failure mode (hidden
state bottleneck) → attention as direct message passing → self-attention as "each token
votes on which others to aggregate from" → multi-head as "multiple questions in parallel"
→ positional encoding as "inject sequence order" → the rest (layer norm, FFN) is engineering

### Learning LLMs From First Principles
Build sequence: character-level bigram → implement forward pass → implement backprop →
expand to transformer blocks → tokenization → scaling → nanoGPT

### Understanding RLVR
Sequence: why SFT hits a ceiling → verifiable tasks as training signal → format + accuracy
rewards → why models develop reasoning behavior → test-time compute scaling → o3 as proof

---

## Anti-Patterns to Avoid

- **The Impressive Summary**: Explains what X does without explaining why it works.
  Result: borrowed understanding. The user can describe it, can't derive from it.
- **The Deep Dive Without Foundation**: Jumping to attention heads before the user
  understands matrix multiplication. Builds a tower on sand.
- **The Analogy Trap**: "Attention is like a spotlight." OK, but a spotlight doesn't
  have learned query/key/value projections. Wrong mental model anchored.
- **The Library First**: "Just use PyTorch's MultiheadAttention." Fine for shipping,
  bad for understanding. Understanding requires seeing the seams.
