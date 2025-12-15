# Team Contributions

## Participant 1: Mariia Khorunzha (aka Impelle)

**Implemented functionality:**

- Designed and implemented full functionality for the **Gym**, **Room**, **ClassType**, and **Attendance** modules, including database schema, routing, controllers, services, and repositories.

- Implemented complete **CRUD operations** for gyms, rooms, class types, and attendances with proper input validation and consistent error handling.

- Implemented a **soft delete mechanism** for both main and linking entities, preserving historical data and ensuring referential integrity.

- Developed a **complex transactional workflow** for room creation together with class type bindings and session configuration within a single database transaction, guaranteeing atomicity and data consistency.

- Implemented multiple **analytical and filtered queries**, including:
  - gym utilization and occupancy analysis based on room capacity and active attendances,
  - room search with filtering by capacity range and gym,
  - gym search by address with pagination and sorting,
  - session capacity conflict detection when updating room capacity,
  - retrieval of class types with usage statistics (memberships, qualifications, sessions).

- Wrote **integration and unit tests** for the **Gym**, **Room**, **ClassType**, and **Attendance** modules, covering both core business logic and edge cases.

- Implemented and configured a **global error handling middleware** with support for custom application-level errors.

- Created reusable **utility modules**, including centralized custom error handling (AppError), Prisma error handling utilities, and asynchronous controller wrappers.

- Partially completed project documentation, including the database schema description (`schema.md`).













