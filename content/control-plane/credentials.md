---
title: Credentials and access
description: Deployment keys, collector keys, the JEV credential and organization roles.
order: 2
---

# Credentials and access

## Machine keys

| Key | Used by | Scope |
|---|---|---|
| Deployment key | Proxy | Pull bundles for explicit tenants, report health and telemetry. |
| Collector key | Collector | Analysis uploads for explicit tenants. |

Keys are scoped to an organization, explicit tenants and capabilities. The control plane stores only key hashes and safe metadata. Plaintext is shown once, at creation or rotation. Keys can be rotated and revoked.

A stable `API_KEY_HASH_SECRET` is required. Changing it invalidates existing keys. Generate it independently for each deployment. Redis backs distributed rate limits, and its failure posture is required configuration with no default.

The `jev-credentials:read` deployment scope is opt-in.

## JEV credential

Owners and admins manage the organization's JEV API key:

```http
PUT    /api/v1/organizations/<ORGANIZATION_ID>/integrations/jev
GET    /api/v1/organizations/<ORGANIZATION_ID>/integrations/jev
DELETE /api/v1/organizations/<ORGANIZATION_ID>/integrations/jev
```

`PUT` takes `apiKey`. The key is encrypted with `CREDENTIAL_ENCRYPTION_KEY` and never returned to the dashboard. Without that variable, saving returns `503`. Generate the variable with `openssl rand -base64 32`.

A proxy fetches the key from `GET /api/v1/proxy/jev-credential`. A `404` means no credential is configured.

## Dashboard sign-in

The dashboard API accepts Auth0-issued bearer access tokens. Configure the issuer, API audience and MongoDB connection with `.env.example`.

Administrative mutations and their audit entries are committed in one transaction, so MongoDB must run as a replica set.
