--середня тривалість занять
SELECT AVG(duration) AS average_duration
FROM class_session;

--список клієнтів з їхніми контактними даними
SELECT c.first_name,
  c.last_name,
  cd.phone,
  cd.email
FROM client c
       JOIN contact_data cd ON c.contact_data_id = cd.contact_data_id;

--список тренерів з їхніми контактними даними
SELECT t.first_name,
  t.last_name,
  cd.phone,
  cd.email
FROM trainer t
       JOIN contact_data cd ON t.contact_data_id = cd.contact_data_id;

--клієнтки жіночої статі
SELECT c.first_name,
  c.last_name,
  cd.email
FROM client c
       JOIN contact_data cd ON c.contact_data_id = cd.contact_data_id
WHERE c.gender = 'female';

--тренери, які проводять заняття з басейну
SELECT t.first_name,
  t.last_name,
  t.specialty
FROM trainer t
       JOIN qualification q ON t.trainer_id = q.trainer_id
       JOIN class_type ct ON q.class_type_id = ct.class_type_id
WHERE ct.name = 'swimming pool';

--заняття певного типу з місткістю понад 15 осіб
SELECT cs.session_id,
  cs.date,
  cs.duration,
  cs.capacity
FROM class_session cs
WHERE cs.class_type_id = 1
  AND cs.capacity > 15;

--відвідуваність занять певного дня
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

--додати нового клієнта Романюка Артема з його контактними даними
INSERT INTO contact_data (phone, email)
VALUES ('380684654860', 'romaniukartem8@gmail.com');

INSERT INTO client (first_name, last_name, gender, contact_data_id)
SELECT 'Артем',
       'Романюк',
       'male',
       (SELECT contact_data_id FROM contact_data WHERE email = 'romaniukartem8@gmail.com');

--записати Артема Романюка на плавання
INSERT INTO attendance(session_id, client_id, status)
VALUES
  (3, (SELECT client_id FROM client WHERE first_name = 'Артем' AND last_name = 'Романюк'), 'booked');

--змінити контактний номер клієнта Артема
UPDATE contact_data
SET phone = '38050356727'
WHERE email = 'romaniukartem8@gmail.com';

--змінити місткість заняття з ідентифікатором 1 на 25 осіб
UPDATE class_session
SET capacity = 25
WHERE session_id = 1;

--видалити всі платежі для абонементів зі статусом expired
DELETE FROM payment
WHERE membership_id IN (
    SELECT membership_id FROM membership WHERE status = 'expired'
);

DELETE FROM membership
WHERE status = 'expired';

--видалити скасовані заняття
DELETE FROM attendance
WHERE status = 'cancelled';


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
WHERE ct.name in ('yoga', 'workout');

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
WHERE status = 'failed' AND DATE(created_at) = '2025-10-10';

DELETE FROM payment 
WHERE status = 'failed' AND DATE(created_at) = '2025-10-10';

SELECT *
FROM payment
WHERE status = 'failed' AND DATE(created_at) = '2025-10-10';

-- Count total sessions per trainer
SELECT t.trainer_id, t.first_name, t.last_name, COUNT(cs.session_id) AS total_sessions
FROM trainer t
LEFT JOIN class_session cs ON t.trainer_id = cs.trainer_id
GROUP BY t.trainer_id;

-- Show clients with frozen and expired memberships
SELECT c.client_id, c.first_name, c.last_name, m.status, m.start_date, m.end_date
FROM client c
JOIN membership m ON c.client_id = m.client_id
WHERE m.status IN ('frozen', 'expired')
ORDER BY m.status, c.last_name, c.first_name;

-- Sessions in gyms with capacity over 100
SELECT cs.session_id, cs.date, g.address AS gym_address, r.capacity AS room_capacity
FROM class_session cs
JOIN room r ON cs.room_id = r.room_id
JOIN gym g ON r.gym_id = g.gym_id
WHERE g.gym_capacity > 100;

-- Mark all booked attendance for session ID 1 as attended
INSERT INTO attendance (session_id, client_id, status)
SELECT 1, client_id, 'attended'
FROM attendance
WHERE session_id = 1 AND status = 'booked';

-- Delete future sessions in room ID 1
DELETE FROM class_session
WHERE room_id = 1
  AND date > CURRENT_DATE;

-- Expire memberships that ended before today
UPDATE membership
SET status = 'expired'
WHERE end_date < CURRENT_DATE;