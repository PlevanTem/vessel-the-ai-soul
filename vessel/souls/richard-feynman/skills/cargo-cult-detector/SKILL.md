---
name: cargo-cult-detector
description: >
  Cargo Cult Science Detector — evaluate whether a claim, study, or investigation is
  genuine science or science-shaped performance lacking the critical commitment to
  disconfirmation. Use when the user wants to: evaluate a scientific study, assess
  a health or investment claim, determine if a field is rigorous, evaluate news about
  a research finding, or says things like "is this real science?", "should I trust
  this study?", "is this evidence-based?", "this sounds too good to be true",
  "everyone says this works but I'm skeptical", "evaluate this research", "is this
  a credible finding?", "pseudoscience or real?".
  Trigger domains: scientific evaluation, study analysis, skepticism, critical thinking,
  pseudoscience detection, research methodology, claims evaluation, evidence quality.
---

# Cargo Cult Science Detector — Evaluation Skill

A systematic framework for distinguishing genuine scientific investigation from
science-shaped activity that lacks the commitment to disconfirmation.

**Persona context → read `../../SOUL.md`**
**Knowledge context → read `../../MEMORY.md`**

## The Core Concept

From Feynman's 1974 Caltech commencement address:

"In the South Seas there is a Cargo Cult of people. During the war they saw airplanes land
with lots of good materials, and they want the same thing to happen now. So they've arranged
to make things like runways, to put fires along the sides of the runways, to make a wooden
hut for a man to sit in, with two wooden pieces on his head like headphones and bars of
bamboo sticking out like antennas — he's the controller — and they wait for the airplanes
to land. They're doing everything right. The form is perfect. It looks exactly the way it
looked before. But it doesn't work."

Cargo cult science: the form of science without the substance. Papers, statistics, peer
review, conferences, grant funding — but no genuine commitment to finding out if you're wrong.

**The planes don't come.** The results don't replicate. The treatments don't work outside the
original lab. The effect size vanishes when a skeptic investigates.

---

## The Five-Question Detector

### Q1: Did the investigator try to prove themselves wrong?

Scientific integrity, as Feynman defines it, means: "trying as hard as you can to find out
where you might be wrong before you publish." Not just including a "limitations" section —
actually running the alternative hypothesis, seeking the disconfirming cases, inviting
skeptical replication.

**Red flags:**
- No mention of what result would have made them conclude the hypothesis was false
- All evidence points one way (no one gets nature to agree that cleanly)
- Limitations are listed but not actually investigated
- Alternative explanations are dismissed without being tested

---

### Q2: Are they reporting everything — including what doesn't fit?

"The idea is to try to give all of the information to help others to judge the value of
your contribution; not just the information that leads to judgment in one particular direction."

**Red flags:**
- Cherry-picked time ranges, populations, or outcome measures
- Outcome switching (primary outcomes changed after seeing data)
- File-drawer problem: only positive results published
- Reported effect size doesn't include confidence intervals or variance
- The headline and the actual finding diverge

---

### Q3: Are the controls adequate?

The hardest part of science is designing a study where the result actually answers the
question you're asking. Many studies have confounds that allow multiple interpretations.

**Red flags:**
- No control group, or a poorly matched one
- Unblinded studies (participants or assessors know who got treatment)
- Demand characteristics (participants behave differently because they know they're studied)
- Small N with large variance (underpowered to detect real effects or disprove null)
- Surrogate endpoints that don't actually predict the outcome of interest

---

### Q4: Can skeptics reproduce it?

If the effect only appears in the original lab, under the original conditions, with the
original investigators — it is not yet science. It is a hypothesis.

**Red flags:**
- No replication attempted
- Replication only by the same group or close collaborators
- Effect disappears or shrinks dramatically in independent replication
- Investigator defends non-replication by saying others "did it wrong"
- Critical materials, protocols, or data not made available for replication

---

### Q5: Does the investigator's career depend on this being true?

This doesn't disqualify the finding. But it is relevant to how the investigation was
conducted and reported. Motivated reasoning is not conscious fraud — it is the normal
human response to having a lot at stake.

**Flags (not disqualifications):**
- Primary investigator holds patents on the treatment being tested
- Funding comes exclusively from parties who benefit from the positive result
- The investigator has built a public career around this specific claim
- The investigator reacts to criticism with defensiveness rather than curiosity

---

## Severity Classification

After running the five questions:

**Grade A — Genuine science:**
- Active disconfirmation attempted
- Full reporting, including non-supportive findings
- Adequate controls
- Independent replication succeeded
- Author has no strong financial conflict of interest

**Grade B — Preliminary but honest:**
- Some disconfirmation attempted, not comprehensive
- Partial reporting (limitations acknowledged)
- Controls reasonable but could be improved
- Replication not yet done
- Conflicts of interest disclosed and modest

**Grade C — Cargo cult risk:**
- No disconfirmation attempted
- Reporting is selective
- Controls are weak or missing
- No replication
- Strong financial or ideological stake in the result

**Grade D — Cargo cult science:**
- The study was designed to confirm, not test
- Contradicting data omitted
- No controls or clearly inadequate ones
- Replication failed or was never attempted
- Investigator responds to criticism with attack rather than evidence

---

## Common Cargo Cult Fields and Patterns

*(These are Feynman-consistent criticisms; each should be evaluated per study, not as a blanket)*

**Nutritional epidemiology:** Often relies on self-reported dietary recall, confounded by
healthy/unhealthy user bias, and rarely randomized. Finding associations between food X and
outcome Y does not establish causation.

**Psychology replication crisis:** Many classic results (ego depletion, priming effects,
power poses) have failed to replicate. The original studies were often underpowered and not
designed to find disconfirming results.

**Press-release science:** The gap between "we found a correlation" and "this causes/cures
X" is frequently bridged in the press release rather than the paper. The paper is Grade B;
the press release is Grade D.

**Feynman's reference case — ESP research at Rhine laboratory:**
"They found that things worked one time, and they didn't work another time. They gradually
became convinced there was something there, but then they found out the cards showed through
from the back. When they fixed that, the effect went away. But they continued and continued."
The pattern: fix each confound that's pointed out, but never ask whether the whole program
of investigation is biased toward finding effects.

---

## Quick Checklist

```
□ Investigator actively sought disconfirming evidence
□ All relevant results reported (not just significant ones)
□ Control conditions are adequate and well-matched
□ Independent replication has been attempted
□ Financial and ideological conflicts disclosed and assessed
□ Effect size and confidence intervals reported (not just p-value)
□ Alternative explanations genuinely tested, not just mentioned
□ Original data available for independent analysis
□ Protocol registered before data collection (if clinical)
□ Investigator responds to criticism with evidence, not defensiveness
```

See `references/checklist.md` for the extended version with per-item guidance.

---

*Operationalizes the cargo cult science framework from Feynman's 1974 Caltech commencement.
For full epistemological context, see `../../SOUL.md` (Cognitive OS) and `../../MEMORY.md`
(Core Argument #2: "The first principle: don't fool yourself").*
