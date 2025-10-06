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
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'specialty_name') THEN
      CREATE TYPE specialty_name AS ENUM ('workout', 'yoga', 'swimming pool');
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
  specialty specialty_name NOT NULL,
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
  name varchar(32) NOT NULL UNIQUE,
  description TEXT,
  level level_name NOT NULL
);

CREATE TABLE IF NOT EXISTS room_class_type
(
  room_id integer NOT NULL references room (room_id),
  class_type_id integer NOT NULL references class_type (class_type_id),
  name varchar(64),
  PRIMARY KEY (room_id, class_type_id)
);

CREATE TABLE IF NOT EXISTS class_session
(
  session_id serial PRIMARY KEY,
  trainer_id integer NOT NULL references trainer (trainer_id),
  room_id integer NOT NULL,
  class_type_id integer NOT NULL,
  duration interval NOT NULL CHECK (duration > interval '0'),
  capacity integer NOT NULL CHECK (capacity > 0),
  --capacity should be less than or equal to room capacity
  date date NOT NULL,
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