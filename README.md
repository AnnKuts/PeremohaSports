# 🏋🏻‍♂️ PeremohaSports
**PeremohaSports** is a backend application written in TypeScript for managing the data and business logic of a sports club. It provides structured RESTful API endpoints that allow tracking clients, memberships, payments, gym locations, trainers, rooms, scheduling, and attendance. The relational database is fully normalized up to the third normal form (3NF), ensuring data consistency and eliminating redundancy. All business processes are thoroughly described in the documentation, which also includes entity-relationship, usecase, sequence, activity, bpmn and component diagrams.

## Table of Contents
- [Features](#features)
- [Technology stack](#technology-stack)
- [Documentation](#documentation-)
- [Contact](#contact)

### Features
- Secure user authentication with OTP and role-based access control
- Full CRUD for clients, trainers, memberships, and sessions
- Payment processing and integration
- Management of gyms, rooms, trainers, and class scheduling
- Attendance tracking and session capacity enforcement
- Storing and linking trainer qualifications
- Relational database normalized to 3NF for data integrity
- Data validation powered by Zod for robust runtime guarantees
- Fully containerized with Docker for simplified setup and deployment
- Separate environments for development and testing
- Business processes and relationships are documented; PlantUML diagrams available in the repo


### Technology stack
<a href="https://www.typescriptlang.org/" target="_blank">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="45" height="45" alt="TypeScript" />
</a>
<a href="https://nodejs.org/" target="_blank">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="45" height="45" alt="Node.js" />
</a>
<a href="https://expressjs.com/" target="_blank">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" width="45" height="45" alt="Express.js" />
</a>
<a href="https://www.postgresql.org/" target="_blank">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" width="45" height="45" alt="PostgreSQL" />
</a>
<a href="https://www.prisma.io/" target="_blank">
  <img src="https://avatars.githubusercontent.com/u/17219288?s=200&v=4" width="45" height="45" alt="Prisma ORM" />
</a>
<a href="https://zod.dev/" target="_blank">
  <img src="https://raw.githubusercontent.com/colinhacks/zod/master/logo.svg" width="45" height="45" alt="Zod" />
</a>
<a href="https://vitest.dev/" target="_blank">
  <img src="https://vitest.dev/logo.svg" width="45" height="45" alt="Vitest" />
</a>
<a href="https://www.docker.com/" target="_blank">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" width="45" height="45" alt="Docker" />
</a>

### Documentation 
The documentation for the project can be found in the `docs` directory. This documentation covers all aspects of data modeling, business processes, and the theoretical and practical foundations of the backend.  **Note:** This documentation applies to the modeling and planning. The `server/` directory contains separate documentation and may differ from the primary project structure.


It includes:
- [requirements.md](/docs/requirements.md) - functional and data requirements of the system, business rules, description of entities, attributes, relationships.
- [ddl.md](/docs/ddl.md) - overview of the PostgreSQL database schema, including entity definitions, attributes, relationships, keys, and constraints.
- [otlp.md](/docs/otlp.md) - explains the Online Transaction Processing (OLTP) aspects: CRUD operations and typical SQL queries for day-to-day interactions with the data. Example queries and result screenshots included.
- [olap.md](/docs/olap.md) - describes the Online Analytical Processing (OLAP) aspects: complex queries for data analysis, reporting, and decision-making. Example queries and result screenshots included.
- [migration-notes.md](/docs/migration-notes.md) - details the database migration process using Prisma Migrate, including steps taken, challenges faced, and solutions implemented.
- [interfaces.ts](/docs/interfaces.ts.md) - documents the TypeScript interfaces used in the backend application, detailing their structure and purpose.
> For server-specific details, see [documentation](./server/README.md) inside the `server/` folder.

### Contact
For questions or help open an issue or contact the maintainers listed in the repository. Feel free to send pull requests for contribution!
