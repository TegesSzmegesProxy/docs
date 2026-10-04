---
title: Application analysis
description: How the control plane analyzes a repository and proposes a policy.
order: 1
---

# Application analysis

An analysis is an immutable, versioned interpretation of a commit of the repository bound to a project. It contains the API surface, dependencies, environment context and findings with evidence.

## Starting an analysis

- A collector sends `POST /api/v1/tenants/<TENANT_ID>/analysis-uploads` with a collector key, an `Idempotency-Key` header and a `tessera.analysis-upload/v1` body. Only the commit SHA starts the analysis.
- An owner or admin starts one from the dashboard with `POST .../projects/<TENANT_ID>/analyses`. It analyzes the head of the bound repository's default branch.

## Steps

1. **Fetch.** The worker streams the commit from the bound GitHub repository into a per-job sandbox. The sandbox has no network and no credentials, and indexes the code for any language.
2. **Estimate.** Tessera estimates the cost and waits in `awaiting_budget`.
3. **Approve.** An owner or admin approves a ceiling with `POST .../analyses/<ANALYSIS_ID>/budget-approval` (`ceilingUsd`, `Idempotency-Key`). `PUT .../analysis-settings` can set an explicit auto-approve ceiling.
4. **Recon.** The recon agent writes route rules. The sandbox applies them to the whole repository to enumerate work items.
5. **Resolve.** One agent resolves each work item. A sweep looks for missed routes.
6. **Result.** Evidence-backed endpoint facts, a pending `tessera.policy/v2` proposal, coverage, cost and the AI read manifest.

## Coverage gate

Every work item ends as an endpoint, not an endpoint, a duplicate, or unresolved. An unresolved item makes the analysis `partial`. It is never silently dropped. Read them at `GET .../analyses/<ANALYSIS_ID>/work-items`.

The ceiling is enforced after every model response. When it is reached, the remaining work items are unresolved and the analysis is `partial`. An analysis paused because the provider account ran out of credit continues with `POST .../analyses/<ANALYSIS_ID>/resume`.

## What is sent to the AI provider

The sandbox is destroyed when the analysis ends. The AI read manifest records exactly which paths and line ranges were sent to the AI provider and how many values were redacted in them. Anything sent to the provider is redacted first.

## GitHub

Configure the GitHub App with read-only Contents and Metadata, and enable "Request user authorization during installation". The dashboard posts the setup callback's `installation_id` and `code` to `POST /api/v1/organizations/<ORGANIZATION_ID>/github-installations`, then binds one repository with `PUT .../projects/<TENANT_ID>/repository`.

## AI model

The deployment chooses the model in its environment. The dashboard cannot change it. One model serves analyses and policy edits.

| Variable | Meaning |
|---|---|
| `AI_MODEL` | The model name. |
| `ANTHROPIC_API_KEY` | Key for the Anthropic API. |
| `AI_BASE_URL` | Address of a self-hosted model with an Anthropic-compatible API. No key is sent to it and redirects are refused. It wins when both are set. |

Without a key or a URL, analyses and policy edits cannot run. `GET .../projects/<TENANT_ID>/analysis-readiness` shows the model, whether the sandbox is configured and any unfinished analysis. It never shows a key. `POST .../projects/<TENANT_ID>/ai-model/check` (owner or admin) sends one fixed prompt and returns `ok`, the latency or a safe error code.

The model key is never sent to proxies or included in a bundle.
