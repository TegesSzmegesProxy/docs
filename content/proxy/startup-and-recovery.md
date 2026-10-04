---
title: Startup and recovery
description: How the proxy starts, and what it does when the control plane is unreachable.
order: 2
---

# Startup and recovery

## First start

The proxy does not open its ingress port until it has verified a signed bundle, from the dashboard or from a verified last known good copy. If neither is available, startup exits with an error (ADR-0001).

Before its first successful pull, the proxy has neither the tenant's failure settings nor a trusted local copy, and an unsigned local policy cannot be trusted.

Consequences:

- First deployment needs a reachable dashboard and an activated compatible bundle.
- An outage during first deployment delays startup.
- An existing deployment can restart from its verified local copy.

## While running

The proxy pulls the active bundle at startup, verifies its Ed25519 signature and content hash, and keeps that immutable snapshot until restart. It writes a verified local copy to `BUNDLE_CACHE_FILE`.

| Event | Result |
|---|---|
| Control plane unreachable | The proxy keeps enforcing the loaded bundle. |
| Newer bundle available | The proxy reports that a restart is needed. It does not swap the policy. |
| Invalid bundle pulled | The proxy keeps its last known good bundle. |
| JEV credential fetch fails | The proxy keeps the previous key. |
| Redis unavailable | Enforcement continues. Tools that keep state in Redis report `ERROR`, and the tenant's static-analysis error action decides. |
