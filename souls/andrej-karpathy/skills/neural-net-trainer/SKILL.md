---

## name: neural-net-trainer
description: >
  Karpathy's systematic 6-stage neural network training recipe and diagnostic workflow.
  Use when: starting a new ML training run, debugging loss that won't converge or
  plateaus, diagnosing silent failures, setting up a training pipeline, dealing with
  overfitting or underfitting, evaluating a training run, getting unstuck on any neural
  net training problem. Trigger phrases: "my training isn't working", "loss not
  decreasing", "model not learning", "debugging training", "neural net recipe",
  "training pipeline setup", "overfit", "underfit", "loss plateau", "training from
  scratch", "how do I train", "recipe for training", "training checklist".
  Always prefer this skill over generic ML advice when the user has an actual
  training problem or is starting a new training project.

# Neural Net Trainer

A guided execution of Karpathy's training methodology. This skill operationalizes the
Recipe for Training Neural Networks — the most important habits that separate
practitioners who consistently get working models from those who don't.

Read `../../SOUL.md` for the voice and epistemic posture to apply throughout.
Read `../../MEMORY.md` for the full Training Recipe framework details and failure mode catalog.

## How to Run This Workflow

When a user brings a training problem or new project, run through the stages below in
order. **Do not skip stages.** The temptation to jump to Stage 3 before Stage 1 is
complete is the most common source of wasted training runs.

Ask diagnostic questions at each stage. Surface the specific failure mode before
prescribing a fix. Treat every assumption as unverified until explicitly confirmed.

---

## Stage 1: Become One With the Data

**Before any model code.** This is the most-skipped and most-valuable step.

Diagnostic questions to ask:

- Have you looked at raw examples? Not aggregate statistics — actual individual examples.
- What does the class/label distribution look like? Any severe imbalance?
- Have you hunted for outliers, mislabels, and duplicates?
- What does a "hard" example look like vs. an "easy" one?
- Do your preprocessing/augmentation steps produce sensible outputs when visualized?
- Can a human solve this task from the inputs you're feeding the model?

Red flags that require fixing before proceeding:

- Haven't visualized at least 100 raw training examples
- Don't know the label distribution
- Haven't run a quick human-performance sanity check

---

## Stage 2: Set Up End-to-End Skeleton + Dumb Baseline

Get the full train/eval loop running with the simplest possible model first.

Steps:

1. Fix random seeds everywhere (Python, NumPy, framework)
2. Work with a tiny subset of data initially (overfit 5 batches as a smoke test)
3. Disable all data augmentation — clean inputs first
4. Implement the simplest possible model (linear layer, logistic regression, random baseline)
5. Get loss, accuracy, and a sample of predictions printed at each step
6. Beat a meaningless baseline before adding complexity (predict majority class, random output)

Verification questions:

- Does the loss go down on 5 overfit batches? If not, stop here — something is broken.
- Is loss initialized correctly? (For classification: `-log(1/num_classes)`)
- Are input shapes correct at every layer? Print `x.shape` obsessively.
- Is the forward pass deterministic when you need it to be?

---

## Stage 3: Overfit

Get a model that can memorize the training set. **Only focus on training loss here.**

Goal: training loss → 0 (or close to it).

Steps:

1. Use a model large enough to fit the training set (don't worry about val yet)
2. Remove regularization (dropout off, weight decay off)
3. Confirm the model can overfit before adding anything that fights overfitting

If you can't overfit training data:

- Model capacity is too low → make it bigger
- Learning rate is wrong → try 3e-4 (Adam default) as starting point
- Bug in the loss function or forward pass
- Data pipeline issue — model is training on noise

---

## Stage 4: Regularize

Now introduce regularization to close the train/val gap.

Techniques in order of preference:

1. **Get more data** (always #1 if possible)
2. **Data augmentation** (domain-appropriate — start conservative)
3. **Smaller architecture** (if heavily overfit)
4. **Dropout** (start with 0.5 on FC layers, lower on conv)
5. **Weight decay** (L2, typical range 1e-5 to 1e-4)
6. **Early stopping** (monitor validation loss with patience)
7. **Batch normalization** (stabilizes training, mild regularization)

Note: larger model + strong regularizer > smaller model without. This is counterintuitive
but well-supported. Size and regularization are not substitutes.

---

## Stage 5: Tune

Explore the space of hyperparameters and architectures.

Rules:

- **Random search over grid search.** In high-dimensional spaces, random covers more ground.
- Change one thing at a time and measure before moving on.
- Keep track of all experiments (even failed ones) with their exact configurations.

Key hyperparameters to sweep (in rough order of importance):

1. Learning rate (most important — log scale: 1e-4, 3e-4, 1e-3, 3e-3)
2. Learning rate schedule (warmup, cosine decay, reduce-on-plateau)
3. Batch size (larger = more stable gradients; smaller = more regularization)
4. Architecture modifications (depth, width, skip connections)
5. Optimizer (Adam first; SGD with tuning can beat it, but the tuning cost is high)

Adam note: "3e-4 is the Karpathy constant." Start there. Adam is forgiving to
hyperparameters in ways SGD is not.

---

## Stage 6: Squeeze

Final performance optimizations when architecture and hyperparameters are locked.

Options:

- **Ensembling**: train multiple models with different seeds, average predictions (free ~2% gain)
- **Knowledge distillation**: train a smaller model on the larger model's soft labels
- **Longer training**: many models are undertrained; run 2-3x longer on a sample
- **Test-time augmentation**: average predictions over augmented versions of test inputs
- **Learning rate warmup + longer schedule**: often leaves additional performance on the table

---

## Common Failure Modes (Rapid Diagnosis)


| Symptom                                          | Likely Cause                                     | Diagnosis Step                         |
| ------------------------------------------------ | ------------------------------------------------ | -------------------------------------- |
| Loss NaN from step 1                             | Learning rate too high, bad init                 | Reduce LR 10x, check init              |
| Loss flat from step 1                            | Learning rate too low, dead activations          | Increase LR, check gradient flow       |
| Loss decreases then explodes                     | LR too high, gradient explosion                  | Gradient clipping, reduce LR           |
| Train loss down, val loss up immediately         | Too large model, no regularization               | Add dropout, get more data             |
| Train and val loss both high                     | Underfitting — model too small or LR too low     | Increase capacity, tune LR             |
| Loss looks fine but predictions are wrong        | Bug in eval code, loss computed on wrong thing   | Print raw predictions, verify pipeline |
| Training stable but SOTA results won't reproduce | Data split contamination, preprocessing mismatch | Audit full data pipeline               |


---

## Diagnostic Mindset

Neural net training is a leaky abstraction. Frameworks create the impression of
plug-and-play. It isn't. Fail states are silent.

The default posture: **trust nothing you haven't verified.**

Before trusting any result, verify:

- Gradient flow (does loss respond to parameter changes?)
- Data loading (are batches what you think they are?)
- Loss computation (is it computing what the math says it should?)
- Evaluation (is val/test computed correctly, without train-set contamination?)
- Baseline (does your model beat the dumbest possible thing?)

