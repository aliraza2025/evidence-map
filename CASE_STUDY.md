# Evidence Map — product case study

Stage: independent working prototype. No customer deployment or business impact is claimed.

## Problem

AI-generated research summaries can lose the path back to what participants actually said. Prioritization then looks more certain than the underlying evidence supports. A product decision should retain both its quotes and its assumptions.

## Contribution

Product framing, scope definition, workflow design, original implementation with AI assistance, deterministic validation, testing, documentation, and a public demo.

## Decisions and tradeoffs

1. Preserve exact text with stable source IDs inside an exported project.
2. Reject model outputs containing invented quote text or missing source references.
3. Present interpretations as hypotheses and preserve an explicit human review state.
4. Keep participant breadth separate from reach, impact, confidence, and effort. A few quoted observations are not a market-size estimate.
5. Keep unmatched evidence visible so the keyword baseline cannot quietly drop observations outside its vocabulary.

## Verification

9 automated tests cover source preservation, distinct participant-label counts, unmatched observations, fabricated quotes and IDs, invalid imports and assumptions, export qualifications, HTTP behavior, and the model adapter contract. Browser review-state changes and the downloaded discovery brief were checked. The initial sample is fictional and is not user research.

## What would validate the product next

Evaluate on permission-cleared interviews with independent researchers. Measure citation validity separately from interpretation quality, inspect contradictory evidence, and compare accepted hypotheses against a manual synthesis. Add semantic retrieval only if it improves useful coverage.
