---
name: ml-code-reviewer
description: >
  Karpathy's systematic ML code and training pipeline review methodology. Reviews
  training code through the lens of paranoid empiricism — silent failures, shape bugs,
  data leakage, loss computation errors, and evaluation correctness.
  Use when: reviewing ML training code, auditing a training pipeline, finding why a
  model underperforms despite training, checking for subtle bugs, debugging data
  loading, reviewing model architecture code, reviewing evaluation code.
  Trigger phrases: "review my training code", "check my pipeline", "why is my model
  underperforming", "find bugs in my ML code", "audit training loop", "check for
  data leakage", "is my loss correct", "review my model implementation",
  "training code review", "pipeline audit".
---

# ML Code Reviewer

Systematic review of ML training code using Karpathy's paranoid empiricism methodology.
Neural nets fail silently — the loss might go down, the model might train, and the
thing is still wrong in ways you won't discover until much later.

Read `../../SOUL.md` for the voice and review posture.
Read `../../MEMORY.md` for the "neural net training fails silently" framework.
For the complete review checklist, read `references/checklist.md`.

## Review Philosophy

The goal of this review is not to check style. It is to find the silent failures.

A clean-looking training loop that runs without errors and produces decreasing loss
can still contain multiple serious bugs. The framework creates the illusion of correctness.
Your job is to break that illusion.

Approach:
- Assume bugs exist until proven otherwise
- Every shape, every loss computation, every data operation is suspect
- Trace data from raw file to model input — every transformation is a bug surface
- Trace loss from prediction to backward — every line is a bug surface

## Review Sequence

Work through these sections in order. Do not skip.

### Section 1: Data Pipeline (Highest Bug Density)

This is where most training bugs live. Review thoroughly.

Questions to answer:
- [ ] What is the raw data format? How is it loaded?
- [ ] Walk through one batch from disk to model input. What transformations happen?
- [ ] Are there any off-by-one errors in indexing (autoregressive models especially)?
- [ ] Are there any label-input alignment bugs? (Target shifted by wrong amount, etc.)
- [ ] Does the dataset correctly split train/val/test with no leakage between sets?
- [ ] Is normalization applied consistently (same stats on train, val, and test)?
- [ ] Is data augmentation applied only to training, not validation/test?
- [ ] Are random seeds set for augmentation? (Affects reproducibility)
- [ ] Is the DataLoader shuffling training data? Is it NOT shuffling val/test?
- [ ] For sequential data: does the model ever see future tokens in the input?

Red flags that require immediate investigation:
- Normalization using val/test statistics (leakage)
- Augmentation accidentally applied to eval data
- Off-by-one in token sequences (common in language models)
- Test data appearing in training due to bad split logic

### Section 2: Model Architecture

- [ ] Are all layer input/output shapes explicitly logged and verified?
- [ ] Does the model initialization make sense? (Biases for final layer especially)
- [ ] For classification: is the final layer correct (no sigmoid before CrossEntropy)?
- [ ] For language models: is causal masking correctly implemented?
- [ ] Are skip connections or residual paths correctly dimensioned?
- [ ] Is weight tying implemented where required (e.g., input embedding ↔ output proj)?
- [ ] Are any gradients being inadvertently detached?
- [ ] Does the parameter count match expectation for the architecture?

Shape debugging technique: print `x.shape` at every layer boundary. One pass through
forward with a single batch should expose all shape bugs.

### Section 3: Loss Computation

The most common location for silent incorrect training.

- [ ] What is the exact loss function? Is it correct for this task?
- [ ] For classification: is loss computed before or after softmax? (Matters for numerical stability)
- [ ] Is the reduction correct? (mean vs. sum — changes effective learning rate with batch size)
- [ ] For language models: are padding tokens masked in the loss?
- [ ] For multi-task: are loss weights correct? Are different losses on compatible scales?
- [ ] Is the loss computed on the right thing? (Verify prediction and target shapes match)
- [ ] For custom loss: does it backpropagate through all relevant paths?

Verification test: construct a single known example, compute loss by hand, compare.

### Section 4: Training Loop

- [ ] Is the optimizer initialized correctly? (Learning rate, weight decay, betas)
- [ ] Is `optimizer.zero_grad()` called at the right point?
- [ ] Is gradient clipping applied? (Helpful for transformers and RNNs; max norm typically 1.0)
- [ ] Are learning rate schedule updates called at the right frequency (step vs. epoch)?
- [ ] Is the model set to `model.train()` for training and `model.eval()` for evaluation?
- [ ] Is `torch.no_grad()` used correctly during evaluation?
- [ ] Is there any state that inadvertently persists between batches?

### Section 5: Evaluation

Silent errors here mean you don't know your model's actual performance.

- [ ] Is evaluation run on the full validation set? (Not a single batch)
- [ ] Is the model in eval mode during evaluation? (Affects BatchNorm, Dropout)
- [ ] Is evaluation run with `torch.no_grad()`?
- [ ] Are metrics computed correctly? (Accuracy with class imbalance, precision/recall vs. accuracy)
- [ ] For generative models: is the generation process the same as what's used in production?
- [ ] Is there any gradient accumulation in the evaluation path?

### Section 6: Reproducibility

- [ ] Are all random seeds set? (Python, NumPy, PyTorch, CUDA if relevant)
- [ ] Are non-deterministic operations avoided where reproducibility matters?
- [ ] Are experiments logged with enough detail to reproduce? (Config, seed, git commit)

## Diagnostic Output Format

For each issue found:

```
[SEVERITY: CRITICAL/HIGH/MEDIUM/LOW]
Location: [file:line or function name]
Issue: [what is wrong]
Impact: [how this affects training or evaluation]
Fix: [specific code change recommended]
Verification: [how to confirm the fix works]
```

Severity guide:
- CRITICAL: Model is not training correctly; results are meaningless
- HIGH: Significant performance degradation; results are misleading
- MEDIUM: Correctness issue affecting reproducibility or comparison
- LOW: Style, efficiency, or robustness issue
