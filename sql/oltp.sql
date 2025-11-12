SELECT AVG(duration) AS average_duration
FROM class_session;

SELECT client.first_name, client.last_name, contact_data.phone, contact_data.email
FROM client
         JOIN contact_data ON client.contact_data_id = contact_data.contact_data_id;

SELECT trainer.first_name, trainer.last_name, contact_data.phone, contact_data.email
FROM trainer
         JOIN contact_data ON trainer.contact_data_id = contact_data.contact_data_id;

SELECT first_name, last_name, email
FROM client
         JOIN contact_data ON client.contact_data_id = contact_data.contact_data_id
WHERE gender = 'female';

SELECT trainer.first_name, trainer.last_name, trainer.specialty
FROM trainer
         JOIN qualification ON trainer.trainer_id = qualification.trainer_id
         JOIN class_type ON qualification.class_type_id = class_type.class_type_id
WHERE class_type.name = 'swimming pool';

SELECT session_id, date, duration, capacity
FROM class_session
WHERE class_type_id = 1
  AND capacity > 15;

SELECT class_session.date AS session_date,
       class_type.name    AS class_name,
       class_session.duration,
       trainer.first_name AS trainer_first_name,
       trainer.last_name  AS trainer_last_name,
       client.first_name  AS client_first_name,
       client.last_name   AS client_last_name,
       attendance.status
FROM class_session
         JOIN class_type
              ON class_session.class_type_id = class_type.class_type_id
         JOIN trainer
              ON class_session.trainer_id = trainer.trainer_id
         JOIN attendance
              ON class_session.session_id = attendance.session_id
         JOIN client
              ON attendance.client_id = client.client_id
WHERE class_session.date = '2025-10-12';

INSERT INTO contact_data (phone, email)
VALUES ('380684654260', 'romaniukartem8@gmail.com');

INSERT INTO client (first_name, last_name, gender, contact_data_id)
SELECT 'Артем',
       'Романюк',
       'male',
       (SELECT contact_data_id FROM contact_data WHERE email = 'romaniukartem8@gmail.com');

-- активні абонементи
SELECT c.first_name, c.last_name, m.start_date, m.end_date
FROM client c
JOIN membership m ON c.client_id = m.client_id
WHERE m.status = 'active';

-- клієнти, які не відвідували жодного заняття
SELECT c.client_id, c.first_name, c.last_name
FROM client c
LEFT JOIN attendance a
ON c.client_id = a.client_id
WHERE a.client_id IS NULL;

-- заняття певного типу (наприклад, "yoga" чи "workout")
SELECT cs.session_id, ct."name" AS class_type, ct."level", cs."date" 
FROM class_session cs
INNER JOIN class_type ct 
ON cs.class_type_id = ct.class_type_id 
WHERE LOWER(ct.name) in ('yoga', 'workout');

-- додати нове тренування (class_session)
INSERT INTO class_session (trainer_id, room_id, class_type_id, duration, capacity, "date") 
VALUES 
(2, 3, 3, '1 hour', 50, '2025-11-13');

SELECT * 
FROM class_session
WHERE trainer_id = 2;

-- записати людину на тренування
INSERT INTO attendance(session_id, client_id, status)
VALUES
(5, 4, 'booked');

SELECT * 
FROM attendance
WHERE session_id = 5;

-- змінити дату тренування
UPDATE class_session 
SET date = '2025-11-15'
WHERE session_id = 5;

SELECT *
FROM class_session cs 
WHERE cs.session_id =5;

-- оновити email конкретної людини
UPDATE contact_data
SET email = 'mariia.bondarenko@example.com'
WHERE contact_data_id = 4;

SELECT *
FROM contact_data cd 
WHERE cd.contact_data_id = 4;

-- видалити запис конкретної людини на заняття
SELECT * FROM attendance
WHERE session_id = 4 AND client_id = 1;

DELETE FROM attendance
WHERE session_id = 4 AND client_id = 1;

SELECT * FROM attendance
WHERE session_id = 4 AND client_id = 1;

-- видалити всі невдалі платежі зі статусом failed для конкретного дня
SELECT *
FROM payment
WHERE status = 'failed' AND DATE(timestamp) = '2025-10-10';

DELETE FROM payment 
WHERE status = 'failed' AND DATE(timestamp) = '2025-10-10';

SELECT *
FROM payment
WHERE status = 'failed' AND DATE(timestamp) = '2025-10-10';
