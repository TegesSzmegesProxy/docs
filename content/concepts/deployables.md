---
title: Deployables
description: The proxy, the control plane and the collector, and the boundaries between them.
order: 5
---

# Deployables

## Proxy (data plane)

Runs on your server and enforces policy. It never depends on the control plane in the request path. Once it has loaded a verified bundle, a control-plane outage does not interrupt enforcement.

The proxy also:

- checks for a newer bundle once per minute;
- refreshes the organization JEV credential once per minute;
- sends a heartbeat and redacted minute counters to the control plane.

Request content and secrets are not included in telemetry. If Redis fails, enforcement continues, but tools that keep state in Redis report `ERROR`.

## Control plane

Hosted. A NestJS backend and a dashboard frontend. It owns organizations, projects (tenants), credentials, application analysis, policy generation and compilation, approvals, activation, signed bundle distribution, redacted telemetry and audit history.

It never handles protected application traffic and never makes runtime `ALLOW` or `BLOCK` decisions. MongoDB is authoritative for state. Redis supports queues, rate limits, idempotency, caching and outbox coordination. Losing Redis must not corrupt durable state.

## Collector

A CI step or the `tessera` CLI. It runs environment tools, redacts their output and uploads it. It never uploads source files. See [Collector CLI](../collector/cli.md).

## Three API surfaces

Each surface authenticates and authorizes independently.

| Surface | Principal | Used for |
|---|---|---|
| Dashboard API | User access token (Auth0-issued bearer) | Organizations, projects, keys, analyses, policy lifecycle, operations views. |
| Collector API | Collector key | Analysis uploads and environment snapshots for assigned tenants. |
| Proxy API | Deployment key | Bundle pull, heartbeat, JEV credential, telemetry. |

Access is derived from the authenticated user or key, never from a client-provided organization or tenant ID.

## Tenants and projects

A tenant is one protected application with its isolated configuration, policies, analyses, bundles and telemetry. The dashboard calls it a project. Cross-system contracts and backend code use tenant.
