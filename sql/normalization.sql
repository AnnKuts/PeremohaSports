DO
$$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_name') THEN
      CREATE TYPE gender_name AS ENUM ('male', 'female');
    END IF;
  END
$$;

DO
$$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'class_name') THEN
      CREATE TYPE class_name AS ENUM ('workout', 'yoga', 'swimming pool');
    END IF;
  END
$$;

DO
$$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'level_name') THEN
      CREATE TYPE level_name AS ENUM ('beginner', 'intermediate', 'advanced');
    END IF;
  END
$$;

DO
$$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'membership_status') THEN
      CREATE TYPE membership_status AS ENUM ('active', 'expired', 'frozen', 'cancelled');
    END IF;
  END
$$;

DO
$$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
      CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
    END IF;
  END
$$;

DO
$$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
      CREATE TYPE payment_method AS ENUM ('cash', 'card', 'online');
    END IF;
  END
$$;

DO
$$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attendance_status') THEN
      CREATE TYPE attendance_status AS ENUM ('booked', 'attended', 'missed', 'cancelled');
    END IF;
  END
$$;

CREATE TABLE IF NOT EXISTS contact_data
(
  contact_data_id serial PRIMARY KEY,
  phone varchar(32) NOT NULL UNIQUE,
  email varchar(32) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS client
(
  client_id serial PRIMARY KEY,
  first_name varchar(32) NOT NULL,
  last_name varchar(32) NOT NULL,
  gender gender_name NOT NULL,
  contact_data_id integer NOT NULL references contact_data (contact_data_id)
);

CREATE TABLE IF NOT EXISTS trainer
(
  trainer_id serial PRIMARY KEY,
  first_name varchar(32) NOT NULL,
  last_name varchar(32) NOT NULL,
  is_admin boolean NOT NULL,
  specialty class_name NOT NULL,
  contact_data_id integer NOT NULL references contact_data (contact_data_id)
);

CREATE TABLE IF NOT EXISTS gym
(
  gym_id serial PRIMARY KEY,
  address varchar(60) NOT NULL UNIQUE,
  gym_capacity integer NOT NULL CHECK (gym_capacity > 0)
);

CREATE TABLE IF NOT EXISTS room
(
  room_id serial PRIMARY KEY,
  capacity integer NOT NULL CHECK (capacity > 0),
  gym_id integer NOT NULL references gym (gym_id)
);

CREATE TABLE IF NOT EXISTS class_type
(
  class_type_id serial PRIMARY KEY,
  name class_name NOT NULL,
  description TEXT,
  level level_name NOT NULL
);

CREATE TABLE IF NOT EXISTS room_class_type
(
  room_id integer NOT NULL references room (room_id),
  class_type_id integer NOT NULL references class_type (class_type_id),
  PRIMARY KEY (room_id, class_type_id)
);

CREATE TABLE IF NOT EXISTS class_session
(
  session_id serial PRIMARY KEY,
  room_id integer NOT NULL,
  class_type_id integer NOT NULL,
  duration interval NOT NULL CHECK (duration > interval '0') CHECK (duration >= interval '30 minutes' AND duration <= interval '2 hours'),
  capacity integer NOT NULL CHECK (capacity > 0),
  --capacity should be less than or equal to room capacity
  date date NOT NULL,
  trainer_id integer NOT NULL references trainer (trainer_id),
  FOREIGN KEY (room_id, class_type_id)
    REFERENCES room_class_type (room_id, class_type_id)
);

CREATE TABLE IF NOT EXISTS qualification
(
  trainer_id integer NOT NULL references trainer (trainer_id),
  class_type_id integer NOT NULL references class_type (class_type_id),
  PRIMARY KEY (trainer_id, class_type_id)
);

CREATE TABLE IF NOT EXISTS trainer_placement
(
  trainer_id integer NOT NULL references trainer (trainer_id),
  gym_id integer NOT NULL references gym (gym_id),
  PRIMARY KEY (trainer_id, gym_id)
);

CREATE TABLE IF NOT EXISTS membership
(
  membership_id serial PRIMARY KEY,
  start_date date NOT NULL,
  end_date date NOT NULL,
  price numeric(10, 2) NOT NULL CHECK (price >= 0),
  status membership_status NOT NULL DEFAULT 'active',
  is_dispisable boolean NOT NULL DEFAULT false,
  client_id integer NOT NULL references client (client_id),
  class_type_id integer NOT NULL references class_type (class_type_id)
);

CREATE TABLE IF NOT EXISTS payment
(
  payment_id serial PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  amount numeric(10, 2) NOT NULL CHECK (amount >= 0),
  status payment_status NOT NULL DEFAULT 'pending',
  method payment_method NOT NULL,
  client_id integer NOT NULL references client (client_id),
  membership_id integer references membership (membership_id)
);

CREATE TABLE IF NOT EXISTS attendance
(
  session_id integer NOT NULL references class_session (session_id),
  client_id integer NOT NULL references client (client_id),
  status attendance_status NOT NULL DEFAULT 'booked',
  PRIMARY KEY (session_id, client_id)
);

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
    ('2025-11-11', '2025-12-12', 700.00, 'active', false, 4, 3),
    ('2025-11-16', '2025-11-17', 100.00, 'active', true, 1, 2),
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


-- Normalization

-- Delete the specialty attribute in the trainer table
ALTER TABLE trainer
DROP COLUMN specialty;

-- Delete the gym_capacity attribute in the gym table
ALTER TABLE gym
DROP COLUMN gym_capacity;

-- Calculating gym_capacity via query
SELECT g.gym_id, SUM(r.capacity) AS gym_capacity
FROM gym g
JOIN room r ON r.gym_id = g.gym_id
GROUP BY g.gym_id;

