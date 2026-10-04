---
title: Collector CLI
description: Run the proxy for a tenant and collect environment context with the tessera CLI.
order: 1
---

# Collector CLI

The `tessera` CLI starts a proxy for one tenant and runs the environment analyzer.

## Run a tenant

```bash
tessera project <TENANT_ID>
```

The tenant ID is 1 to 40 characters of letters, digits, `_` or `-`.

## Collect environment context

```bash
tessera --analyze-env --project-id <PROJECT_ID> --api-url https://<CONTROL_PLANE_HOST>
```

This runs nmap, nuclei, trivy, httpx and lynis, redacts the output and sends the report to the control plane. It never uploads source files.

| Option | Meaning |
|---|---|
| `--analyze-env` | Run the environment analyzer with every tool enabled. |
| `--tenant <id>` | Tenant to analyze. Default: `TENANT_ID` from `source/.env`. |
| `--target <target>` | `http(s)` URL, hostname or IP to scan. Repeatable. Default: the local proxy. |
| `--project-path <path>` | Project directory for the Trivy scan. Default: the current directory. |
| `--nuclei-rate-limit <rps>` | nuclei requests per second. |
| `--output <file>` | Also save the JSON report to this file. |
| `--api-url <url>` | Control plane base URL. Env: `TESSERA_API_URL`. |
| `--project-id <id>` | The project's 24-character hex ID. Env: `TESSERA_PROJECT_ID`. |
| `--no-send` | Do not send the report. |
| `--disable-<tool>` | Skip one of `nmap`, `nuclei`, `trivy`, `httpx`, `lynis`. |

Sending needs `TESSERA_API_KEY` (a collector key with `environment-snapshots:write`) in `.env`. Without it the report is not sent.

## How the control plane uses it

The report becomes an environment snapshot: one immutable, redacted result for a tenant. Analyses use the latest snapshot. Without one, analyses still run and say they had no environment context.
