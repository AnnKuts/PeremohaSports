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