# **PeremohaSports - Gym Management System**

## **Project Overview:**

**PeremohaSports** is a **gym management system** that provides convenient tools for recording and managing data about the gym, rooms, class types, qualifications, memberships, attendance etc. The system is designed to facilitate administration and improve the\*efficiency of gyms through comprehensive analysis and monitoring of their activities. It also provides convenience for customers, enabling them to effectively manage their gym experience and track their progress.

### **Team Members:**

- **[Anna Kuts](https://github.com/AnnKuts)**

- **[Mariia Khorunzha](https://github.com/Impe11e)**

- **[Mykhailov Vladyslav](https://github.com/taitami)**

### **Contribution of Each Team Member:**

For a detailed overview of each team member's contributions to the project, refer to [Contribution of Each Team Member](./docs/CONTRIBUTIONS.md).

## **Technology stack:**

- **Programming language:** TypeScript 5.9.3 / Node.js 25.1.0
- **Framework:** Express 5.1.0
- **Database:** PostgreSQL (version not specified, probably 16)
- **ORM:** Prisma 6.19.0
- **Validation:** Zod 3.24.1
- **Authentication:** JWT (jsonwebtoken 9.0.3)
- **Testing:** Vitest 4.0.6 + Supertest 7.1.4
- **Containerization:** Docker + Docker Compose

## **Setup instructions**

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd course-work
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Configuration:**
    - Copy `.env.example` to `.env`:

      ```bash
      cp .env.example .env
      ```

      [View .env.example](./.env.example)

    - Copy `.env.test.example` to `.env.test` (for testing):
      ```bash
      cp .env.test.example .env.test
      ```
      [View .env.test.example](./.env.test.example)

4.  **Database Setup:**
    - Start the database using Docker Compose:
      ```bash
      docker compose -f ../docker-compose.yml --env-file .env up -d
      ```
    - Apply migrations:
      ```bash
      npx prisma migrate deploy
      ```
    - Seed the database (optional):
      ```bash
      npx prisma db seed
      ```

## **Launching the application**

- **Development mode:**

  ```bash
  npm run dev
  ```

- **Development mode (full setup):**
  For a fresh start with Docker, migrations, and seeds:
  ```bash
  npm run dev:full
  ```

## **Running tests**

- **Run all tests:**

  ```bash
  npm test
  ```

- **Run integration tests:**

  ```bash
  npm run test:i
  ```

- **Run unit tests:**
  ```bash
  npm run test:u
  ```

## **Project structure**

```
course-work/
├── .env                      # Environment variables for docker.compose.yml and application
├── .env.test                 # Environment variables for docker.compose.test.yaml
├── docs/                     # Documentation
│   ├── APIs.md               # API documentation
│   ├── CONTRIBUTIONS.md      # Contribution guide
│   ├── queries.md            # Complex queries with explanations
│   └── schema.md             # Database schema description
│
├── migrations/               # Database migrations
│   ├── 20251204145401_init
│   ├── 20251204150440_add_feedback_table
│   ├── 20251204153513_rename_disposable_field
│   ├── 20251204153832_drop_comment_column
│   ├── 20251204154117_drop_feedback_table
│   ├── 20251213130828_add_soft_deleting
│   ├── 20251216113350_class_type_name_to_string
│   └── migration_lock.toml
│
├── prisma/                   # Prisma setup
│   ├── schema.prisma         # Prisma database schema
│   └── seed.ts               # Initial data for seeding
│
├── src/                      # Source code
│   ├── api/                  # API routes
│   │   ├── emojis.ts         # Emoji API
│   │   └── index.ts          # Main API entry
│   │
│   ├── controllers/          # Controllers for business logic
│   │   ├── attendance.controller.ts
│   │   ├── auth.controller.ts
│   │   ├── classTypes.controller.ts
│   │   ├── clients.controller.ts
│   │   ├── gym.controller.ts
│   │   ├── memberships.controller.ts
│   │   ├── payments.controller.ts
│   │   ├── register.controller.ts
│   │   ├── room.controller.ts
│   │   ├── session.controller.ts
│   │   └── trainer.controller.ts
│   │
│   ├── repositories/           # Repositories for data access
│   │   ├── attendance.repository.ts
│   │   ├── classType.repository.ts
│   │   ├── clients.repository.ts
│   │   ├── gym.repository.ts
│   │   ├── memberships.repository.ts
│   │   ├── payments.repository.ts
│   │   ├── register.repository.ts
│   │   ├── room.repository.ts
│   │   ├── session.repository.ts
│   │   ├── trainer.repository.ts
│   │   └── shared.repository.ts
│   │
│   ├── routes/                 # API routes definitions
│   │   ├── attendance.routes.ts
│   │   ├── auth.routes.ts
│   │   ├── classTypes.routes.ts
│   │   ├── clients.routes.ts
│   │   ├── gymRoutes.ts
│   │   ├── memberships.routes.ts
│   │   ├── payments.routes.ts
│   │   ├── register.routes.ts
│   │   ├── room.routes.ts
│   │   ├── session.routes.ts
│   │   └── trainer.routes.ts
│   │
│   ├── schemas/                # Validation schemas
│   │   ├── attendance.schema.ts
│   │   ├── auth.schema.ts
│   │   ├── classType.schema.ts
│   │   ├── clients.schema.ts
│   │   ├── common.ts
│   │   ├── email.schema.ts
│   │   ├── gym.schema.ts
│   │   ├── memberships.schema.ts
│   │   ├── payments.schema.ts
│   │   ├── room.schema.ts
│   │   ├── session.schema.ts
│   │   └── trainer.schema.ts
│   │
│   ├── services/               # Business logic services
│   │   ├── attendance.service.ts
│   │   ├── auth.service.ts
│   │   ├── classTypes.service.ts
│   │   ├── clients.service.ts
│   │   ├── email.service.ts
│   │   ├── gym.service.ts
│   │   ├── memberships.service.ts
│   │   ├── payments.service.ts
│   │   ├── register.service.ts
│   │   ├── room.service.ts
│   │   ├── session.service.ts
│   │   ├── trainer.service.ts
│   │   └── ...
│   │
│   ├── types/                  # Types for the project
│   │   ├── enum-types.ts
│   │   └──  requests.ts
│   │
│   ├── utils/                  # Utility files
│   │   ├── AppError.ts
│   │   ├── async-handler.ts
│   │   ├── error-handler.ts
│   │   ├── handlePrismaError.ts
│   │   └── responses.ts
│   │
│   ├── integration/            # Integration tests
│   │   ├── attendance.test.ts
│   │   ├── classType.test.ts
│   │   ├── clearTestData.ts
│   │   ├── example.test.ts
│   │   ├── gyms.test.ts
│   │   └──  rooms.test.ts
│   │
│   ├── unit/                   # Unit tests
│   │   ├── attendance.test.ts
│   │   ├── classTypes.test.ts
│   │   ├── example.test.ts
│   │   ├── gyms.test.ts
│   ├── └── rooms.test.ts
│
├── .gitignore                 # Files and directories to be ignored
├── Dockerfile                 # Docker container configuration
├── .eslint.config.mjs         # ESLint configuration
├── package-lock.json          # Lock file for dependencies
├── package.json               # Project dependencies
├── prisma.config.ts           # Prisma configuration
├── README.md                  # Main project documentation
├── tsconfig.json              # TypeScript configuration
├── vitest.config.ts           # Vitest configuration
└── vitest.integration.ts      # Integration tests configuration for Vitest
```

## **Database structure overview**

For a detailed overview of the database schema, refer to [Database Schema Documentation](./docs/schema.md).

## **API/usage examples**

For a detailed overview of each API endpoint and its usage, refer to [API Endpoints Documentation](./docs/APIs.md).
