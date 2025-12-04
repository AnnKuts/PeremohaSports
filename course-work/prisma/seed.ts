import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const contactData = [
    { phone: "380501112233", email: "ivan.petrenko@example.com" },
    { phone: "380671234567", email: "olena.ivanova@example.com" },
    { phone: "380931112244", email: "oleh.koval@example.com" },
    { phone: "380631231231", email: "maria.bondar@example.com" },
    { phone: "380991111222", email: "serhiy.melnyk@example.com" },
    { phone: "380681234567", email: "anna.shevchenko@example.com" },
  ];
  await prisma.$transaction(
    contactData.map((contact) => prisma.contact_data.create({ data: contact }))
  );

  const clientData = [
    { first_name: "Іван", last_name: "Петренко", gender: "male", contact_data_id: 1 },
    { first_name: "Олена", last_name: "Іванова", gender: "female", contact_data_id: 2 },
    { first_name: "Олег", last_name: "Коваль", gender: "male", contact_data_id: 3 },
    { first_name: "Марія", last_name: "Бондар", gender: "female", contact_data_id: 4 },
  ];
  await prisma.$transaction(
    clientData.map((client) => prisma.client.create({ data: client }))
  );

  const trainerData = [
    { first_name: "Сергій", last_name: "Мельник", is_admin: true, contact_data_id: 5 },
    { first_name: "Анна", last_name: "Шевченко", is_admin: false, contact_data_id: 6 },
  ];
  await prisma.$transaction(
    trainerData.map((trainer) => prisma.trainer.create({ data: trainer }))
  );

  const gymData = [
    { address: "м. Київ, вул. Спортивна, 10" },
    { address: "м. Львів, просп. Свободи, 25" },
  ];
  await prisma.$transaction(gymData.map((gym) => prisma.gym.create({ data: gym })));

  const roomData = [
    { capacity: 80, gym_id: 1 },
    { capacity: 90, gym_id: 1 },
    { capacity: 50, gym_id: 2 },
    { capacity: 70, gym_id: 2 },
  ];
  await prisma.$transaction(roomData.map((room) => prisma.room.create({ data: room })));

  const classTypeData = [
    {
      name: "workout",
      description: "Силові тренування for gym rats only",
      level: "intermediate",
    },
    {
      name: "yoga",
      description: "Подихайте маткою вперше на наших заняттях з йоги!",
      level: "beginner",
    },
    {
      name: "swimming pool",
      description: "Тренування у басейні для професійних плавців",
      level: "advanced",
    },
  ];
  await prisma.$transaction(
    classTypeData.map((ct) => prisma.class_type.create({ data: ct }))
  );

  const roomClassTypeData = [
    { room_id: 1, class_type_id: 1 },
    { room_id: 2, class_type_id: 2 },
    { room_id: 3, class_type_id: 3 },
    { room_id: 4, class_type_id: 1 },
  ];
  await prisma.$transaction(
    roomClassTypeData.map((rct) => prisma.room_class_type.create({ data: rct }))
  );

  const classSessionData = [
    { room_id: 1, class_type_id: 1, capacity: 20, date: new Date("2025-10-10"), trainer_id: 1 },
    { room_id: 4, class_type_id: 1, capacity: 15, date: new Date("2025-10-11"), trainer_id: 1 },
    { room_id: 3, class_type_id: 3, capacity: 10, date: new Date("2025-10-12"), trainer_id: 2 },
    { room_id: 2, class_type_id: 2, capacity: 12, date: new Date("2025-10-13"), trainer_id: 2 },
  ];
  await prisma.$transaction(
    classSessionData.map((session) => prisma.class_session.create({ data: session }))
  );

  const qualificationData = [
    { trainer_id: 1, class_type_id: 1 },
    { trainer_id: 1, class_type_id: 2 },
    { trainer_id: 2, class_type_id: 3 },
  ];
  await prisma.$transaction(
    qualificationData.map((qual) => prisma.qualification.create({ data: qual }))
  );

  const trainerPlacementData = [
    { trainer_id: 1, gym_id: 1 },
    { trainer_id: 2, gym_id: 2 },
  ];
  await prisma.$transaction(
    trainerPlacementData.map((tp) => prisma.trainer_placement.create({ data: tp }))
  );

  const membershipData = [
    {
      start_date: new Date("2025-10-10"),
      end_date: new Date("2025-11-11"),
      price: 700,
      status: "active",
      is_disposable: false,
      client_id: 4,
      class_type_id: 3,
    },
    {
      start_date: new Date("2025-10-13"),
      end_date: new Date("2025-10-14"),
      price: 100,
      status: "active",
      is_disposable: true,
      client_id: 1,
      class_type_id: 2,
    },
    {
      start_date: new Date("2025-09-05"),
      end_date: new Date("2025-10-06"),
      price: 700,
      status: "expired",
      is_disposable: false,
      client_id: 4,
      class_type_id: 3,
    },
  ];
  await prisma.$transaction(
    membershipData.map((mem) => prisma.membership.create({ data: mem }))
  );

  const paymentData = [
    { amount: 700, status: "completed", method: "online", client_id: 4, membership_id: 1 },
    { amount: 100, status: "pending", method: "card", client_id: 1, membership_id: 2 },
    { amount: 700, status: "failed", method: "online", client_id: 4 },
    { amount: 700, status: "completed", method: "online", client_id: 4, membership_id: 3 },
    { amount: 500, status: "completed", method: "card", client_id: 4, membership_id: 4 },
    { amount: 300, status: "completed", method: "online", client_id: 1, membership_id: 5 },
    { amount: 800, status: "completed", method: "online", client_id: 4, membership_id: 6 },
  ];
  await prisma.$transaction(
    paymentData.map((payment) => prisma.payment.create({ data: payment }))
  );

  const attendanceData = [
    { session_id: 3, client_id: 4, status: "cancelled" },
    { session_id: 4, client_id: 1, status: "booked" },
  ];
  await prisma.$transaction(
    attendanceData.map((att) => prisma.attendance.create({ data: att }))
  );

  console.log("seed completed");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });