---
title: JEV
description: The classification model behind sampled and suspicious requests.
order: 2
---

# JEV

JEV is an external classification model. It is not a conversational LLM. It scores a request and answers one question: is this request an attack attempt?

## What decides enforcement

Only the attack probability decides. It is JEV's P(yes) to that question, compared with the threshold T.

- Above T: `ATTACK`, the request is blocked.
- At or below T: `BENIGN`, the request is allowed.

JEV also returns a severity `score` and a `confidence` (`|2p-1|`). Both are informational and never decide a request.

## Sampling (N) and threshold (T)

N and T are independent settings.

| Setting | Meaning |
|---|---|
| Sampling (N) | The percentage of `SAFE` requests sent to JEV. Bounded by `minN` and `maxN` in the bundle. |
| Threshold (T) | The attack probability above which a request is an attack. Has a floor, `attackProbabilityFloor`, and a `locked` flag. |

The floor must not exceed the threshold. Unless the threshold is locked, the threshold controller can tighten T toward the floor while the attack rate is high. The attack rate is the share of JEV-classified requests classified as `ATTACK`, smoothed with an EWMA.

## Hints from static analysis

When a static tool matches, the match is passed to JEV as a hint, attributed to the field it matched. A pattern match is not a finding.

## Credential

The organization's JEV API key is stored encrypted in the control plane and is write-only in the dashboard. The proxy pulls it from `GET /api/v1/proxy/jev-credential` with a deployment key that has the `jev-credentials:read` scope. It is never part of a bundle. The proxy keeps the key in memory and keeps the previous key when a fetch fails.
