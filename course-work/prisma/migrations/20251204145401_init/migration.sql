-- CreateEnum
CREATE TYPE "attendance_status" AS ENUM ('booked', 'attended', 'missed', 'cancelled');

-- CreateEnum
CREATE TYPE "class_name" AS ENUM ('workout', 'yoga', 'swimming pool');

-- CreateEnum
CREATE TYPE "gender_name" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "level_name" AS ENUM ('beginner', 'intermediate', 'advanced');

-- CreateEnum
CREATE TYPE "membership_status" AS ENUM ('active', 'expired', 'frozen', 'cancelled');

-- CreateEnum
CREATE TYPE "payment_method" AS ENUM ('cash', 'card', 'online');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- CreateTable
CREATE TABLE "attendance" (
    "session_id" INTEGER NOT NULL,
    "client_id" INTEGER NOT NULL,
    "status" "attendance_status" NOT NULL DEFAULT 'booked',

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("session_id","client_id")
);

-- CreateTable
CREATE TABLE "class_session" (
    "session_id" SERIAL NOT NULL,
    "room_id" INTEGER NOT NULL,
    "class_type_id" INTEGER NOT NULL,
    "duration" interval NOT NULL,
    "capacity" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "trainer_id" INTEGER NOT NULL,

    CONSTRAINT "class_session_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "class_type" (
    "class_type_id" SERIAL NOT NULL,
    "name" "class_name" NOT NULL,
    "description" TEXT,
    "level" "level_name" NOT NULL,

    CONSTRAINT "class_type_pkey" PRIMARY KEY ("class_type_id")
);

-- CreateTable
CREATE TABLE "client" (
    "client_id" SERIAL NOT NULL,
    "first_name" VARCHAR(32) NOT NULL,
    "last_name" VARCHAR(32) NOT NULL,
    "gender" "gender_name" NOT NULL,
    "contact_data_id" INTEGER NOT NULL,

    CONSTRAINT "client_pkey" PRIMARY KEY ("client_id")
);

-- CreateTable
CREATE TABLE "contact_data" (
    "contact_data_id" SERIAL NOT NULL,
    "phone" VARCHAR(32) NOT NULL,
    "email" VARCHAR(32) NOT NULL,

    CONSTRAINT "contact_data_pkey" PRIMARY KEY ("contact_data_id")
);

-- CreateTable
CREATE TABLE "gym" (
    "gym_id" SERIAL NOT NULL,
    "address" VARCHAR(60) NOT NULL,

    CONSTRAINT "gym_pkey" PRIMARY KEY ("gym_id")
);

-- CreateTable
CREATE TABLE "membership" (
    "membership_id" SERIAL NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "status" "membership_status" NOT NULL DEFAULT 'active',
    "is_dispisable" BOOLEAN NOT NULL DEFAULT false,
    "client_id" INTEGER NOT NULL,
    "class_type_id" INTEGER NOT NULL,

    CONSTRAINT "membership_pkey" PRIMARY KEY ("membership_id")
);

-- CreateTable
CREATE TABLE "payment" (
    "payment_id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "payment_status" NOT NULL DEFAULT 'pending',
    "method" "payment_method" NOT NULL,
    "client_id" INTEGER NOT NULL,
    "membership_id" INTEGER,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "qualification" (
    "trainer_id" INTEGER NOT NULL,
    "class_type_id" INTEGER NOT NULL,

    CONSTRAINT "qualification_pkey" PRIMARY KEY ("trainer_id","class_type_id")
);

-- CreateTable
CREATE TABLE "room" (
    "room_id" SERIAL NOT NULL,
    "capacity" INTEGER NOT NULL,
    "gym_id" INTEGER NOT NULL,

    CONSTRAINT "room_pkey" PRIMARY KEY ("room_id")
);

-- CreateTable
CREATE TABLE "room_class_type" (
    "room_id" INTEGER NOT NULL,
    "class_type_id" INTEGER NOT NULL,

    CONSTRAINT "room_class_type_pkey" PRIMARY KEY ("room_id","class_type_id")
);

-- CreateTable
CREATE TABLE "trainer" (
    "trainer_id" SERIAL NOT NULL,
    "first_name" VARCHAR(32) NOT NULL,
    "last_name" VARCHAR(32) NOT NULL,
    "is_admin" BOOLEAN NOT NULL,
    "contact_data_id" INTEGER NOT NULL,

    CONSTRAINT "trainer_pkey" PRIMARY KEY ("trainer_id")
);

-- CreateTable
CREATE TABLE "trainer_placement" (
    "trainer_id" INTEGER NOT NULL,
    "gym_id" INTEGER NOT NULL,

    CONSTRAINT "trainer_placement_pkey" PRIMARY KEY ("trainer_id","gym_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contact_data_phone_key" ON "contact_data"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "contact_data_email_key" ON "contact_data"("email");

-- CreateIndex
CREATE UNIQUE INDEX "gym_address_key" ON "gym"("address");

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"("client_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "class_session"("session_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "class_session" ADD CONSTRAINT "class_session_room_id_class_type_id_fkey" FOREIGN KEY ("room_id", "class_type_id") REFERENCES "room_class_type"("room_id", "class_type_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "class_session" ADD CONSTRAINT "class_session_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "trainer"("trainer_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "client" ADD CONSTRAINT "client_contact_data_id_fkey" FOREIGN KEY ("contact_data_id") REFERENCES "contact_data"("contact_data_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "membership" ADD CONSTRAINT "membership_class_type_id_fkey" FOREIGN KEY ("class_type_id") REFERENCES "class_type"("class_type_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "membership" ADD CONSTRAINT "membership_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"("client_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"("client_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "membership"("membership_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "qualification" ADD CONSTRAINT "qualification_class_type_id_fkey" FOREIGN KEY ("class_type_id") REFERENCES "class_type"("class_type_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "qualification" ADD CONSTRAINT "qualification_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "trainer"("trainer_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "room" ADD CONSTRAINT "room_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "gym"("gym_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "room_class_type" ADD CONSTRAINT "room_class_type_class_type_id_fkey" FOREIGN KEY ("class_type_id") REFERENCES "class_type"("class_type_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "room_class_type" ADD CONSTRAINT "room_class_type_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "room"("room_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "trainer" ADD CONSTRAINT "trainer_contact_data_id_fkey" FOREIGN KEY ("contact_data_id") REFERENCES "contact_data"("contact_data_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "trainer_placement" ADD CONSTRAINT "trainer_placement_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "gym"("gym_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "trainer_placement" ADD CONSTRAINT "trainer_placement_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "trainer"("trainer_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
