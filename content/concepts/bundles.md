---
title: Bundles
description: The signed, immutable unit that carries policy to a proxy.
order: 3
---

# Bundles

An active bundle is the signed, immutable unit a proxy pulls. It combines one tenant's runtime configuration and compiled policy under one version. The current schema is `tessera.bundle/v2`.

## Contents

- `schemaVersion`, `tenantId` and a content-derived `version`.
- Runtime configuration:
  - `upstreamUrl` (`http` or `https`, no credentials in the URL);
  - `routing.pathPrefix`;
  - `failureBehavior` and `unknownEndpointBehavior`, each `allow` or `block`;
  - `thresholds.requestTimeoutMs` (100 to 120000) and `thresholds.maxRequestBodyBytes` (0 to 104857600);
  - `samplingRate` and the `decision` block: sampling bounds `minN` and `maxN`, the JEV `attackProbabilityThreshold`, `attackProbabilityFloor` and `locked`, plus `onStaticAnalysisError`, `onSuspiciousJevUnavailable` and `onSampledJevUnavailable`.
- The compiled policy: endpoints, each with 1 to 100 steps, and the tool registry version.
- Activation metadata and an Ed25519 signature over the canonical bundle bytes.

Secrets never belong in a bundle.

## Verification

The proxy verifies the signature, schema version, expected tenant, full contract, tool IDs and tool configurations before it persists or uses a bundle. It rejects the whole bundle, and keeps its last known good one, when any step:

- names an unknown tool;
- uses another context type than the tool's contract;
- has a missing or malformed target;
- has a configuration that breaks the contract, including unknown settings.

## Distribution

```text
GET /api/v1/tenants/:tenantId/active-bundle
```

The proxy authenticates with a deployment key. It declares the bundle schemas and tool registries it supports in the `Tessera-Bundle-Schemas` and `Tessera-Tool-Registries` headers, and polls with `If-None-Match`.

The proxy checks for a newer bundle once per minute. It never changes the active policy while handling requests. When a newer bundle exists, it reports that a restart is needed, and a restart loads the active version.

## Versions

| Term | Meaning |
|---|---|
| Active version | The bundle the control plane selected for distribution. |
| Loaded version | The verified bundle a proxy process currently uses. |
| Restart required | Shown in the dashboard when a compatible proxy's loaded version differs from the active version. |
| Last known good | The most recent verified bundle the proxy saved locally. |

Existing v1 bundles stay immutable and serve compatible proxies. `tessera.tools/v1` bundles are still accepted and may only use `string_length`.

## Signing

The control plane signs with an Ed25519 key supplied as a PKCS#8 PEM in `BUNDLE_SIGNING_PRIVATE_KEY`. It refuses to start without a valid key. To create a development key and the public key a proxy needs:

```bash
openssl genpkey -algorithm ed25519 -out bundle-signing.pem
openssl pkey -in bundle-signing.pem -pubout
```
