---
title: Local development
description: Run the control plane backend on your machine.
order: 4
---

# Local development

The control plane backend is a NestJS service.

```bash
docker compose up -d --wait   # MongoDB (single-node replica set) and Redis
cp .env.example .env
npm install
npm run start:dev
```

The API listens on `http://localhost:5000/api/v1`. Swagger is at `http://localhost:5000/api/v1/docs` when `SWAGGER_ENABLED=true`.

On macOS, port 5000 is often taken by the AirPlay Receiver. Set `PORT` in `.env` if the API fails with `EADDRINUSE`.

## Docker

Fill in `.env`, then run from the dashboard repository root:

```bash
npm run backend:docker          # build and run API + MongoDB + Redis
npm run backend:docker:detach   # same, in the background
npm run backend:docker:down     # stop everything
```

The containerized API listens on `http://localhost:5050/api/v1`. Override the port with `API_PORT`.

By default `docker-compose.yml` runs only the dependencies, bound to loopback. The API container uses the `app` profile. `docker compose down` stops them; add `-v` to delete their data.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
```

> [!NOTE]
> This backend has no automated tests by project decision. Validate changes with linting, type checking, building and focused manual checks.
