# AI Opportunity Rubric

Detailed scoring rubric for each lens in the AI Opportunity Analyzer.
Use when you need more precision than the main SKILL.md provides.

---

## Verifiability Rubric (0-10 scale)

**Resettability (0-3)**
- 3: Environment fully resets to clean state (code tests, game states, structured queries)
- 2: Approximate reset possible (regenerate input distribution, human-created test set)
- 1: Partial reset (some cases can be regenerated, others require real-world events)
- 0: No reset possible (one-off decisions, irreversible events)

**Scalability (0-3)**
- 3: Can run thousands of attempts with zero marginal human cost (automated eval)
- 2: Can run hundreds with lightweight human review (crowdsourced annotation)
- 1: Can run dozens with significant human evaluation per sample
- 0: Each evaluation requires deep expert judgment

**Signal clarity (0-4)**
- 4: Binary unambiguous signal (correct/incorrect, passes tests/fails)
- 3: Clear metric with some noise (BLEU, exact match, structured diff)
- 2: Human-rated metric with moderate agreement (rubric-based scoring)
- 1: Human judgment with low agreement (creative quality, strategic fit)
- 0: No agreed ground truth (aesthetic, organizational, political)

**Score interpretation:**
- 8-10: High verifiability — AI will make rapid progress
- 5-7: Medium verifiability — AI assists well, human still valuable
- 2-4: Low verifiability — AI useful for augmentation, not automation
- 0-1: Very low — AI can provide ideas, not decisions

---

## Paradigm Classification Guide

**Software 1.0 signals:**
- Complete enumeration of cases is feasible
- A good engineer could write all the rules in a week
- The behavior never surprises — follows explicit logic every time
- Changing the behavior means changing the code

**Software 2.0 signals:**
- Behavior is in the training data, not the code
- You have or can collect labeled examples
- You can define a loss function (even if imperfect)
- Performance improves with more data, not more code

**Software 3.0 signals:**
- The task requires broad world knowledge or language understanding
- The specification is easier in English than in code
- You want it to generalize to cases not in training distribution
- Prompt changes matter more than architecture changes

**Hybrid markers:**
- "We need a 3.0 system but it calls a specialized 2.0 model for this sub-task"
- "We use 3.0 for understanding intent, 1.0 for executing the validated action"

---

## Autonomy Slider Decision Matrix

| Factor | Pushes slider DOWN | Pushes slider UP |
|--------|-------------------|------------------|
| Error cost | High (medical, financial, security) | Low (draft creation, formatting) |
| Error detectability | Hard (errors look like success) | Easy (tests, human review catches quickly) |
| Pipeline age | New, untested | Mature, many iterations |
| Domain complexity | Novel, edge-case-rich | Well-charted, standardized |
| Reversibility | Irreversible (emails sent, code deployed) | Reversible (draft, sandbox) |
| Accountability | Human signature required | Best-effort acceptable |

**Absolute limits (do not exceed regardless of performance):**
- Medical diagnosis without physician review: max 50%
- Legal advice without attorney review: max 30%
- Security-critical code without human audit: max 60%
- Financial transactions above materiality: max 60%

---

## Network-to-Product Gap Estimation

**Factors that widen the gap:**

| Factor | Gap multiplier |
|--------|----------------|
| Long-tail edge cases in production distribution | 2-5x |
| High reliability requirement (99.9%+ uptime) | 3-10x |
| Integration with legacy systems | 2-3x |
| Regulatory requirements | 2-5x |
| Need for explainability/audit trail | 2-3x |
| Real-time latency requirements | 2-4x |
| Domain shift from training to production | 3-10x |

**Gap size interpretation:**
- Small gap (1-2x): Demo → product in months
- Moderate gap (3-5x): Demo → product in 1-3 years
- Large gap (5-10x): Demo → product in 3-7 years
- Tesla gap (10x+): Demo → product in 7-15 years

The agents gap today is likely in the 5-10x range for most serious applications.
This is not pessimism — it's the correct calibration based on the self-driving pattern.
