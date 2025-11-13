--average duration of all class sessions
SELECT AVG(duration) AS average_duration
FROM class_session;

--list of clients with their contact details
SELECT c.first_name,
       c.last_name,
       cd.phone,
       cd.email
FROM client c
         JOIN contact_data cd ON c.contact_data_id = cd.contact_data_id;

--list of trainers with their contact details
SELECT t.first_name,
       t.last_name,
       cd.phone,
       cd.email
FROM trainer t
         JOIN contact_data cd ON t.contact_data_id = cd.contact_data_id;

--female clients with their email addresses
SELECT c.first_name,
       c.last_name,
       cd.email
FROM client c
         JOIN contact_data cd ON c.contact_data_id = cd.contact_data_id
WHERE c.gender = 'female';

--trainers of swimming pool classes
SELECT t.first_name,
       t.last_name,
       t.specialty
FROM trainer t
         JOIN qualification q ON t.trainer_id = q.trainer_id
         JOIN class_type ct ON q.class_type_id = ct.class_type_id
WHERE ct.name = 'swimming pool';

--class workout sessions with capacity greater than 15
SELECT cs.session_id,
       cs.date,
       cs.duration,
       cs.capacity
FROM class_session cs
WHERE cs.class_type_id = 1
  AND cs.capacity > 15;

--attendance for class sessions on 2025-10-12
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

--active memberships
SELECT c.first_name, c.last_name, m.start_date, m.end_date
FROM client c
       JOIN membership m ON c.client_id = m.client_id
WHERE m.status = 'active';

--clients who have not attended any classes
SELECT c.client_id, c.first_name, c.last_name
FROM client c
       LEFT JOIN attendance a
                 ON c.client_id = a.client_id
WHERE a.client_id IS NULL;

--class yoga or workout sessions with their dates
SELECT cs.session_id, ct."name" AS class_type, ct."level", cs."date"
FROM class_session cs
       INNER JOIN class_type ct
                  ON cs.class_type_id = ct.class_type_id
WHERE ct.name in ('yoga', 'workout');

--total class sessions per trainer
SELECT t.trainer_id, t.first_name, t.last_name, COUNT(cs.session_id) AS total_sessions
FROM trainer t
       LEFT JOIN class_session cs ON t.trainer_id = cs.trainer_id
GROUP BY t.trainer_id;

--show clients with frozen and expired memberships
SELECT c.client_id, c.first_name, c.last_name, m.status, m.start_date, m.end_date
FROM client c
       JOIN membership m ON c.client_id = m.client_id
WHERE m.status IN ('frozen', 'expired')
ORDER BY m.status, c.last_name, c.first_name;

--sessions in gyms with capacity over 100
SELECT cs.session_id, cs.date, g.address AS gym_address, r.capacity AS room_capacity
FROM class_session cs
       JOIN room r ON cs.room_id = r.room_id
       JOIN gym g ON r.gym_id = g.gym_id
WHERE g.gym_capacity > 100;

--add new client Artem
INSERT INTO contact_data (phone, email)
VALUES ('380684654860', 'romaniukartem8@gmail.com');

INSERT INTO client (first_name, last_name, gender, contact_data_id)
SELECT 'Артем',
       'Романюк',
       'male',
       (SELECT contact_data_id FROM contact_data WHERE email = 'romaniukartem8@gmail.com');

--book class session with id 3 for Artem
INSERT INTO attendance(session_id, client_id, status)
VALUES
    (3, (SELECT client_id FROM client WHERE first_name = 'Артем' AND last_name = 'Романюк'), 'booked');

--add a new class session
INSERT INTO class_session (trainer_id, room_id, class_type_id, duration, capacity, "date")
VALUES
  (2, 3, 3, '1 hour', 50, '2025-11-13');

SELECT *
FROM class_session
WHERE trainer_id = 2;

--enroll a client in a class session
INSERT INTO attendance(session_id, client_id, status)
VALUES
  (5, 4, 'booked');

SELECT *
FROM attendance
WHERE session_id = 5;

--mark all booked attendance for session ID 1 as attended
INSERT INTO attendance (session_id, client_id, status)
SELECT 1, client_id, 'attended'
FROM attendance
WHERE session_id = 1 AND status = 'booked';

--change Artem's number
UPDATE contact_data
SET phone = '38050356727'
WHERE email = 'romaniukartem8@gmail.com';

--change capacity of class session with id 1 to 25
UPDATE class_session
SET capacity = 25
WHERE session_id = 1;

--change the date of a specific class session
UPDATE class_session
SET date = '2025-11-15'
WHERE session_id = 5;

SELECT *
FROM class_session cs
WHERE cs.session_id =5;

--change email of a specific client
UPDATE contact_data
SET email = 'mariia.bondarenko@example.com'
WHERE contact_data_id = 4;

SELECT *
FROM contact_data cd
WHERE cd.contact_data_id = 4;

--expire memberships that ended before today
UPDATE membership
SET status = 'expired'
WHERE end_date < CURRENT_DATE;

--delete expired memberships and their payments
DELETE FROM payment
WHERE membership_id IN (
    SELECT membership_id FROM membership WHERE status = 'expired'
);

DELETE FROM membership
WHERE status = 'expired';

--delete all cancelled attendance records
DELETE FROM attendance
WHERE status = 'cancelled';

--delete a specific attendance record
SELECT * FROM attendance
WHERE session_id = 4 AND client_id = 1;

DELETE FROM attendance
WHERE session_id = 4 AND client_id = 1;

SELECT * FROM attendance
WHERE session_id = 4 AND client_id = 1;

--delete failed payments made on 2025-10-10
SELECT *
FROM payment
WHERE status = 'failed' AND DATE(created_at) = '2025-10-10';

DELETE FROM payment
WHERE status = 'failed' AND DATE(created_at) = '2025-10-10';

SELECT *
FROM payment
WHERE status = 'failed' AND DATE(created_at) = '2025-10-10';

--delete future sessions in room ID 1
DELETE FROM class_session
WHERE room_id = 1
  AND date > CURRENT_DATE;