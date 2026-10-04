---
title: Policies
description: How a policy is created, approved and activated.
order: 4
---

# Policies

A policy holds the rules for one tenant. It is versioned and immutable once written. Editing creates a new version.

## Lifecycle

```text
analysis or import
  -> schema validation
  -> compilation against the tool registry
  -> approval (or rejection)
  -> activation
  -> bundle signing
  -> proxy pull and verification
```

Each step is a separate, audited transition. Saving, generating or approving alone is not activation. Activation selects an approved, successfully compiled version and, in the same transaction, builds and signs an immutable bundle from it and the tenant's current runtime configuration.

> [!NOTE]
> Editing runtime configuration later does not change the distributed bundle until the policy is activated again.

A failed build, validation or signature never replaces the active bundle.

## Compilation

A compiled policy is expressed in registered proxy tool IDs and validated tool configuration. It is not executable code. An unknown tool is a compilation failure.

## Endpoint policies

An endpoint policy covers one endpoint of a policy version: its endpoint-level tools, JEV context, fields and human-readable policy.

- The human-readable policy is plain-language text an administrator can edit. It is never enforced. Editing it compiles it into that endpoint's structured policy.
- JEV context is bounded free text that tells JEV what the endpoint or field is for. It comes from untrusted repository content, is reviewed with the policy, and is given to JEV as data, never as instructions.

> [!WARNING]
> Natural language is imprecise. The reviewed structured policy, not the text, is what Tessera enforces. The dashboard shows this notice with every AI-generated or AI-edited policy version.

## Editing with AI

Owners and admins can edit a v1 policy version in natural language:

```http
POST /api/v1/organizations/<ORGANIZATION_ID>/projects/<TENANT_ID>/policies/<VERSION>/edits
```

The body has an `instruction`, and the request needs an `Idempotency-Key`. It returns `202` with the attempt. Poll `GET .../policy-generations/<ATTEMPT_ID>`. AI output is validated and compiled. A successful attempt references a new pending version that still needs approval and activation. A failed attempt creates no version.

## Review mode

Chosen per analysis before it runs:

- `review` leaves the proposed policy version pending.
- `auto_apply` approves it as a standing approval when it compiled and nothing needs review.

## Tuning settings

Project tuning settings are model settings, policy defaults and endpoint overrides. They are inputs only. Saving them creates no policy version and changes no bundle. Constraints that contain a detectable credential are rejected with `422`.
