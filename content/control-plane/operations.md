---
title: Telemetry and alerts
description: Heartbeats, redacted telemetry and operational alerts.
order: 3
---

# Telemetry and alerts

Telemetry is best-effort and redacted. It never changes bundle distribution or runtime decisions.

## Heartbeat

A proxy reports its loaded versions, supported bundle schemas and tool registries, and health to `POST /api/v1/proxy/heartbeats`. The dashboard uses it to show `restart required`, incompatible proxies and stale heartbeats. A heartbeat is display state only.

## Telemetry

A proxy sends batched `tessera.telemetry/v1` windows to `POST /api/v1/proxy/telemetry` with a deployment key that has `telemetry:write`. A window is one UTC minute of counters and gauges for one tenant, reported against the bundle version the proxy has loaded.

- Endpoints are identified only by the policy endpoint keys of the loaded bundle. Requests that match no endpoint are reported as one aggregate, never by raw path.
- A retried `batchId` is applied once.
- Telemetry excludes raw request bodies, field values, authorization headers and cookies.
- It is kept 48 hours at minute granularity and 90 days at hour granularity.
- Each project has an hourly quota, set by `TELEMETRY_QUOTA_ENTRIES_PER_TENANT_HOUR`.

## Dashboard views

The dashboard reads these resources under `/api/v1/organizations/<ORGANIZATION_ID>/projects/<TENANT_ID>/`:

- `operations`
- `telemetry`
- `alerts`
- `alert-settings`

## Alerts

Alerts are evaluated every minute from heartbeats and telemetry. They open and resolve automatically, are visible only in the dashboard, and never affect distribution or enforcement. The attack-rate alert stays off until you set a threshold.
