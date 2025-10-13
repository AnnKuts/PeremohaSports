# Requirements

Here you can find functional and data requirements of the system, business rules, description of entities, attributes,
relationships.

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
- class catalog: information about classes, level of exercises, trainers that lead the course, and rooms in gym where
  course will be held
- financial data: start and end dates, price of memberships. Records of user subscriptions and history of all payments

## 📋 Business Rules

**Client <---> Membership**
A client can have zero or many memberships (for different types of classes and/or at different times).Each membership
belongs to exactly one client and exactly one type of class (ClassType).Memberships store their history by
start_date–end_date periods and can coexist if they are different types of classes.

**Class Type <---> Membership**
A single class type (ClassType: yoga/sports/pool/etc.) can have zero or many memberships across different clients.Each
membership belongs to one and only one type of class.

**Payment <---> Membership/Client**
A client can make one or many payments.Each payment is made by one and only one client for one specific membership.

**Trainer <---> Qualification (by class type)**
A trainer can have one or more qualifications for different class types.Each qualification record associates exactly one
trainer with exactly one class type.

**Room <---> Allowed Class Types (RoomClassType)**
One room can support multiple class types, and one class type can be available in multiple rooms.Each specific class (
session) can only be assigned to a (room, class_type) pair allowed by the RoomClassType.

**Class (ClassSession)**
Each session is taught by exactly one trainer.A session is conducted in one room and for one class type—via a reference
to the (class_type_id, room_id) pair from the RoomClassType. The session's room and activity type must match the allowed
association (otherwise, the activity cannot be created).A session has a capacity limit.

**Attendance**
A client can have zero or more attendance marks.Each mark records the presence of a specific client at a specific
session (composite key (session_id, client_id)).The number of confirmed attendances for a session must not exceed
ClassSession.capacity.

**Trainer <---> Gym — placement**
A trainer can be assigned to one or more gyms; a gym has one or more trainers (M:N via fTrainerPlacement).A trainer can
only teach classes in the gym they are registered with.

**Gym <---> Room**
A gym has one or more rooms; each room belongs to exactly one gym.

**Contacts**
The client and the trainer each have one ContactData record, and each contact record is associated with one owner.

## 🧩 Entities, Attributes and Relationships

This section describes the main entities of the system, their attributes, and the relationships between them.

### Entities

`Client` · `Payment` · `Membership` · `ClassType` · `ClassSession` · `Trainer` · `Gym` · `Room` · `Attendance` ·
`Qualification` · `TrainerPlacement` · `RoomClassType`

### Attributes

**Client:** (PK) client_id, (FK) contact_data_id, first_name, last_name, gender  
**ContactData:** (PK) contact_data_id, phone, email  
**Membership:** (PK) membership_id, (FK) client_id, (FK) class_type_id, start_date, end_date, price, status,
is_disposable  
**Payment:** (PK) payment_id, (FK) client_id, (FK) membership_id, timestamp, amount, status, method  
**Attendance:** (PK, FK) session_id, (PK, FK) client_id, status  
**Trainer:** (PK) trainer_id, (FK) contact_data_id, first_name, last_name, is_admin, specialty  
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
ClassSession (one <---> zero or many) Attendance  
Client (one <---> zero or many) Attendance  
Trainer (one <---> many) ClassSession  
RoomClassType (one <---> many) ClassSession  
Trainer (one <---> one or many) Qualification  
ClassType (one <---> one or many) Qualification  
Trainer (one <---> one or many) TrainerPlacement  
Gym (one <---> one or many) TrainerPlacement  
Gym (one <---> one or many) Room  
Room (one <---> one or many) RoomClassType  
ClassType (one <---> one or many) RoomClassType  
ContactData (one <---> one) Client  
ContactData (one <---> one) Trainer  
