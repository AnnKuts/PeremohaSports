# Database schema documentation

## Entity-Relationship Diagram (ERD):

## Description of tables:

### Table: `ContactData`

**Appointment:** Stores users' contact information, including their phone numbers and email addresses.

| Field           | Key | Data Type   | Constraints     | Description |
| --------------- | --- | ----------- | --------------- | ----------- |
| contact_data_id | PK  | serial      | PRIMARY KEY     | Identifier fot the contact data |
| phone           | -   | varchar(32) | NOT NULL UNIQUE | Client's phone number |
| email           | -   | varchar(32) | NOT NULL UNIQUE | Client's email |

**Relationships:**  
One-to-one with the Client table (each client has one set of contact information).  
One-to-one with the Trainer table (each trainer has one set of contact information).  

### Table: `Client`

**Appointment:** Stores information about customers, including their personal data, such as name, surname and gender.

| Field           | Key | Data Type   | Constraints                                        | Description |
| --------------- | --- | ----------- | -------------------------------------------------- | ----------- |
| client_id       | PK  | serial      | PRIMARY KEY                                        | Identifier for the client |
| first_name      | -   | varchar(32) | NOT NULL                                           | Client name |
| last_name       | -   | varchar(32) | NOT NULL                                           | Client surname |
| gender          | -   | gender_name | NOT NULL                                           | Client gender |
| contact_data_id | FK  | integer     | NOT NULL references contact_data (contact_data_id) | Customer contact data identifier |

**Relationships:**  
One-to-many with the Payment table (a single client can make multiple payments).  
One-to-many with the Attendance table (each client can attend multiple classes).  
One-to-one with the ContactData table (each client has one set of contact data).  

### Table: `Payment`

**Appointment:** Stores information about customer payments, including amount, status, payment method, and, if applicable, subscription.

| Field         | Key | Data Type        | Constraints | Description |
|---------------|-----|------------------|-------------| ----------- |
| payment_id    | PK  | serial           | PRIMARY KEY | Identifier for the payment |
| created_at    | -   | timestampz       | NOT NULL DEFAULT now()  | Timestamp for when the payment was created |
| amount        | -   | numeric(10,2)    |  NOT NULL CHECK (amount >= 0)  | The payment amount |
| status        | -   | payment_status(enum) | NOT NULL DEFAULT 'pending'   | The status of the payment (e.g., "pending", "completed") |
| method        | -   | payment_method(enum)      | NOT NULL  | The payment method (e.g., "credit_card", "paypal") |
| client_id     | FK  | integer          |  NOT NULL references client (client_id) | The ID of the client who made the payment |
| membership_id | FK | integer          | references membership (membership_id)   | The ID of the membership associated with the payment |

**Relationships:**  
One-to-one with the Client table (each client can have one payment for a given period).  
One-to-one with the Membership table (each payment can be associated with one subscription).

### Table: `Membership`

**Appointment:** Stores information about user membership, including membership start and end dates, price, and status.

| Field         | Key | Data Type        | Constraints | Desciption |
|---------------|-----|------------------|-------------| ----------- |
| membership_id | PK  | serial           | PRIMARY KEY | Identifier for the membership |
| start_date    | -   | date             | NOT NULL  | The start date of the membership |
| end_date      | -   | date             | NOT NULL | The end date of the membership | 
| price         | -   | numeric(10,2)    | NOT NULL, CHECK (price >= 0)   | The price of the membership  |
| status        | -   | membership_status (enum) | NOT NULL, DEFAULT 'active' | The status of the membership (e.g., "active", "expired") |
| is_dispisable | -   | boolean          | NOT NULL, DEFAULT false | Whether the membership ss a one-time membership |
| client_id     | FK  | integer          | NOT NULL, REFERENCES client (client_id) | The ID of the client who owns the membership |
| class_type_id | FK  | integer          | NOT NULL, REFERENCES class_type (class_type_id) | The ID of the class type associated with this membership |

**Relationships:**  
One-to-many with Client (each client can have multiple subscriptions).  
One-to-one with Payment (each subscription can have one payment).

### Table: `СlassType`

**Appointment:** Stores information about the types of classes that are available for the membership, including the class name, its description, and level.

| Field         | Key | Data Type        | Constraints | Description |
|---------------|-----|------------------|-------------| ---------- |
| class_type_id | PK  | serial           | PRIMARY KEY | Identifier for the class type |
| name          | -   | class_name(enum) | NOT NULL  | The name of the class type (e.g., "Yoga", "Pilates") |
| description   | -   | text             | NOT NULL  | A description of the class type, explaining what it involves |
| level         | -   | level_name(enum) | NOT NULL   | The difficulty level of the class (e.g., "beginner", "advanced") |

**Relationships:**  
One-to-many with Membership table (one class type can be associated with multiple subscriptions).  
One-to-many with Qualification table (one class type can be associated with multiple qualifications).  
One-to-many with RoomClassType table (one class type can be held in multiple rooms).  

### Table: `ClassSession`

**Appointment:** Stores information about a class session, including date, duration, capacity, class type, instructor, and room where the class is held.

| Field                    | Key | Data Type        | Constraints | Description |
|--------------------------|-----|------------------|------------| ----------- |
| session_id               | PK  | serial           | PRIMARY KEY | Identifier for the class session
| duration                 | -   | interval         | NOT NULL, CHECK (duration > INTERVAL '0'), CHECK (duration >= INTERVAL '30 minutes' AND duration <= INTERVAL '2 hours')   | Duration of the class session |
| capacity                 | -   | int              | NOT NULL, CHECK (capacity > 0)   | The maximum number of participants allowed in the session |
| date                     | -   | date             | NOT NULL   | The date on which the class session is scheduled |
| (class_type_id, room_id) | FK  | class_name(enum) | REFERENCES room_class_type(room_id, class_type_id)   | The type of class and the room in which it will be held |
| trainer_id               | FK  | int              | NOT NULL, REFERENCES trainer(trainer_id)   | The ID of the trainer conducting the session |

**Relationships:**  
One-to-many with the Trainer table (each trainer can teach multiple classes).  
One-to-many with the RoomClassType table (one class type and room can be associated with multiple classes).  
One-to-many with the Attendance table (multiple clients can attend a single class).  

### Table: `Trainer`

**Appointment:** Stores information about coaches, including their personal data, and determines whether the coach is an administrator.

| Field           | Key | Data Type   | Constraints                                        | Description |
| --------------- | --- | ----------- | -------------------------------------------------- | ----------- |
| trainer_id      | PK  | serial      | PRIMARY KEY                                        | Identifier for the trainer |
| first_name      | -   | varchar(32) | NOT NULL                                           | The name of the trainer |
| last_name       | -   | varchar(32) | NOT NULL                                           | The surname of the trainer |
| is_admin        | -   | boolean     | NOT NULL                                           | Indicates whether the trainer is an admin |
| contact_data_id | FK  | integer     | NOT NULL references contact_data (contact_data_id) | The ID of the contact data for the trainer |

**Relationships:**  
One-to-one with ContactData table (each trainer has one set of contact data).  
One-to-many with Qualification table (each trainer can have multiple qualifications, which means that a trainer can conduct different types of classes, depending on their qualifications).  
One-to-many with TrainerPlacement table (a trainer can work in multiple gyms).  

### Table: `Gym`

**Appointment:** Stores information about gyms, including their addresses.

| Field        | Key | Data Type   | Constraints                       | Description |
| ------------ | --- | ----------- | --------------------------------- | ---------- |
| gym_id       | PK  | serial      | PRIMARY KEY                       | Identifier for the gym |
| address      | -   | varchar(60) | NOT NULL UNIQUE                   | The address of the gym |

**Relationships:**  
One-to-many with the TrainerPlacement table (one gym can have multiple trainers).  
One-to-many with the Room table: (one gym can have multiple rooms).  

### Table: `Room`

**Appointment:** Stores information about gym rooms and their capacity.

| Field    | Key | Data Type | Constraints                      | Description |
| -------- | --- | --------- | -------------------------------- | ---------- |
| room_id  | PK  | serial    | PRIMARY KEY                      | Identifier for the room |
| capacity | -   | integer   | NOT NULL CHECK (capacity > 0)    | The capacity of the room |
| gym_id   | FK  | integer   | NOT NULL references gym (gym_id) | The ID of the gym where the room is located |

**Relationships:**  
One-to-many with the Gym table (one gym can have several rooms).  
One-to-many with the RoomClassType table (one room can be associated with multiple class types).  

### Table: `Attendance`

**Appointment:** Stores information about client class attendance, including attendance status (registered, present, absent, etc.).

| Field         | Key | Data Type        | Constraints | Description |
|---------------|-----|------------------|-------------| ---------- |
| session_id    | PK, FK | integer       | NOT NULL, REFERENCES class_session (session_id) | Identifier of the class session |
| client_id     | PK, FK | integer       | NOT NULL, REFERENCES client (client_id)  | The ID of the client |
| status        | -      | attendance_status (enum) | NOT NULL, DEFAULT 'booked'   | The attendance status (e.g., "booked", "present", "absent") |

**Relationships:**  
One-to-many with the Client table (each client can attend multiple classes).  
One-to-many with the Room table (each class can be held in one room, and multiple attendance records can be associated with that room).  

### Table:`Qualification`

**Appointment:** Stores information about qualifications that determine which types of classes are available in which rooms. This allows you to maintain a connection between classes and the rooms where those classes are held.

| Field         | Key    | Data Type       | Constraints | Description |
|---------------|--------|-----------------|-----------| ---------- |
| trainer_id       | PK, FK | int             | NOT NULL  | The identifier of the trainer |
| class_type_id | PK, FK | int             | NOT NULL  | The identifier of the class type |

**Relationships:**  
One-to-many with the ClassType table (one type of class can be held in multiple rooms that have the corresponding qualifications).  
One-to-many with the Trainer table (one trainer can have multiple qualifications, allowing him to hold different types of classes in different rooms).  

### Table: `TrainerPlacement`

**Appointment:** Stores information about which gyms trainers work in. This allows you to establish a connection between trainers and the fitness centers where they work.

| Field      | Key    | Data Type       | Constraints | Description |
|------------|--------|-----------------|------------| ---------- | 
| trainer_id | PK, FK | int             | NOT NULL, REFERENCES trainer(trainer_id)   | The identifier of the trainer |
| gym_id     | PK, FK | int             | NOT NULL, REFERENCES gym(gym_id)   | The identifier of the gym |

**Relationships:**  
One-to-many with the Trainer table (one trainer can work in multiple fitness centers).  
One-to-many with the Gym table (one fitness center can have multiple trainers).  

### Table: `RoomClassType`

**Appointment:** Stores information about what types of classes are held in specific rooms. This allows you to determine the relationship between rooms and the types of classes held in them.

| Field         | Key    | Data Type       | Constraints | Description |
|---------------|--------|-----------------|-------------| ----------- |
| room_id       | PK, FK | int             | NOT NULL, REFERENCES room(room_id)    | The identifier of the room |
| class_type_id | PK, FK | int             | NOT NULL, REFERENCES class_type(class_type_id)    | The identifier of the class type for this room |

**Relationships:**  
One-to-many with the Room table (a single room can be associated with multiple class types held in that room).  
One-to-many with the ClassType table (a single class type can be held in multiple rooms that have the corresponding qualifications).  
One-to-many with the ClassSession table (a single room and class type can be used to hold multiple classes. That is, a class can be held at different times in different sessions, and each session will have a corresponding relationship with a specific room and class type).  

## Design decisions:

1. **Why we chose this schema structure:**

2. **Normalization level achieved:** The above schema is in third normalization (3NF) because:

- **1NF (First Normalization):** All tables have atomic data, i.e. each column contains only one value, and all records are unique.

- **2NF (Second Normalization):** All table attributes are dependent on the full key, i.e. there are no partial dependencies.

- **3NF (Third Normalization):** There are no transitive dependencies in the tables, all attributes are direct dependencies on the primary key, and all dependencies between attributes are functional.

3. **Compromises made:** 

4. **Indexing strategy:** 
