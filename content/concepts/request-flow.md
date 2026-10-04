---
title: Request flow
description: What Tessera does with one request, from ingress to decision.
order: 1
---

# Request flow

Every request follows the same path. Only the decision step can block it.

```text
ingress -> normalize -> static analysis (tools) -> sampling -> JEV -> decision -> upstream
```

## 1. Match the endpoint

The proxy removes `routing.pathPrefix`, then matches `METHOD /path` against the endpoints of the loaded policy. `:name` matches exactly one nonempty path segment. Paths are matched without decoding, and a trailing slash is significant.

A request that matches no endpoint gets the tenant's `unknownEndpointBehavior`: `allow` or `block`.

## 2. Normalize

The request becomes a normalized request: the canonical, parsed form that every tool reads. Field targets are `body.<field>` or `query.<field>`. File targets name the upload field.

## 3. Static analysis

The endpoint's tools run. Each tool is deterministic and returns one result. Tessera aggregates them into a static verdict with this priority:

`ERROR` > `POLICY_VIOLATION` > `SUSPICIOUS` > `SAFE`

| Static verdict | Meaning | What happens next |
|---|---|---|
| `POLICY_VIOLATION` | A deterministic rule broke (type, length, schema). | `BLOCK`. |
| `ERROR` | A tool could not decide. | The tenant's `onStaticAnalysisError` action (`allow` or `block`). |
| `SUSPICIOUS` | A heuristic or attack pattern matched and may be benign. | Always sent to JEV. |
| `SAFE` | Checked and clean. | Sampled: a share goes to JEV, the rest is allowed. |

A tool never returns `SAFE` when it could not evaluate the input.

## 4. Sampling

For a `SAFE` request, Tessera draws against the sampling percentage N. A sampled request goes to [JEV](./jev.md). An unsampled request is allowed with the reason "static analysis safe, not sampled".

## 5. JEV and the threshold

JEV returns an attack probability. Tessera compares it with the effective threshold T. Strictly above T is `ATTACK` and the request is blocked. Otherwise it is `BENIGN` and the request is allowed.

If JEV cannot answer, the tenant's configured action applies:

| Situation | Setting |
|---|---|
| `SUSPICIOUS` request, JEV unavailable | `onSuspiciousJevUnavailable` |
| Sampled `SAFE` request, JEV unavailable | `onSampledJevUnavailable` |

An invalid JEV result is treated as unavailable. Nothing is fed back to the attack rate when there is no classification.

## 6. Decision

The decision is `ALLOW` or `BLOCK`, recorded with the policy version. Only `ALLOW` is forwarded to the upstream.
