-- main entities should be here

INSERT INTO class_type (name, description, level)
VALUES ('workout', 'Силові тренування for gym rats only', 'intermediate'),
  ('yoga', 'Подихайте маткою вперше на наших заняттях з йоги!', 'beginner'),
  ('swimming pool', 'Тренування у басейні для професійних плавців', 'advanced');

INSERT INTO room_class_type (room_id, class_type_id)
VALUES (1, 1),
  (2, 2),
  (3, 3),
  (4, 1);

INSERT INTO class_session (trainer_id, room_id, class_type_id, duration, capacity, date)
VALUES (1, 1, 1, INTERVAL '1 hour', 20, '2025-10-10'),
  (1, 4, 1, INTERVAL '45 minutes', 15, '2025-10-11'),
  (2, 3, 3, INTERVAL '1 hour 30 minutes', 10, '2025-10-12'),
  (2, 2, 2, INTERVAL '1 hour', 12, '2025-10-13');

INSERT INTO qualification (trainer_id, class_type_id)
VALUES (1, 1),
  (1, 2),
  (2, 3);

INSERT INTO trainer_placement (trainer_id, gym_id)
VALUES (1, 1),
  (2, 2);
