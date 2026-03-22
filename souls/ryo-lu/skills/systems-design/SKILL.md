---
name: systems-design
description: >
  Systems Design for Product — think through any product design problem at the system
  level, not the feature level. Use when the user wants to: structure a product's
  information architecture, decide what primitives to build, evaluate whether a design
  system is well-structured, figure out why a product feels incoherent, or says things
  like "how should I structure this product?", "we have too many features", "the design
  system doesn't scale", "things don't fit together", "what are the right building blocks?",
  "should this be a feature or a primitive?".
  Trigger domains: information architecture, design systems, product structure, primitives,
  building blocks, generalization, Notion-style systems, composability, scalability.
---

# Systems Design — Product Architecture Skill

The methodology for designing products at the system level — building generalizable
primitives that compose into emergent complexity.

**Persona context → read `../../SOUL.md`**
**Knowledge context → read `../../MEMORY.md`**

## The Core Principle

There are two ways to design a product:

**Feature-first:** Identify user problems → design specific solutions for each → add craft
and delight → ship. This produces a pile of features that doesn't add up to a coherent whole.

**System-first:** Understand the underlying structure → design the fewest concepts that do
the most things → let users compose them into the workflows they need. This produces a
product where new use cases emerge without new features.

Notion is the canonical example: pages, databases, blocks. Three concepts. Millions of use
cases. The blocks compose. The system is the product.

---

## Phase 1: Understand the Problem Space

Before designing anything:

**Q1: What category of tool is this?**
- Single-purpose (optimized for one workflow) vs. general-purpose (composable for many)
- For single-purpose: design specific solutions. For general-purpose: design the system.
- Most products start single-purpose and become general-purpose as they grow. Design for
  the trajectory you intend.

**Q2: What are the user's mental models?**
What do people already understand? What are they bringing from other tools? Where are the
conceptual gaps between what they know and what the product requires?

A well-designed system meets users at their existing mental models and extends them, rather
than requiring entirely new ones. "We want you to get things that are useful out of the box
without having to understand how databases work."

**Q3: Who is the full spectrum of users?**
From the most novice to the most expert. The system needs to:
- Give novices something useful without overwhelming them
- Give experts the full power without hiding it
- Allow users to move along the spectrum without hitting walls

---

## Phase 2: Find the Primitive Set

The goal: fewest concepts that do the most things.

**Step 1: List all the things users want to do**
Comprehensive. Don't filter. Every workflow, every use case, every request in the backlog.

**Step 2: Find the underlying patterns**
What are these use cases *really*? Strip away the surface presentation. Most product
requests are expressions of a few deeper needs:
- "I want to see my data this way" → a view primitive
- "I want to relate these things" → a relationship primitive
- "I want to automate this action" → an automation primitive

**Step 3: Design the primitive, not the feature**
Instead of "calendar view," design a view primitive that can be calendars, tables, boards,
galleries. Instead of "tags," design a property primitive that can be tags, statuses,
relations, formulas.

The test: can this primitive be composed with others to produce the feature? If yes, design
the primitive. If the primitive approach would be too complex for the user to operate,
design a pre-built composition with the primitive underneath.

**Step 4: Check composability**
- Can primitives A and B be composed in a way that produces something neither can do alone?
- Does the combination follow naturally from understanding A and B individually?
- Is there a use case the user would discover naturally by using the system?

---

## Phase 3: Design the Conceptual Layer

Figma components handle visual consistency. The conceptual layer handles:
- How concepts are named (names should match mental models, not implementation)
- How concepts relate to each other (the grammar of the system)
- What the user needs to understand to use the system powerfully
- What the user can ignore and still get value

**The two-level model:**
- Level 1 (surface): what users get immediately, without understanding the system
- Level 2 (power): what users access when they want to go deeper

The goal is never to hide Level 2 — it's to make Level 1 genuinely useful so that users
who don't need Level 2 aren't blocked, while users who want Level 2 can find and use it.

---

## Phase 4: Allow for Chaos

**The slack test:**
- What happens if a user uses these primitives in a way you didn't intend?
- Does the system accommodate unexpected combinations?
- Where are the edges? Have you tested them?

"Great systems flirt with chaos." The sign of a well-designed system is that users discover
use cases the designers didn't plan. If every use of the system is exactly what was intended,
the system may be too constrained.

Find the chaos edge: build compositions that push the limits. Understand where the system
breaks down. Then pull back to just inside that edge. The productive zone is as close to
chaos as possible while remaining coherent.

---

## Design System Checklist

```
Visual layer:
□ Core components defined with clear variants
□ Token system (color, spacing, type) applied consistently
□ Component states documented (hover, active, disabled, loading, error, empty)
□ Figma system maps to code system

Conceptual layer:
□ System concepts have names that match user mental models
□ New users can get value without understanding the full system
□ Expert users can access full power without UI friction
□ Unexpected combinations produce coherent results
□ The system has been tested at its edges

Culture:
□ "Final design" is understood not to exist
□ Iteration is planned, not embarrassing
□ Engineers understand the conceptual layer, not just the components
□ Feedback loops are built in (not just scheduled)
```

See `references/primitives-guide.md` for a taxonomy of common primitive types and
composition patterns.

---

*Operationalizes the systems-first design methodology from `../../SOUL.md`. For the full
Notion building-blocks case study, see `../../MEMORY.md`.*
