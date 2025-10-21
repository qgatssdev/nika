## Nika Server

NestJS · TypeScript · REST API

---

### 1 · Quick start

```bash
yarn install
yarn start:dev          # dev server → http://localhost:3000

# quality gates
yarn lint
yarn test
```

Swagger docs are available at `/docs`.

Global API prefix is `/api` and URI versioning is enabled. Example: `/api/v1/...`.

---

### 2 · Project layout

```
src/
 ├─ main.ts                 # app bootstrap (global prefix, versioning, pipes, CORS, swagger)
 ├─ app.module.ts           # root module wiring
 │
 ├─ modules/                # business domains
 │   ├─ auth/               # authentication, users, repositories
 │   ├─ referral/           # referral network, earnings & claims
 │   └─ trade/              # trade webhook processing
 │      ├─ controllers/     # Nest controllers (HTTP layer)
 │      ├─ services/        # domain services (business logic)
 │      └─ dto/             # request/response DTOs (class-validator)
 │
 ├─ libs/                   # cross‑cutting concerns (guards, constants, base classes)
 └─ infra/                  # infrastructure helpers
```

Guidelines

1. Controllers stay thin. They validate input and delegate to services.
2. Business logic lives in services; persist via repositories.
3. DTOs use `class-validator` for input validation.
4. Cross‑cutting concerns (guards, interceptors, constants) go under `src/libs`.

---

### 3 · API versioning & prefix

- Global prefix: `/api`
- Versioning: URI-based, e.g. `/api/v1/*` (see `main.ts`).

---

### 4 · Key endpoints (excerpt)

Trade

```
POST /api/v1/trade/webhook
Body: {
  userId: string (uuid),
  volume: number,         // trade notional (USD)
  fees: number,           // total fees collected
  tokenType: TokenTypeEnum
}
```

Referral (protected by `AuthGuard` where noted)

```
POST /api/v1/referral/generate      (Auth)
POST /api/v1/referral/register
GET  /api/v1/referral/network       (Auth)
GET  /api/v1/referral/earnings      (Auth)
POST /api/v1/referral/claim         (Auth)
```

Swagger docs show the full contract and examples.

---

### 5 · Example: Trade webhook flow

1. Controller (`trade.controller.ts`) receives POST `/api/v1/trade/webhook` with `TradeWebhookDto`.
2. Service (`trade.service.ts`) validates user, computes fee rate, and delegates referral fee breakdown to `ReferralService`.
3. Commission records and wallet updates are performed transactionally.

Minimal cURL

```bash
curl -X POST http://localhost:3000/api/v1/trade/webhook \
  -H 'Content-Type: application/json' \
  -d '{
        "userId": "00000000-0000-0000-0000-000000000000",
        "volume": 100000,
        "fees": 1000,
        "tokenType": "USDT"
      }'
```

---

### 6 · Env variables (excerpt)

| key            | purpose                  |
| -------------- | ------------------------ |
| `PORT`         | HTTP port (default 3000) |
| `DATABASE_URL` | Database connection URL  |
| `JWT_SECRET`   | JWT signing secret       |

Create an `.env` (or `.env.local`) and ensure the process manager loads it.

---

### 7 · Scripts

| script      | purpose               |
| ----------- | --------------------- |
| `start`     | start in production   |
| `start:dev` | start with watch mode |
| `build`     | compile TypeScript    |
| `lint`      | run eslint            |
| `test`      | unit tests            |
| `test:e2e`  | e2e tests             |
| `test:cov`  | coverage              |

---

### 8 · Conventions

- Use DTOs with validation for every incoming payload.
- Throw Nest `HttpException` subclasses for error cases.
- Keep modules independent; share only via `libs/` or explicit exports.
- Prefer transactional writes for multi-entity updates (TypeORM `EntityManager`).

---

Happy building 🚀

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
