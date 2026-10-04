---
title: Configuration
description: Environment variables and policy addressing rules for the proxy.
order: 1
---

# Proxy configuration

Copy `.env.example` to `.env` and set these variables.

| Variable | Meaning |
|---|---|
| `TENANT_ID` | The 24-character MongoDB ObjectId issued by the dashboard. |
| `DASHBOARD_API_URL` | Dashboard API origin. Add a trailing slash if it has a base path. |
| `DEPLOYMENT_API_KEY` | Deployment key with the scopes `bundles:read`, `jev-credentials:read`, `heartbeats:write` and `telemetry:write`. |
| `BUNDLE_PUBLIC_KEY` | Trusted Ed25519 public key in PEM form. Literal `\n` separators are accepted. |
| `BUNDLE_CACHE_FILE` | Writable location for the verified bundle. |
| `REDIS_URL` | Runtime cache connection address. Redis failure does not stop enforcement. |
| `PORT` | Ingress port. Default `62197`. |

Never commit real keys. Use placeholders such as `<DEPLOYMENT_API_KEY>` in shared files.

## Policy addressing

- Endpoint keys use `METHOD /path`.
- `:name` matches exactly one nonempty path segment.
- `routing.pathPrefix` is removed before policy matching and before the request is forwarded upstream.
- Paths are matched without decoding.
- A trailing slash is significant.
- Field targets are `body.<field>` or `query.<field>`. File targets name the upload field.

## Runtime decision settings

Bundle v2 carries the decision settings explicitly: sampling bounds, the JEV threshold and floor, and separate actions for static-analysis errors and unavailable JEV. `failureBehavior` alone does not define them. See [Bundles](../concepts/bundles.md).
