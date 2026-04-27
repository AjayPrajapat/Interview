# Validation Questions: Evidence Collection

## Conceptual Questions

1. What problem does Evidence Collection solve in Data Privacy?
2. What internal mechanism or flow makes it work?
3. What assumptions does it rely on?
4. What edge cases are most likely to appear in production?
5. What is the difference between a local implementation concern and an architecture concern for this topic?

## Scenario Questions

1. A production issue appears only under high traffic. How would you investigate Evidence Collection?
2. A retry causes duplicated work. What safeguards should exist?
3. A deploy changes behavior for only some users. What compatibility or rollout issue might explain it?

## Prediction Questions

1. What output, state change, or user-visible behavior do you expect when input is empty, duplicated, or stale?
2. What metric would move first if Evidence Collection became the bottleneck?

## Mastery Prompt

Explain Evidence Collection from beginner level to staff level in under five minutes, including one code-level detail and one production trade-off.
