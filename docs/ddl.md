# DDL
This document provides an overview of the PostgreSQL database schema, including entity definitions,attributes, relationships, keys, and constraints. SQL definitions and test data are organized into separate scripts for clarity and modularity.

## ⚙️ Structure

- [`ddl.sql`](/sql/ddl.sql) - contains SQL statements for creating tables, defining relationships, and setting up constraints.
- [`insert_data.sql`](/sql/test_data.sql) - contains a set of sample records used to verify the correctness and consistency of the database schema.

## Table of Entities
- [Client](#-client)
- [Payment](#-payment)
- [Membership](#-membership)
- [ClassType](#-classtype)
- [ClassSession](#-classession)
- [Trainer](#-trainer)
- [Gym](#-gym)
- [Room](#-room)
- [Attendance](#-attendance)
- [Qualification](#-qualification)
- [TrainerPlacement](#-trainerplacement)
- [RoomClassType](#-roomclasstype)

## 🧩 Entities
This section provides a detailed overview of all entities defined in the database schema.

### Client
### Payment
### Membership
### ClassType
| Field         | Key | Data Type        | Constraints |
|---------------|-----|------------------|-------------|
| class_type_id | PK  | serial           | PRIMARY KEY |
| name          | -   | class_name(enum) | NOT NULL  |
| description   | -   | text             | NOT NULL  |
| level         | -   | level_name(enum) | NOT NULL   |
### ClassSession
| Field                    | Key | Data Type        | Constraints |
|--------------------------|-----|------------------|------------|
| session_id               | PK  | serial           | PRIMARY KEY |
| (class_type_id, room_id) | FK  | class_name(enum) | REFERENCES room_class_type(room_id, class_type_id)   |
| trainer_id               | FK  | int              | NOT NULL, REFERENCES trainer(trainer_id)   |
| duration                 | -   | interval         | NOT NULL, CHECK (duration > INTERVAL '0'), CHECK (duration >= INTERVAL '30 minutes' AND duration <= INTERVAL '2 hours')   |
| capacity                 | -   | int              | NOT NULL, CHECK (capacity > 0)   |
| date                     | -   | date             | NOT NULL   |
### Trainer
### Gym
### Room
### Attendance
### Qualification
| Field         | Key    | Data Type       | Constraints |
|---------------|--------|-----------------|-----------|
| room_id       | PK, FK | int             | NOT NULL  |
| class_type_id | PK, FK | int             | NOT NULL  |
### TrainerPlacement
| Field      | Key    | Data Type       | Constraints |
|------------|--------|-----------------|------------|
| trainer_id | PK, FK | int             | NOT NULL, REFERENCES trainer(trainer_id)   |
| gym_id     | PK, FK | int             | NOT NULL, REFERENCES gym(gym_id)   |
### RoomClassType
| Field         | Key    | Data Type       | Constraints |
|---------------|--------|-----------------|-------------|
| room_id       | PK, FK | int             | NOT NULL, REFERENCES room(room_id)    |
| class_type_id | PK, FK | int             | NOT NULL, REFERENCES class_type(class_type_id)    |
