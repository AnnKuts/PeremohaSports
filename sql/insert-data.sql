INSERT INTO contact_data (phone, email)
VALUES
    ('380501112233', 'ivan.petrenko@example.com'),
    ('380671234567', 'olena.ivanova@example.com'),
    ('380931112244', 'oleh.koval@example.com'),
    ('380631231231', 'maria.bondar@example.com'),
    ('380991111222', 'serhiy.melnyk@example.com'),
    ('380681234567', 'anna.shevchenko@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO client (first_name, last_name, gender, contact_data_id)
VALUES
    ('Іван', 'Петренко', 'male', 1),
    ('Олена', 'Іванова', 'female', 2),
    ('Олег', 'Коваль', 'male', 3),
    ('Марія', 'Бондар', 'female', 4)
ON CONFLICT DO NOTHING;

INSERT INTO trainer (first_name, last_name, is_admin, specialty, contact_data_id)
VALUES
    ('Сергій', 'Мельник', true, 'workout', 5),
    ('Анна', 'Шевченко', false, 'swimming pool', 6)
ON CONFLICT DO NOTHING;

INSERT INTO gym (address, gym_capacity)
VALUES
    ('м. Київ, вул. Спортивна, 10', 200),
    ('м. Львів, просп. Свободи, 25', 150)
ON CONFLICT (address) DO NOTHING;

INSERT INTO room (capacity, gym_id)
VALUES
    (80, 1),
    (90, 1),
    (50, 2),
    (70, 2)
ON CONFLICT DO NOTHING;

INSERT INTO class_type (name, description, level)
VALUES
    ('workout', 'Силові тренування for gym rats only', 'intermediate'),
    ('yoga', 'Подихайте маткою вперше на наших заняттях з йоги!', 'beginner'),
    ('swimming pool', 'Тренування у басейні для професійних плавців', 'advanced')
ON CONFLICT DO NOTHING;

INSERT INTO room_class_type (room_id, class_type_id)
VALUES
    (1, 1),
    (2, 2),
    (3, 3),
    (4, 1)
ON CONFLICT DO NOTHING;

INSERT INTO class_session (room_id, class_type_id, duration, capacity, date, trainer_id)
VALUES
    (1, 1, INTERVAL '1 hour', 20, '2025-10-10', 1),
    (4, 1, INTERVAL '45 minutes', 15, '2025-10-11', 1),
    (3, 3, INTERVAL '1 hour 30 minutes', 10, '2025-10-12', 2),
    (2, 2, INTERVAL '1 hour', 12, '2025-10-13', 2)
ON CONFLICT DO NOTHING;

INSERT INTO qualification (trainer_id, class_type_id)
VALUES
    (1, 1),
    (1, 2),
    (2, 3)
ON CONFLICT DO NOTHING;

INSERT INTO trainer_placement (trainer_id, gym_id)
VALUES
    (1, 1),
    (2, 2)
ON CONFLICT DO NOTHING;

INSERT INTO membership (start_date, end_date, price, status, is_dispisable, client_id, class_type_id)
VALUES
    ('2025-10-10', '2025-11-11', 700.00, 'active', false, 4, 3),
    ('2025-10-13', '2025-10-14', 100.00, 'active', true, 1, 2),
    ('2025-09-05', '2025-10-06', 700.00, 'expired', false, 4, 3)
ON CONFLICT DO NOTHING;

INSERT INTO payment (amount, status, method, client_id, membership_id)
VALUES
    (700, 'completed', 'online', 4, 1),
    (100, 'pending', 'card', 1, 2),
    (700, 'failed', 'online', 4, NULL),
    (700, 'completed', 'online', 4, 3)
ON CONFLICT DO NOTHING;

INSERT INTO attendance (session_id, client_id, status)
VALUES
    (3, 4, 'cancelled'),
    (4, 1, 'booked')
ON CONFLICT DO NOTHING;