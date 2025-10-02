# Requirements
Here you can find functional and data requirements of the system, business rules, description of entities, attributes, relationships.
## Table of Contents
- [Functional Requirements](#-functional-requirements)
- [Data Requirements](#-data-requirements)
- [Business Rules](#-business-rules)
- [Entities, Attributes and Relationships](#-entities-attributes-and-relationships)

## ⚙️ Functional Requirements
The system requires backend to manage network of gyms. Key needs include:

- tracking of clients and their memberships
- managing the complete lifecycle of membership selection, status, and payment processing
- monitoring session attendances
- keeping records of the number and location of gyms
- managing their rooms and trainers


## 📊 Data Requirements
The system must store the following categories of data:

- user data: email, phone number, full name and gender
- class catalog: information about classes, level of exercises, trainers that lead the course, and rooms in gym where course will be held
- financial data: start and end dates, price of memberships. Records of user subscriptions and history of all payments

## 📋 Business Rules
This section defines the rules and constraints that govern the system:
...

## 🧩 Entities, Attributes and Relationships
This section describes the main entities of the system, their attributes, and the relationships between them.
 
### Entities
`Client` · `Payment` · `Membership` · `ClassType` · `ClassSession` · `Trainer` · `Gym` · `Room` · `Attendance` · `Qualification` · `TrainerPlacement` · `RoomClassType`

### Attributes
**Client:** (PK) client_id, (FK) contact_data_id, first_name, last_name, gender  
**ContactData:** (PK) contact_data_id, phone, email  
**Membership:** (PK) membership_id, (FK) client_id, (FK) class_type_id, start_date, end_date, price, status, is_disposable  
**Payment:** (PK) payment_id, (FK) client_id, (FK) membership_id, timestamp, amount, status, method  
**Attendance:** (PK, FK) session_id, (PK, FK) client_id, status  
**Trainer:** (PK) trainer_id, (FK) contact_data_id, first_name, last_name, specialty  
**Qualification:** (PK, FK) trainer_id, (PK, FK) class_type_id  
**TrainerPlacement:** (PK, FK) trainer_id, (PK, FK) gym_id  
**ClassType:** (PK) class_type_id, name, level  
**Room:** (PK) room_id, (FK) gym_id, capacity  
**RoomClassType:** (PK, FK) room_id, (PK, FK) class_type_id  
**ClassSession:** (PK) session_id, (FK) trainer_id, (FK) (class_type_id, room_id), duration, capacity, date  
**Gym:** (PK) gym_id, address, gym_capacity  

### Relationships
ClassType (one <---> one or many) Membership  
Membership (one <---> one and only one) Payment  
Client (one and only one <---> one or many) Payment  
ClassSession (one <---> many) Attendance  
Client (one <---> many) Attendance  
Trainer (one <---> many) ClassSession  
RoomClassType (one <---> many) ClassSession  
Trainer (one <---> one or many) Qualification  
ClassType (one <---> one or many) Qualification  
Trainer (one <---> one or many) TrainerPlacement  
Gym (one <---> one or many) TrainerPlacement  
Gym (one <---> many) Room  
Room (one <---> one or many) RoomClassType  
ClassType (one <---> one or many) RoomClassType  
ContactData (one <---> one) Client  
ContactData (one <---> one) Trainer  
