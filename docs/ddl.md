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

### ContactData
| Field           | Key | Data Type   | Constraints     |
| --------------- | --- | ----------- | --------------- |
| contact_data_id | PK  | serial      | PRIMARY KEY     |
| phone           | -   | varchar(32) | NOT NULL UNIQUE |
| email           | -   | varchar(32) | NOT NULL UNIQUE |
### Client
| Field           | Key | Data Type   | Constraints                                        |
| --------------- | --- | ----------- | -------------------------------------------------- |
| client_id       | PK  | serial      | PRIMARY KEY                                        |
| first_name      | -   | varchar(32) | NOT NULL                                           |
| last_name       | -   | varchar(32) | NOT NULL                                           |
| gender          | -   | gender_name | NOT NULL                                           |
| contact_data_id | FK  | integer     | NOT NULL references contact_data (contact_data_id) |
### Payment
| Field         | Key | Data Type        | Constraints |
|---------------|-----|------------------|-------------|
| payment_id    | PK  | serial           | PRIMARY KEY |
| created_at    | -   | timestampz       | NOT NULL DEFAULT now()  |
| amount        | -   | numeric(10,2)    |  NOT NULL CHECK (amount >= 0)  |
| status        | -   | payment_status(enum) | NOT NULL DEFAULT 'pending'   |
| method        | -   | payment_method(enum)      | NOT NULL  |
| client_id     | FK  | integer          |  NOT NULL references client (client_id) |
| membership_id | FK | integer          | references membership (membership_id)   |
### Membership
| Field         | Key | Data Type        | Constraints |
|---------------|-----|------------------|-------------|
| membership_id | PK  | serial           | PRIMARY KEY |
| start_date    | -   | date             | NOT NULL  |
| end_date      | -   | date             | NOT NULL |
| price         | -   | numeric(10,2)    | NOT NULL, CHECK (price >= 0)   |
| status        | -   | membership_status (enum) | NOT NULL, DEFAULT 'active' |
| is_dispisable | -   | boolean          | NOT NULL, DEFAULT false |
| client_id     | FK  | integer          | NOT NULL, REFERENCES client (client_id) |
| class_type_id | FK  | integer          | NOT NULL, REFERENCES class_type (class_type_id) |
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
| duration                 | -   | interval         | NOT NULL, CHECK (duration > INTERVAL '0'), CHECK (duration >= INTERVAL '30 minutes' AND duration <= INTERVAL '2 hours')   |
| capacity                 | -   | int              | NOT NULL, CHECK (capacity > 0)   |
| date                     | -   | date             | NOT NULL   |
| (class_type_id, room_id) | FK  | class_name(enum) | REFERENCES room_class_type(room_id, class_type_id)   |
| trainer_id               | FK  | int              | NOT NULL, REFERENCES trainer(trainer_id)   |
### Trainer
| Field           | Key | Data Type   | Constraints                                        |
| --------------- | --- | ----------- | -------------------------------------------------- |
| trainer_id      | PK  | serial      | PRIMARY KEY                                        |
| first_name      | -   | varchar(32) | NOT NULL                                           |
| last_name       | -   | varchar(32) | NOT NULL                                           |
| specialty       | -   | class_name  | NOT NULL                                           |
| contact_data_id | FK  | integer     | NOT NULL references contact_data (contact_data_id) |
### Gym
| Field        | Key | Data Type   | Constraints                       |
| ------------ | --- | ----------- | --------------------------------- |
| gym_id       | PK  | serial      | PRIMARY KEY                       |
| address      | -   | varchar(60) | NOT NULL UNIQUE                   |
| gym_capacity | -   | integer     | NOT NULL CHECK (gym_capacity > 0) |
### Room
| Field    | Key | Data Type | Constraints                      |
| -------- | --- | --------- | -------------------------------- |
| room_id  | PK  | serial    | PRIMARY KEY                      |
| capacity | -   | integer   | NOT NULL CHECK (capacity > 0)    |
| gym_id   | FK  | integer   | NOT NULL references gym (gym_id) |
### Attendance
| Field         | Key | Data Type        | Constraints |
|---------------|-----|------------------|-------------|
| session_id    | PK, FK | integer       | NOT NULL, REFERENCES class_session (session_id) |
| client_id     | PK, FK | integer       | NOT NULL, REFERENCES client (client_id)  |
| status        | -      | attendance_status (enum) | NOT NULL, DEFAULT 'booked'   |
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
