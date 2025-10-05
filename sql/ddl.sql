CREATE TABLE IF NOT EXISTS contact_data
(
  contact_data_id serial PRIMARY KEY,
  phone varchar(32) NOT NULL UNIQUE,
  email varchar(32) NOT NULL UNIQUE
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_name') THEN
    CREATE TYPE gender_name AS ENUM ('male', 'female');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS client
(
  client_id serial PRIMARY KEY,
  first_name varchar(32) NOT NULL,
  last_name varchar(32) NOT NULL,
  gender gender_name NOT NULL,
  contact_data_id integer NOT NULL references contact_data(contact_data_id)
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'specialty_name') THEN
    CREATE TYPE specialty_name AS ENUM ('workout', 'yoga', 'swimming pool');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS trainer
(
  trainer_id serial PRIMARY KEY,
  first_name varchar(32) NOT NULL,
  last_name varchar(32) NOT NULL,
  specialty specialty_name NOT NULL,
  contact_data_id integer NOT NULL references contact_data(contact_data_id)
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
  gym_id integer NOT NULL references gym(gym_id)
);