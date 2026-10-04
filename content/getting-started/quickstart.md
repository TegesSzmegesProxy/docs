---
title: Quickstart
description: Start a Tessera proxy for one tenant.
order: 2
---

# Quickstart

This page starts a proxy for one tenant. The proxy needs a signed bundle, so you activate a policy in the dashboard first.

## Before you start

You need:

- a project (tenant) in the dashboard, with its 24-character ID;
- an activated policy using the `tessera.bundle/v2` schema;
- a deployment key with the scopes `bundles:read`, `jev-credentials:read`, `heartbeats:write` and `telemetry:write`;
- the Ed25519 public key that matches the control plane's bundle signing key;
- a Redis instance.

> [!NOTE]
> A bundle activated earlier as v1 must be reactivated with explicit decision settings to produce v2.

## Configure

Copy `.env.example` to `.env` in the proxy repository and set:

```bash
TENANT_ID=<TENANT_ID>
DASHBOARD_API_URL=https://<CONTROL_PLANE_HOST>/
DEPLOYMENT_API_KEY=<DEPLOYMENT_API_KEY>
BUNDLE_PUBLIC_KEY=<ED25519_PUBLIC_KEY_PEM>
BUNDLE_CACHE_FILE=./data/active-bundle.json
REDIS_URL=redis://localhost:6379
PORT=62197
```

See [Proxy configuration](../proxy/configuration.md) for each variable.

## Run

```bash
npm install
npm run dev
```

Or start one tenant through the CLI:

```bash
tessera project <TENANT_ID>
```

Tessera pulls the active bundle, verifies its signature and content hash, then opens the ingress port. If it cannot get a verified bundle, it exits without opening the port ([First start](../proxy/startup-and-recovery.md)).
