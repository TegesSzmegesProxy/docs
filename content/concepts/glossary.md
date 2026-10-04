---
title: Glossary
description: The terms used across Tessera.
order: 6
---

# Glossary

## Runtime

| Term | Meaning |
|---|---|
| Tenant | One protected application and its configuration, policies and state. The dashboard calls it a project. |
| Proxy (data plane) | The deployable on your server that enforces policy. |
| Upstream | The protected application behind Tessera. |
| Normalized request | The canonical, parsed form of a request used by analysis. |
| Tool | A deterministic check that produces a tool result. |
| Tool contract | A tool's ID, metadata and configuration schema, shared by the proxy and the control plane. |
| Tool registry | The versioned set of tool contracts the proxy executes (`tessera.tools/v2`). |
| Static verdict | The aggregated tool result: `SAFE`, `SUSPICIOUS`, `POLICY_VIOLATION` or `ERROR`. |
| JEV | The external classification model that scores a request. Not a conversational LLM. |
| Attack probability | JEV's P(yes) to "is this request an attack attempt?". It alone decides enforcement. |
| Sampling (N) | The percentage of `SAFE` requests sent to JEV. |
| Threshold (T) | The attack probability above which a request is an attack. It has a floor, `T_floor`. |
| Threshold controller | Turns the tenant's threshold into the effective threshold and classifies a probability as `ATTACK` or `BENIGN`. |
| Pattern match | A static tool hit passed to JEV as a hint. Not a finding. |
| Decision | The final `ALLOW` or `BLOCK`, recorded with the policy version. |
| Attack rate | The share of JEV-classified requests classified as `ATTACK`. |
| EWMA | The exponentially weighted moving average that smooths attack-rate observations. |
| Failure behavior | The tenant-configured action when Tessera, static analysis or JEV fails. |

## Control plane

| Term | Meaning |
|---|---|
| Organization | A customer account that owns users, projects and credentials. |
| Control plane | The hosted dashboard and API. Never in the request path. |
| Collector | The CI step or CLI that uploads redacted environment results. |
| Deployment key | A revocable credential a proxy uses to pull bundles and report. |
| Collector key | A revocable credential limited to analysis uploads. |
| JEV credential | The organization's write-only JEV API key, stored encrypted. Never part of a bundle. |
| Repository binding | The one GitHub repository assigned to a project. |
| Analysis | An immutable interpretation of a commit of the bound repository. |
| Analysis sandbox | The disposable, network-less container in which one analysis runs. |
| AI read manifest | The record of which paths and line ranges an analysis sent to the AI provider. |
| Environment snapshot | One immutable, redacted result of the environment tools for a tenant. |
| Work item | One candidate route an analysis must resolve. |
| Coverage gate | Every work item is resolved explicitly, or the analysis is `partial`. |
| Policy version | Immutable human intent plus its validated structured form and compilation state. |
| Endpoint policy | One endpoint of a policy version. |
| JEV context | Bounded free text that tells JEV what an endpoint or field is for. |
| Compiled policy | A policy translated into registered tool IDs and validated configuration. |
| Activation | The atomic selection of an approved, compiled version for distribution. |
| Active bundle | The signed, immutable unit distributed to a proxy. |
| Active version | The bundle selected for distribution. |
| Loaded version | The verified bundle a proxy currently uses. |
| Restart required | Loaded version differs from the active version. Proxies never hot-swap. |
| Last known good | The most recent verified bundle a proxy saved locally. |
| Heartbeat | A proxy's periodic report of versions and health. |
| Telemetry | Best-effort redacted proxy health and aggregate decision data. |
| Operational alert | A dashboard notification derived from heartbeats and telemetry. |
