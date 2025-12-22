# Database schema documentation

## Table of Contents

- [Database schema documentation](#database-schema-documentation)
    - [Entity-Relationship Diagram (ERD)](#entity-relationship-diagram-erd)
    - [Description of tables](#description-of-tables)
        - [Table: ContactData](#table-contactdata)
        - [Table: Client](#table-client)
        - [Table: Payment](#table-payment)
        - [Table: Membership](#table-membership)
        - [Table: ClassType](#table-classtype)
        - [Table: ClassSession](#table-classsession)
        - [Table: Trainer](#table-trainer)
        - [Table: Gym](#table-gym)
        - [Table: Room](#table-room)
        - [Table: Attendance](#table-attendance)
        - [Table: Qualification](#table-qualification)
        - [Table: TrainerPlacement](#table-trainerplacement)
        - [Table: RoomClassType](#table-roomclasstype)
    - [Enumerations](#enumerations)
    - [Design decisions](#design-decisions)
        - [Why we chose this schema structure](#why-we-chose-this-schema-structure)
        - [Normalization level achieved](#normalization-level-achieved)
        - [Compromises made](#compromises-made)
        - [Indexing strategy](#indexing-strategy)
            - [Primary Key Indexes](#primary-key-indexes)
            - [Foreign Key Indexes](#foreign-key-indexes)
            - [Composite indexes](#composite-indexes)
            - [Conditional Indexes](#conditional-indexes)

## Entity-Relationship Diagram (ERD):

<img width="1556" height="851" alt="image" src="https://github.com/user-attachments/assets/899e4868-b63d-4f90-a1ff-8d8806fb5de6" />

## Description of tables:

### Table: `ContactData`

**Appointment:** Stores users' contact information, including their phone numbers and email addresses.

| Field           | Key | Data Type   | Constraints     | Description                     |
| --------------- | --- | ----------- | --------------- | ------------------------------- |
| contact_data_id | PK  | serial      | PRIMARY KEY     | Identifier fot the contact data |
| phone           | -   | varchar(32) | NOT NULL UNIQUE | Client's phone number           |
| email           | -   | varchar(32) | NOT NULL UNIQUE | Client's email                  |

**Relationships:**  
One-to-one with the Client table (each client has one set of contact information).  
One-to-one with the Trainer table (each trainer has one set of contact information).

### Table: `Client`

**Appointment:** Stores information about customers, including their personal data, such as name, surname and gender.

| Field           | Key | Data Type   | Constraints                                        | Description                      |
| --------------- | --- | ----------- | -------------------------------------------------- | -------------------------------- |
| client_id       | PK  | serial      | PRIMARY KEY                                        | Identifier for the client        |
| first_name      | -   | varchar(32) | NOT NULL                                           | Client name                      |
| last_name       | -   | varchar(32) | NOT NULL                                           | Client surname                   |
| gender          | -   | gender_name | NOT NULL                                           | Client gender                    |
| is_deleted      | -   | boolean     | DEFAULT FALSE                                      | Soft delete mark                 |
| contact_data_id | FK  | integer     | NOT NULL references contact_data (contact_data_id) | Customer contact data identifier |

**Relationships:**  
One-to-many with the Payment table (a single client can make multiple payments).  
One-to-many with the Attendance table (each client can attend multiple classes).  
One-to-one with the ContactData table (each client has one set of contact data).

### Table: `Payment`

**Appointment:** Stores information about customer payments, including amount, status, payment method, and, if applicable, subscription.

| Field         | Key | Data Type            | Constraints                            | Description                                              |
| ------------- | --- | -------------------- | -------------------------------------- | -------------------------------------------------------- |
| payment_id    | PK  | serial               | PRIMARY KEY                            | Identifier for the payment                               |
| created_at    | -   | timestampz           | NOT NULL DEFAULT now()                 | Timestamp for when the payment was created               |
| amount        | -   | numeric(10,2)        | NOT NULL CHECK (amount >= 0)           | The payment amount                                       |
| status        | -   | payment_status(enum) | NOT NULL DEFAULT 'pending'             | The status of the payment (e.g., "pending", "completed") |
| method        | -   | payment_method(enum) | NOT NULL                               | The payment method (e.g., "credit_card", "paypal")       |
| is_deleted    | -   | boolean              | DEFAULT FALSE                          | Soft delete mark                                         |
| client_id     | FK  | integer              | NOT NULL references client (client_id) | The ID of the client who made the payment                |
| membership_id | FK  | integer              | references membership (membership_id)  | The ID of the membership associated with the payment     |

**Relationships:**  
One-to-one with the Client table (each client can have one payment for a given period).  
One-to-one with the Membership table (each payment can be associated with one subscription).

### Table: `Membership`

**Appointment:** Stores information about user membership, including membership start and end dates, price, and status.

| Field         | Key | Data Type                | Constraints                                     | Desciption                                               |
| ------------- | --- | ------------------------ | ----------------------------------------------- | -------------------------------------------------------- |
| membership_id | PK  | serial                   | PRIMARY KEY                                     | Identifier for the membership                            |
| start_date    | -   | date                     | NOT NULL                                        | The start date of the membership                         |
| end_date      | -   | date                     | NOT NULL                                        | The end date of the membership                           |
| price         | -   | numeric(10,2)            | NOT NULL, CHECK (price >= 0)                    | The price of the membership                              |
| status        | -   | membership_status (enum) | NOT NULL, DEFAULT 'active'                      | The status of the membership (e.g., "active", "expired") |
| is_dispisable | -   | boolean                  | NOT NULL, DEFAULT false                         | Whether the membership ss a one-time membership          |
| client_id     | FK  | integer                  | NOT NULL, REFERENCES client (client_id)         | The ID of the client who owns the membership             |
| class_type_id | FK  | integer                  | NOT NULL, REFERENCES class_type (class_type_id) | The ID of the class type associated with this membership |

**Relationships:**  
One-to-many with Client (each client can have multiple subscriptions).  
One-to-one with Payment (each subscription can have one payment).

### Table: `СlassType`

**Appointment:** Stores information about the types of classes that are available for the membership, including the class name, its description, and level.

| Field         | Key | Data Type        | Constraints   | Description                                                      |
| ------------- | --- | ---------------- | ------------- | ---------------------------------------------------------------- |
| class_type_id | PK  | serial           | PRIMARY KEY   | Identifier for the class type                                    |
| name          | -   | class_name(enum) | NOT NULL      | The name of the class type (e.g., "Yoga", "Pilates")             |
| description   | -   | text             | NOT NULL      | A description of the class type, explaining what it involves     |
| level         | -   | level_name(enum) | NOT NULL      | The difficulty level of the class (e.g., "beginner", "advanced") |
| is_deleted    | -   | boolean          | DEFAULT FALSE | Soft delete mark                                                 |

**Relationships:**  
One-to-many with Membership table (one class type can be associated with multiple subscriptions).  
One-to-many with Qualification table (one class type can be associated with multiple qualifications).  
One-to-many with RoomClassType table (one class type can be held in multiple rooms).

### Table: `ClassSession`

**Appointment:** Stores information about a class session, including date, duration, capacity, class type, instructor, and room where the class is held.

| Field                    | Key | Data Type        | Constraints                                                                                                             | Description                                               |
| ------------------------ | --- | ---------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| session_id               | PK  | serial           | PRIMARY KEY                                                                                                             | Identifier for the class session                          |
| duration                 | -   | interval         | NOT NULL, CHECK (duration > INTERVAL '0'), CHECK (duration >= INTERVAL '30 minutes' AND duration <= INTERVAL '2 hours') | Duration of the class session                             |
| capacity                 | -   | int              | NOT NULL, CHECK (capacity > 0)                                                                                          | The maximum number of participants allowed in the session |
| date                     | -   | date             | NOT NULL                                                                                                                | The date on which the class session is scheduled          |
| is_deleted               | -   | boolean          | DEFAULT FALSE                                                                                                           | Soft delete mark                                          |
| (class_type_id, room_id) | FK  | class_name(enum) | REFERENCES room_class_type(room_id, class_type_id)                                                                      | The type of class and the room in which it will be held   |
| trainer_id               | FK  | int              | NOT NULL, REFERENCES trainer(trainer_id)                                                                                | The ID of the trainer conducting the session              |

**Relationships:**  
One-to-many with the Trainer table (each trainer can teach multiple classes).  
One-to-many with the RoomClassType table (one class type and room can be associated with multiple classes).  
One-to-many with the Attendance table (multiple clients can attend a single class).

### Table: `Trainer`

**Appointment:** Stores information about coaches, including their personal data, and determines whether the coach is an administrator.

| Field           | Key | Data Type   | Constraints                                        | Description                                |
| --------------- | --- | ----------- | -------------------------------------------------- | ------------------------------------------ |
| trainer_id      | PK  | serial      | PRIMARY KEY                                        | Identifier for the trainer                 |
| first_name      | -   | varchar(32) | NOT NULL                                           | The name of the trainer                    |
| last_name       | -   | varchar(32) | NOT NULL                                           | The surname of the trainer                 |
| is_admin        | -   | boolean     | NOT NULL                                           | Indicates whether the trainer is an admin  |
| is_deleted      | -   | boolean     | DEFAULT FALSE                                      | Soft delete mark                           |
| contact_data_id | FK  | integer     | NOT NULL references contact_data (contact_data_id) | The ID of the contact data for the trainer |

**Relationships:**  
One-to-one with ContactData table (each trainer has one set of contact data).  
One-to-many with Qualification table (each trainer can have multiple qualifications, which means that a trainer can conduct different types of classes, depending on their qualifications).  
One-to-many with TrainerPlacement table (a trainer can work in multiple gyms).

### Table: `Gym`

**Appointment:** Stores information about gyms, including their addresses.

| Field      | Key | Data Type   | Constraints     | Description            |
| ---------- | --- | ----------- | --------------- | ---------------------- |
| gym_id     | PK  | serial      | PRIMARY KEY     | Identifier for the gym |
| address    | -   | varchar(60) | NOT NULL UNIQUE | The address of the gym |
| is_deleted | -   | boolean     | DEFAULT FALSE   | Soft delete mark       |

**Relationships:**  
One-to-many with the TrainerPlacement table (one gym can have multiple trainers).  
One-to-many with the Room table: (one gym can have multiple rooms).

### Table: `Room`

**Appointment:** Stores information about gym rooms and their capacity.

| Field      | Key | Data Type | Constraints                      | Description                                 |
| ---------- | --- | --------- | -------------------------------- | ------------------------------------------- |
| room_id    | PK  | serial    | PRIMARY KEY                      | Identifier for the room                     |
| capacity   | -   | integer   | NOT NULL CHECK (capacity > 0)    | The capacity of the room                    |
| is_deleted | -   | boolean   | DEFAULT FALSE                    | Soft delete mark                            |
| gym_id     | FK  | integer   | NOT NULL references gym (gym_id) | The ID of the gym where the room is located |

**Relationships:**  
One-to-many with the Gym table (one gym can have several rooms).  
One-to-many with the RoomClassType table (one room can be associated with multiple class types).

### Table: `Attendance`

**Appointment:** Stores information about client class attendance, including attendance status (registered, present, absent, etc.).

| Field      | Key    | Data Type                | Constraints                                     | Description                                                 |
| ---------- | ------ | ------------------------ | ----------------------------------------------- | ----------------------------------------------------------- |
| session_id | PK, FK | integer                  | NOT NULL, REFERENCES class_session (session_id) | Identifier of the class session                             |
| client_id  | PK, FK | integer                  | NOT NULL, REFERENCES client (client_id)         | The ID of the client                                        |
| status     | -      | attendance_status (enum) | NOT NULL, DEFAULT 'booked'                      | The attendance status (e.g., "booked", "present", "absent") |
| is_deleted | -      | boolean                  | DEFAULT FALSE                                   | Soft delete mark                                            |

**Relationships:**  
One-to-many with the Client table (each client can attend multiple classes).  
One-to-many with the Room table (each class can be held in one room, and multiple attendance records can be associated with that room).

### Table:`Qualification`

**Appointment:** Stores information about qualifications that determine which types of classes are available in which rooms. This allows you to maintain a connection between classes and the rooms where those classes are held.

| Field         | Key    | Data Type | Constraints   | Description                      |
| ------------- | ------ | --------- | ------------- | -------------------------------- |
| trainer_id    | PK, FK | int       | NOT NULL      | The identifier of the trainer    |
| class_type_id | PK, FK | int       | NOT NULL      | The identifier of the class type |
| is_deleted    | -      | boolean   | DEFAULT FALSE | Soft delete mark                 |

**Relationships:**  
One-to-many with the ClassType table (one type of class can be held in multiple rooms that have the corresponding qualifications).  
One-to-many with the Trainer table (one trainer can have multiple qualifications, allowing him to hold different types of classes in different rooms).

### Table: `TrainerPlacement`

**Appointment:** Stores information about which gyms trainers work in. This allows you to establish a connection between trainers and the fitness centers where they work.

| Field      | Key    | Data Type | Constraints                              | Description                   |
| ---------- | ------ | --------- | ---------------------------------------- | ----------------------------- |
| trainer_id | PK, FK | int       | NOT NULL, REFERENCES trainer(trainer_id) | The identifier of the trainer |
| gym_id     | PK, FK | int       | NOT NULL, REFERENCES gym(gym_id)         | The identifier of the gym     |
| is_deleted | -      | boolean   | DEFAULT FALSE                            | Soft delete mark              |

**Relationships:**  
One-to-many with the Trainer table (one trainer can work in multiple fitness centers).  
One-to-many with the Gym table (one fitness center can have multiple trainers).

### Table: `RoomClassType`

**Appointment:** Stores information about what types of classes are held in specific rooms. This allows you to determine the relationship between rooms and the types of classes held in them.

| Field         | Key    | Data Type | Constraints                                    | Description                                    |
| ------------- | ------ | --------- | ---------------------------------------------- | ---------------------------------------------- |
| room_id       | PK, FK | int       | NOT NULL, REFERENCES room(room_id)             | The identifier of the room                     |
| class_type_id | PK, FK | int       | NOT NULL, REFERENCES class_type(class_type_id) | The identifier of the class type for this room |
| is_deleted    | -      | boolean   | DEFAULT FALSE                                  | Soft delete mark                               |

**Relationships:**  
One-to-many with the Room table (a single room can be associated with multiple class types held in that room).  
One-to-many with the ClassType table (a single class type can be held in multiple rooms that have the corresponding qualifications).  
One-to-many with the ClassSession table (a single room and class type can be used to hold multiple classes. That is, a class can be held at different times in different sessions, and each session will have a corresponding relationship with a specific room and class type).

### Enumerations

The following ENUM types are used in the schema:

- **gender_name**  
  Values: `male`, `female`

- **class_name**  
  Values: `workout`, `yoga`, `swimming pool`

- **level_name**  
  Values: `beginner`, `intermediate`, `advanced`

- **membership_status**  
  Values: `active`, `expired`, `frozen`, `cancelled`

- **payment_status**  
  Values: `pending`, `completed`, `failed`, `refunded`

- **payment_method**  
  Values: `cash`, `card`, `online`

- **attendance_status**  
  Values: `booked`, `attended`, `missed`, `cancelled`

## Design decisions:

### 1. **Why we chose this schema structure:**

1. **Separating entities and maintaining data atomicity:**  
   We decided to create separate tables for each entity (e.g., `Client`, `Coach`, `Payment`, `Class`) to avoid data duplication and ensure a clear separation of responsibilities for each table. This allows each entity to store only its own attributes, independent of other entities, which complies with the principles of normalization and allows for data atomicity (each column contains only one value).

2. **Optimization for complex queries:**  
   By organizing data into separate tables with clearly defined relationships, the system provides high performance when executing queries. For example, thanks to separate tables for `Payments` and `Customers`, you can easily obtain the payment history for a specific customer by executing simple SQL queries with table joins. This structure allows you to execute analytical queries without excessive load on the system.

3. **Support for future changes and extensions:**  
   Since the database structure was designed with possible changes in system requirements in mind, we have ensured scalability for future changes. This includes the ability to add new class types, payments, or trainer options without significantly changing the existing structure. Now, if new features need to be added in the future, such as additional class categories or new payment methods, the system can easily adapt to these changes.

4. **Refuting complex relationships through intermediate tables:**  
   Since in some cases there are multi-relationships (for example, between `Trainers` and `Fitness Centers`), intermediate tables like `TrainerPlacement` were used for such cases, which make data manipulation easier. This allows many-to-many relationships to be implemented without complex additional logic in the business logic.

5. **Soft Delete:**  
   Since in some cases it is necessary to store data that is no longer used (for example, clients who have canceled their membership or trainers who are no longer working), the concept of **soft delete** was used for such cases. In the schema, for each table where it is assumed that records can be deleted, an `is_deleted` field is added. This allows you to mark a record as deleted without physically deleting it from the database. This approach allows you to maintain a history of changes and ensure that data can be restored if necessary, without violating the integrity of the database.

### 2. **Normalization level achieved:** The above schema is in third normalization (3NF) because:

- **1NF (First Normalization):** All tables have atomic data, i.e. each column contains only one value, and all records are unique.

- **2NF (Second Normalization):** All table attributes are dependent on the full key, i.e. there are no partial dependencies.

- **3NF (Third Normalization):** There are no transitive dependencies in the tables, all attributes are direct dependencies on the primary key, and all dependencies between attributes are functional.

### 3. **Compromises made:**

1. **Simplifying entity relationships:**
   To reduce database complexity and improve performance, we decided to merge some entities into a single table, including using intermediate tables such as TrainerPlacement to connect trainers to fitness centers. This allowed us to implement many-to-many relationships, but required additional effort to maintain data integrity with large amounts of information.

2. **Limited flexibility in membership types:**
   The simplified Membership structure does not support very flexible subscription options. For example, each membership has only one price and one class type, which limits the ability to support a variety of pricing plans, such as discounts for specific user groups or special offers for multiple classes. This may require future schema extensions, but for the initial version, this decision was made for convenience and ease of implementation.

3. **Using soft delete instead of hard delete:**
   Using soft delete to store deleted records instead of physically deleting them allows for history and data recovery, but on the other hand, it can lead to an increase in database size. This is a trade-off between data integrity and performance, as additional optimization may be required over time to handle large amounts of "deleted" data.

4. **Removing enums for class types:**
   One of the compromises made during the development of the system was the removal of **enum classes** for `class_type`. While using enum classes provides strong type safety and strict validation, it also imposes limitations on dynamic class creation. Without the ability to dynamically create class types without intervening in the database or the need for migrations, it would be difficult to scale and manage the system without manual changes. As a result, we opted for more flexible approaches to allow easier updates and adjustments to class types without the need for database interventions.

### 4. **Indexing strategy:**

#### **Primary Key Indexes**

Primary keys (PK) are automatically indexed by the database, ensuring fast and efficient access to rows by their unique identifiers. This guarantees quick lookups, uniqueness, and optimal perfor.

#### **Foreign Key Indexes**

Foreign key indexes speed up JOIN operations and lookups of related data, improving query performance when linking tables.

`class_session.room_id`  
To search for all sessions in a specific room.
Used in:

- Room Schedule
- Room Availability Check

`class_session.trainer_id`  
To search for all sessions with a specific trainer.
Used in:

- Trainer Schedule
- Trainer Analytics

`client.contact_data_id`  
To quickly search for a client by contact information.
Used in:

- Contact Uniqueness Check
- Contact_Data Table Relationships

`payment.membership_id`  
To search for all membership payments.
Used in:

- Membership Payment History
- Financial Analytics

`room.gym_id`  
To search for all rooms in a specific gym.
Used in:

- Displaying the gym structure
- Facilities management

`trainer.contact_data_id`  
To search for a trainer by contact information.
Used in:

- Checking the uniqueness of trainers
- Relationships with the contact_data table

#### **Composite indexes**

Composite indexes optimize queries that filter or sort by multiple columns together, making multi-column searches and sorts much faster.

`trainer(first_name, last_name)`
For searching trainers by first and last name.
Used in:

- Employee search
- Displaying a list of trainers

#### **Conditional Indexes**

Conditional indexes make indexes smaller and speed up queries that often filter by certain conditions (like is_deleted = false or status = 'active'), improving overall database performance.

`class_session(class_type_id, date) WHERE is_deleted = false`  
To search for active sessions of a specific type by date.
Used in:

- Schedule filtering by type and date
- Attendance reports

`membership(client_id, class_type_id) WHERE status = 'active'`  
To search for a client's active memberships by type.
Used in:

- Checking for a valid membership
- Restricting access to classes

`payment(client_id, status) WHERE is_deleted = false`  
To search for client payments by status.
Used in:

- Payment history
- Payment status analytics
