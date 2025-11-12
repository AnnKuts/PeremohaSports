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
