# **Peremoha Gym - Gym Management System**

## **Project Overview:**

**Peremoha Gym** is a **gym management system** that provides convenient tools for recording and managing data about the gym, rooms, class types, qualifications, memberships, attendance etc. The system is designed to facilitate administration and improve the*efficiency of gyms through comprehensive analysis and monitoring of their activities. It also provides convenience for customers, enabling them to effectively manage their gym experience and track their progress.



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


## **Launching the application**  


## **Running tests**  


## **Project structure overview**  

```
course-work/
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
│   │   ├── attendanceControllers.ts  
│   │   ├── auth.controller.ts        
│   │   ├── classTypesControllers.ts 
│   │   ├── clients.controller.ts    
│   │   ├── gymControllers.ts        
│   │   ├── memberships.controller.ts 
│   │   ├── payments.controller.ts   
│   │   ├── register.controller.ts   
│   │   ├── roomControllers.ts      
│   │   ├── sessionController.ts     
│   │   └── trainerController.ts     
│   │
│   ├── repositories/           # Repositories for data access
│   │   ├── attendanceRepositories.ts
│   │   ├── classTypeRepositories.ts
│   │   ├── clients.repository.ts
│   │   ├── gymRepositories.ts
│   │   ├── memberships.repository.ts
│   │   ├── payments.repository.ts
│   │   ├── register.repository.ts
│   │   ├── roomRepositories.ts
│   │   ├── sessionRepository.ts
│   │   ├── trainerRepository.ts
│   │   └── sharedRepositoryFunc.ts
│   │
│   ├── routes/                 # API routes definitions
│   │   ├── attendanceRoutes.ts
│   │   ├── auth.routes.ts
│   │   ├── classTypesRoutes.ts
│   │   ├── clients.routes.ts
│   │   ├── gymRoutes.ts
│   │   ├── memberships.routes.ts
│   │   ├── payments.routes.ts
│   │   ├── register.routes.ts
│   │   ├── roomRoutes.ts
│   │   ├── sessionRoutes.ts
│   │   └── trainerRoutes.ts
│   │
│   ├── schemas/                # Validation schemas
│   │   ├── attendanceSchemas.ts
│   │   ├── auth.schema.ts
│   │   ├── classTypeSchemas.ts
│   │   ├── clients.schema.ts
│   │   ├── common.ts
│   │   ├── email.schema.ts
│   │   ├── gymSchemas.ts
│   │   ├── memberships.schema.ts
│   │   ├── payments.schema.ts
│   │   ├── roomSchemas.ts
│   │   ├── sessionSchema.ts
│   │   └── trainerSchema.ts
│   │
│   ├── services/               # Business logic services
│   │   ├── attendanceServices.ts
│   │   ├── auth.service.ts
│   │   ├── classTypesServices.ts
│   │   ├── clients.service.ts
│   │   ├── email.service.ts
│   │   ├── gymServices.ts
│   │   ├── memberships.service.ts
│   │   ├── payments.service.ts
│   │   ├── register.service.ts
│   │   ├── roomServices.ts
│   │   ├── sessionService.ts
│   │   ├── trainerService.ts
│   │   └── ...
│   │
│   ├── types/                  # Types for the project
│   │   ├── enum_types.ts
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
├── .env                       # Environment variables
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
