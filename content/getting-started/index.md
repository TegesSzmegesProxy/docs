---
title: Getting started
description: What Tessera is and how the pieces fit together.
order: 1
---

# What is Tessera

Tessera is a multi-tenant runtime security proxy. It sits in front of your application, checks each request against a signed policy, and forwards only the requests it allows.

Tessera has three deployables:

| Deployable | Runs | Job |
|---|---|---|
| Proxy (data plane) | On your server | Receives client traffic, decides `ALLOW` or `BLOCK`, forwards allowed requests to the upstream. |
| Control plane | Hosted | Dashboard and API: organizations, projects, keys, analysis, policies, bundles, telemetry. |
| Collector | Your CI or a CLI | Runs environment tools, redacts the output and uploads it. It never uploads source files. |

```text
Client traffic -> Proxy -> your application (upstream)

Proxy     -> Control plane   bundle pull, heartbeat, redacted telemetry
Collector -> Control plane   commit SHA + redacted environment results
```

The proxy and the collector always start the connection. The control plane never connects into your network, and it is not in the request path.

## Where to go next

- [Quickstart](./quickstart.md): start a proxy for one tenant.
- [Request flow](../concepts/request-flow.md): what happens to one request.
- [Bundles](../concepts/bundles.md): how policy reaches the proxy.
- [Glossary](../concepts/glossary.md): the terms used in these docs.
