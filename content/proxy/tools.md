---
title: Tools
description: The tool registry, verdicts and how a policy configures a tool.
order: 3
---

# Tools

A tool is a deterministic check. It runs on one context and returns one result. The proxy executes the tools of the registry `tessera.tools/v2`: 149 tools, listed with their configuration schemas in `docs/tool-registry.json` in the proxy repository.

Each tool has a tool contract: its ID, display name, category, context type, description and a configuration schema. The proxy and the control plane compile policies against the same contracts.

## Categories

| Category | Tools |
|---|---|
| `injection` | 30 |
| `resource` | 25 |
| `auth` | 22 |
| `anomaly` | 19 |
| `schema` | 17 |
| `url` | 12 |
| `bot` | 11 |
| `protocol` | 9 |
| `data_leakage` | 4 |

## Context types

| Context | A tool receives | Tools |
|---|---|---|
| `field` | The value of one field. | 44 |
| `file` | File metadata: size, magic bytes, type. | 9 |
| `full` | The whole normalized request, including state across requests. | 96 |

## Verdicts

| Verdict | Meaning |
|---|---|
| `SAFE` | Checked and clean. |
| `SUSPICIOUS` | A match that may be benign. Goes to [JEV](../concepts/jev.md). |
| `POLICY_VIOLATION` | A deterministic rule broke. Hard block. |
| `ERROR` | The tool could not decide. |

A non-applicable input, such as a number given to a string check, is `SAFE`.

## Policy steps

A bundle configures a tool per endpoint step:

```json
{ "toolId": "enum_validation", "contextType": "field", "target": "body.currency", "config": { "values": ["PLN", "EUR"] } }
{ "toolId": "file_size", "contextType": "file", "target": "avatar", "config": { "maxBytes": 1048576 } }
{ "toolId": "string_length", "contextType": "field", "target": "body.username", "config": { "operator": "<=", "length": 32 } }
```

Whole-request tools take no target.

## Configuration and fixed rules

Configuration is what depends on your application or risk appetite: limits, time windows, allowlists, field names, secrets. Settings that describe the application have no default and must be set.

Not configurable: detection signatures, safety caps that bound the work a tool does on hostile input, and protocol rules HTTP defines. They are fixed by the registry version. Tools that only contain signatures take an empty configuration (`{}`).

## Stateful tools

21 tools look across requests (rate limits, brute force, replay and duplicate detection). They keep state in Redis under `tessera:{tenantId}:tools:{toolId}:{step}:`. Every proxy process of the tenant counts together, and an unchanged step keeps its windows across bundle updates and restarts. State never crosses tenants. While Redis is unavailable these tools report `ERROR`; they never fall back to `SAFE`.
