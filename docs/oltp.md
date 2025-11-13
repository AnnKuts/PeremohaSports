# OLTP
This section describes the OLTP (Online Transaction Processing) aspects of the database schema, focusing on the entities and their relationships that facilitate day-to-day operations. 



## ⚙️ Structure
- [`ddl.sql`](/sql/ddl.sql) - contains SQL statements for setting up constraints.
- [`insert_data.sql`](/sql/test_data.sql) - contains a set of sample records used to verify the correctness and consistency of the database schema.
- [`oltp_queries.sql`](/sql/oltp_queries.sql) - contains SQL queries for common OLTP operations.
- [Final Table Overview](#final-table-overview)
- [Conclusion](#conclusion)
  
## Table of Queries
- [SELECT](#select)
- [INSERT](#insert)
- [UPDATE](#update)
- [DELETE](#delete)

### SELECT

```sql 
--average duration of all class sessions
SELECT AVG(duration) AS average_duration
FROM class_session;
```
<img width="410" height="67" alt="average duration of all class sessions" src="https://github.com/user-attachments/assets/c3edf560-2304-4cbb-abfc-617a7e3c49be" />


```sql
--list of clients with their contact details
SELECT c.first_name,
c.last_name,
cd.phone,
cd.email
FROM client c
JOIN contact_data cd ON c.contact_data_id = cd.contact_data_id;
```
<img width="824" height="142" alt="list of clients with their contact details" src="https://github.com/user-attachments/assets/11c7615c-6644-4032-a8c6-ee7e19eb3a3f" />


```sql
--list of trainers with their contact details
SELECT t.first_name,
t.last_name,
cd.phone,
cd.email
FROM trainer t
JOIN contact_data cd ON t.contact_data_id = cd.contact_data_id;
```
<img width="847" height="106" alt="list of trainers with their contact details" src="https://github.com/user-attachments/assets/961d4e9a-624f-4a4c-b280-eb55e5655716" />

```sql
--female clients with their email addresses
SELECT c.first_name,
c.last_name,
cd.email
FROM client c
JOIN contact_data cd ON c.contact_data_id = cd.contact_data_id
WHERE c.gender = 'female';
```
<img width="670" height="94" alt="female clients with their email addresses" src="https://github.com/user-attachments/assets/c537d738-a9b6-4f54-a97a-9a1440e30a09" />

```sql
--trainers of swimming pool classes
SELECT t.first_name,
t.last_name,
t.specialty
FROM trainer t
JOIN qualification q ON t.trainer_id = q.trainer_id
JOIN class_type ct ON q.class_type_id = ct.class_type_id
WHERE ct.name = 'swimming pool';
```
<img width="605" height="69" alt="trainers of swimming pool classes" src="https://github.com/user-attachments/assets/900e2187-6410-4224-8143-f74d8a75e90a" />

```sql
--class workout sessions with capacity greater than 15
SELECT cs.session_id,
cs.date,
cs.duration,
cs.capacity
FROM class_session cs
WHERE cs.class_type_id = 1
AND cs.capacity > 15;
```
<img width="1018" height="64" alt="class workout sessions with capacity greater than 15" src="https://github.com/user-attachments/assets/5aab6b45-0f1f-4353-a54e-cdd79151a1c7" />

```sql
--attendance for class sessions on 12.10.2025
SELECT cs.date          AS session_date,
ct.name          AS class_name,
cs.duration,
t.first_name     AS trainer_first_name,
t.last_name      AS trainer_last_name,
c.first_name     AS client_first_name,
c.last_name      AS client_last_name,
a.status
FROM class_session cs
JOIN class_type ct ON cs.class_type_id = ct.class_type_id
JOIN trainer t     ON cs.trainer_id = t.trainer_id
JOIN attendance a  ON cs.session_id = a.session_id
JOIN client c      ON a.client_id = c.client_id
WHERE cs.date = '2025-10-12';
```
<img width="881" height="64" alt="attendance for class sessions on 12.10.2025" src="https://github.com/user-attachments/assets/90d91e2c-a644-4c3d-b9b2-a23659b213a3" />

```sql
--active memberships
SELECT c.first_name, c.last_name, m.start_date, m.end_date
FROM client c
JOIN membership m ON c.client_id = m.client_id
WHERE m.status = 'active';
````
<img width="802" height="96" alt="active memberships" src="https://github.com/user-attachments/assets/61717c17-3e9b-4705-9f14-23f6b06c1de5" />


```sql
--clients who have not attended any classes
SELECT c.client_id, c.first_name, c.last_name
FROM client c
LEFT JOIN attendance a
ON c.client_id = a.client_id
WHERE a.client_id IS NULL;
```
<img width="608" height="96" alt="clients who have not attended any classes" src="https://github.com/user-attachments/assets/41403b40-91cf-49d2-a787-d65ea8a9a3eb" />


```sql
--class yoga or workout sessions with their dates
SELECT cs.session_id, ct."name" AS class_type, ct."level", cs."date"
FROM class_session cs
INNER JOIN class_type ct
ON cs.class_type_id = ct.class_type_id
WHERE ct.name in ('yoga', 'workout');
```
<img width="721" height="119" alt="class yoga or workout sessions with their dates" src="https://github.com/user-attachments/assets/e2de3cce-2d20-4596-af9b-068ebe57cc54" />

```sql
--total class sessions per trainer
SELECT t.trainer_id, t.first_name, t.last_name, COUNT(cs.session_id) AS total_sessions
FROM trainer t
LEFT JOIN class_session cs ON t.trainer_id = cs.trainer_id
GROUP BY t.trainer_id;
```
<img width="860" height="94" alt="total class sessions per trainer" src="https://github.com/user-attachments/assets/c77372e9-70a0-419a-b9f6-da54ad5dda91" />

```sql
--show clients with frozen and expired memberships
SELECT c.client_id, c.first_name, c.last_name, m.status, m.start_date, m.end_date
FROM client c
JOIN membership m ON c.client_id = m.client_id
WHERE m.status IN ('frozen', 'expired')
ORDER BY m.status, c.last_name, c.first_name;
```
<img width="1147" height="67" alt="show clients with frozen and expired memberships" src="https://github.com/user-attachments/assets/8256507e-d677-4149-8954-3a054c9d1b3f" />

```sql
--sessions in gyms with capacity over 100
SELECT cs.session_id, cs.date, g.address AS gym_address, r.capacity AS room_capacity
FROM class_session cs
JOIN room r ON cs.room_id = r.room_id
JOIN gym g ON r.gym_id = g.gym_id
WHERE g.gym_capacity > 100;
```
<img width="885" height="136" alt="sessions in gyms with capacity over 100" src="https://github.com/user-attachments/assets/f97be995-7c13-435d-b50e-3462b0230f00" />

### INSERT

```sql
--add new client Artem
INSERT INTO contact_data (phone, email)
VALUES ('380684654860', 'romaniukartem8@gmail.com');

INSERT INTO client (first_name, last_name, gender, contact_data_id)
SELECT 'Артем',
       'Романюк',
       'male',
       (SELECT contact_data_id FROM contact_data WHERE email = 'romaniukartem8@gmail.com');

SELECT *
FROM contact_data
WHERE phone = '380684654860';

SELECT *
FROM client
WHERE first_name = 'Артем' AND last_name = 'Романюк';
```
<img width="567" height="58" alt="add new client id select contact_data" src="https://github.com/user-attachments/assets/8b37bc1f-1a40-4d42-998d-fbbe4418b0ab" />
<img width="1052" height="58" alt="add new client id select client" src="https://github.com/user-attachments/assets/ae96752e-b7b8-4dc5-91e5-e0f0e609f159" />

```sql
--book class session with id 3 for Artem
INSERT INTO attendance(session_id, client_id, status)
VALUES
    (3, (SELECT client_id FROM client WHERE first_name = 'Артем' AND last_name = 'Романюк'), 'booked');

SELECT *
FROM attendance
WHERE session_id = 3;
```
<img width="592" height="88" alt="book class session with id 3 for Artem select" src="https://github.com/user-attachments/assets/ffb993d3-ec9e-4294-b62d-038b18633c38" />

```sql
--add a new class session
INSERT INTO class_session (trainer_id, room_id, class_type_id, duration, capacity, "date")
VALUES
  (2, 3, 3, '1 hour', 50, '2025-11-13');

SELECT *
FROM class_session;
```
<img width="858" height="183" alt="add a new class session select" src="https://github.com/user-attachments/assets/1b113c2d-837e-4bf4-8230-e19b1d5e67bb" />

```sql
--enroll a client in a class session
INSERT INTO attendance(session_id, client_id, status)
VALUES
  (5, 4, 'booked');

SELECT *
FROM attendance
WHERE session_id = 5;
```
<img width="585" height="60" alt="enroll a client in a class session select" src="https://github.com/user-attachments/assets/8746a5b6-40bb-4c04-9928-d2c0f2ce4d9f" />

```sql
--mark all booked attendance for session id 1 as attended
INSERT INTO attendance (session_id, client_id, status)
SELECT 1, client_id, 'attended'
FROM attendance
WHERE session_id = 1 AND status = 'booked';

SELECT *
FROM attendance
WHERE session_id = 1;
```
<img width="585" height="60" alt="mark all booked attendance for session id 1 as attended" src="https://github.com/user-attachments/assets/c27ec982-3a8c-4a41-91b0-f2c638c565ac" />

### UPDATE

```sql
--change Artem's number
UPDATE contact_data
SET phone = '38050356727'
WHERE email = 'romaniukartem8@gmail.com';

SELECT *
FROM contact_data
WHERE email = 'romaniukartem8@gmail.com';
```
<img width="675" height="60" alt="change Artem's number before update" src="https://github.com/user-attachments/assets/a06e06b1-aece-44ca-ada5-a80a033584c6" />
<img width="675" height="60" alt="change Artem's number after update" src="https://github.com/user-attachments/assets/f29bca53-3a95-453d-897c-06d51cafdee2" />


```sql
--change capacity of class session with id 1 to 25
UPDATE class_session
SET capacity = 25
WHERE session_id = 1;

SELECT *
FROM class_session
WHERE session_id = 1;
```
<img width="1334" height="62" alt="change capacity of class session with id 1 to 25 before update" src="https://github.com/user-attachments/assets/c9330501-b445-4a2c-bc77-f9bdf9951855" />
<img width="1334" height="62" alt="change capacity of class session with id 1 to 25 after update" src="https://github.com/user-attachments/assets/e9eccfd0-30f9-4f45-93f9-c002f94866e7" />


```sql
--change the date of a specific class session
UPDATE class_session
SET date = '2025-11-15'
WHERE session_id = 5;

SELECT *
FROM class_session cs
WHERE cs.session_id = 5;
```
<img width="1397" height="62" alt="change the date of a specific class session before update" src="https://github.com/user-attachments/assets/8c93982a-196f-4b2f-be15-9a01dbabdddd" />
<img width="1397" height="62" alt="change the date of a specific class session after update" src="https://github.com/user-attachments/assets/5fbe02af-92f9-4e9f-87ee-09ed3f195842" />

```sql
--change email of a specific client
UPDATE contact_data
SET email = 'mariia.bondarenko@example.com'
WHERE contact_data_id = 4;

SELECT *
FROM contact_data cd
WHERE cd.contact_data_id = 4;
```
<img width="673" height="62" alt="change email of a specific client before update" src="https://github.com/user-attachments/assets/67b337bc-56ca-4428-8269-21ff1ffc2d00" />
<img width="673" height="62" alt="change email of a specific client after update" src="https://github.com/user-attachments/assets/70d409d7-4e23-4ed5-a92d-157a3520d49b" />

```sql
--expire memberships that ended before today
UPDATE membership
SET status = 'expired'
WHERE end_date < CURRENT_DATE;

SELECT *
FROM membership
WHERE end_date < CURRENT_DATE;
```
<img width="1459" height="114" alt="expire memberships that ended before today before update" src="https://github.com/user-attachments/assets/c8cd1ea8-ab38-45de-a0e3-e008e0b10111" />
<img width="1459" height="114" alt="expire memberships that ended before today after update" src="https://github.com/user-attachments/assets/94ac9061-f1f0-4f4b-a140-f4bdb775791f" />

### DELETE

```sql
--delete expired memberships and their payments
SELECT *
FROM payment
WHERE membership_id IN (
    SELECT membership_id FROM membership WHERE status = 'expired'
);
DELETE FROM payment
WHERE membership_id IN (
    SELECT membership_id FROM membership WHERE status = 'expired'
);

SELECT *
FROM payment
WHERE membership_id IN (
    SELECT membership_id FROM membership WHERE status = 'expired'
);

SELECT *
FROM membership
WHERE status = 'expired';

DELETE FROM membership
WHERE status = 'expired';

SELECT *
FROM membership
WHERE status = 'expired';
```
<img width="1226" height="114" alt="delete expired memberships and their payments select from payment before delete" src="https://github.com/user-attachments/assets/b300242c-12d7-4846-ac0b-3dc039f326b7" />
<img width="1335" height="114" alt="delete expired memberships and their payments select from payment after delete" src="https://github.com/user-attachments/assets/f2960d8f-0ac8-4399-96b1-d9f0289b1aa5" />
<img width="1461" height="114" alt="delete expired memberships and their payments select from membership before delete" src="https://github.com/user-attachments/assets/9e88a1c6-2689-4c2b-a344-f798f83ff4b2" />
<img width="1461" height="42" alt="delete expired memberships and their payments select from membership after delete" src="https://github.com/user-attachments/assets/0575125f-9f7d-49fb-a32b-01fc8d868967" />

```sql
--delete all cancelled attendance records
SELECT *
FROM attendance
WHERE status = 'cancelled';

DELETE FROM attendance
WHERE status = 'cancelled';

SELECT *
FROM attendance
WHERE status = 'cancelled';
```
<img width="584" height="61" alt="delete all cancelled attendance records before delete" src="https://github.com/user-attachments/assets/a9b3a238-ef75-4dbf-93e3-428dddd5f6c8" />
<img width="563" height="39" alt="delete all cancelled attendance records after delete" src="https://github.com/user-attachments/assets/7b252038-f0cd-4812-ad15-9d901ab8f2cf" />

```sql
--delete a specific attendance record
SELECT * FROM attendance
WHERE session_id = 4 AND client_id = 1;

DELETE FROM attendance
WHERE session_id = 4 AND client_id = 1;

SELECT * FROM attendance
WHERE session_id = 4 AND client_id = 1;
```
<img width="578" height="59" alt="delete a specific attendance record before delete" src="https://github.com/user-attachments/assets/7acf1b48-249f-424f-b4bd-13881557e3b1" />
<img width="578" height="59" alt="delete a specific attendance record after delete" src="https://github.com/user-attachments/assets/016233a0-a23e-48f0-9a0b-fed20e0875c5" />

```sql
--delete failed payments made on 10.10.2025
SELECT *
FROM payment
WHERE status = 'failed' AND DATE(created_at) = '2025-10-10';

DELETE FROM payment
WHERE status = 'failed' AND DATE(created_at) = '2025-10-10';

SELECT *
FROM payment
WHERE status = 'failed' AND DATE(created_at) = '2025-10-10';
```
<img width="1326" height="59" alt="delete failed payments made on 10.10.2025 before delete" src="https://github.com/user-attachments/assets/e9862746-b46d-4a6b-bef8-c385e23cc20e" />

```sql
--delete future sessions in room id 1
SELECT *
FROM class_session
WHERE room_id = 1
  AND date > CURRENT_DATE;

DELETE FROM class_session
WHERE room_id = 1
  AND date > CURRENT_DATE;

SELECT *
FROM class_session
WHERE room_id = 1
  AND date > CURRENT_DATE;
```
<img width="1326" height="59" alt="delete future sessions in room id 1 before delete" src="https://github.com/user-attachments/assets/d8c459ab-043e-4268-9b02-93b7cd51d5f7" />


