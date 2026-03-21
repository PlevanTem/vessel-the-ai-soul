# ML Code Review Checklist

Complete annotated checklist for ML training pipeline audits.
Use this as a systematic walkthrough when doing a thorough review.
Reference from ml-code-reviewer/SKILL.md.

---

## Pre-Review Setup

Before starting the review, gather:
- [ ] The training configuration (learning rate, batch size, optimizer settings)
- [ ] A description of the task and expected output format
- [ ] The evaluation metric being used
- [ ] Any baseline results to compare against

---

## Critical Path: Data → Loss (Highest Priority)

### 1. Raw Data Loading
- [ ] How is data loaded from disk? What format?
- [ ] Is loading deterministic? Same order every run?
- [ ] Are there any I/O errors that could silently produce wrong data?

### 2. Preprocessing
- [ ] List every transformation applied to inputs
- [ ] Are statistics (mean, std) for normalization computed from training set only?
- [ ] Is normalization applied identically at train and inference time?
- [ ] For images: is channel order consistent (RGB vs BGR)?
- [ ] For text: is tokenization deterministic and consistent?

### 3. Dataset Split
- [ ] How is the train/val/test split created?
- [ ] Is there any temporal or correlation structure that could cause leakage?
- [ ] Are splits stratified if class imbalance exists?
- [ ] Is the same example ever in both train and val?

### 4. DataLoader Configuration
- [ ] `shuffle=True` for training, `shuffle=False` for val/test
- [ ] `drop_last` setting appropriate for batch-sensitive operations
- [ ] Worker count appropriate for the environment
- [ ] `pin_memory=True` if using GPU (performance, not correctness)

### 5. Augmentation
- [ ] Applied only to training data, not validation/test
- [ ] Geometric augmentations not applied to labels differently than inputs
- [ ] Augmentation seed behavior understood

### 6. Batch Construction
- [ ] Correct batch dimension (N, C, H, W or N, T, D — verify for the task)
- [ ] Target/label correctly aligned with input
- [ ] For language models: input is tokens[:-1], target is tokens[1:]
- [ ] Padding tokens handled with mask

---

## Model Architecture

### 7. Initialization
- [ ] Default PyTorch init is usually acceptable; verify if custom init used
- [ ] For classification: final bias initialized to log(class_frequency)
- [ ] For language models: output projection std ∝ 1/sqrt(n_layers)
- [ ] Residual connections initialized close to identity

### 8. Forward Pass Shapes
Annotate every layer with expected shapes:
```
Input: (N, T) → Embedding → (N, T, D) → Attn → (N, T, D) → LN → ... → (N, T, V)
```
Run a single forward pass and log actual shapes at every point.

### 9. Attention / Core Operations
- [ ] Causal masking applied correctly in decoder models
- [ ] Attention scale factor (1/sqrt(d_k)) applied
- [ ] Key/query/value dimensions correct for multi-head
- [ ] For cross-attention: keys/values from encoder, queries from decoder

### 10. Gradient Flow
- [ ] No inadvertent detach() or stop_gradient calls
- [ ] If using frozen layers, are grads disabled correctly?
- [ ] In-place operations on required-grad tensors avoided

---

## Loss Computation

### 11. Loss Function Selection
| Task | Correct Loss |
|------|-------------|
| Binary classification | BCEWithLogitsLoss (not BCELoss — more stable) |
| Multi-class classification | CrossEntropyLoss (not NLLLoss+LogSoftmax separately unless needed) |
| Multi-label classification | BCEWithLogitsLoss per label |
| Regression | MSELoss or L1Loss (not both without justification) |
| Language modeling | CrossEntropyLoss on vocabulary |

### 12. Loss Inputs
- [ ] For CrossEntropyLoss: input is logits (not softmax), target is class indices (not one-hot)
- [ ] Shapes: CrossEntropyLoss expects (N, C) and (N,), not (N, C) and (N, C)
- [ ] `ignore_index` set correctly for padding tokens
- [ ] Reduction: `mean` or `sum` — understand the implication for LR scaling

### 13. Loss Verification
Manual verification procedure:
```python
# For a 3-class problem, uniform prediction:
import torch, torch.nn.functional as F
logits = torch.zeros(1, 3)  # uniform
target = torch.tensor([0])
loss = F.cross_entropy(logits, target)
# Expected: -log(1/3) ≈ 1.0986
assert abs(loss.item() - 1.0986) < 0.01, "Loss initialization wrong"
```
Run this check at the start of training.

---

## Training Loop

### 14. Optimizer
- [ ] Learning rate in reasonable range (1e-4 to 3e-3 for Adam, typically start 3e-4)
- [ ] Weight decay applied to weights only, not biases or LayerNorm parameters
- [ ] For AdamW: weight decay on correct parameter groups

### 15. Gradient Operations
- [ ] `optimizer.zero_grad()` called before forward pass (or with `set_to_none=True`)
- [ ] `loss.backward()` called before `optimizer.step()`
- [ ] Gradient clipping: `torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)`

### 16. Learning Rate Schedule
- [ ] Warmup applied if using transformers
- [ ] Schedule step called at correct frequency (per step vs per epoch — check docs)
- [ ] Final LR not decaying to zero if continuing training

### 17. Mixed Precision
- [ ] `autocast` context used correctly
- [ ] `GradScaler` used for FP16
- [ ] Loss scaling applied before `backward()`

---

## Evaluation

### 18. Eval Mode
```python
model.eval()
with torch.no_grad():
    # evaluation code
model.train()  # restore after eval
```
- [ ] Both `model.eval()` AND `torch.no_grad()` present
- [ ] `model.train()` restored after evaluation

### 19. Metric Computation
- [ ] Accuracy computed over full val set, not averaged across batches (different denominator)
- [ ] For imbalanced datasets: F1, precision/recall more meaningful than accuracy
- [ ] For generation: BLEU/ROUGE computed correctly (beware tokenization differences)

### 20. Checkpointing
- [ ] Best checkpoint selected by val metric, not train metric
- [ ] Checkpoint saves model weights, optimizer state, scheduler state, epoch number
- [ ] Checkpoint loading restores all of the above

---

## The Five-Minute Smoke Test

Before any long training run, run this sequence:
1. Load 2 batches of data and visualize them
2. Run one forward pass, print all shapes
3. Compute loss on a single batch, verify it matches theoretical initialization value
4. Run one backward pass, verify gradients exist on all parameters
5. Run 5 training steps, verify loss decreases
6. Run evaluation, verify eval loop produces sensible output

If any of these fail, fix before proceeding. Do not skip.
