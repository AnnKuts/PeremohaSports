import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  await prisma.contact_data.createMany({
    data: [
      { phone: "380501112233", email: "ivan.petrenko@example.com" },
      { phone: "380671234567", email: "olena.ivanova@example.com" },
      { phone: "380931112244", email: "oleh.koval@example.com" },
      { phone: "380631231231", email: "maria.bondar@example.com" },
      { phone: "380991111222", email: "serhiy.melnyk@example.com" },
      { phone: "380681234567", email: "anna.shevchenko@example.com" },
    ],
  });

  await prisma.client.createMany({
    data: [
      { first_name: "Іван", last_name: "Петренко", gender: "male", contact_data_id: 1 },
      { first_name: "Олена", last_name: "Іванова", gender: "female", contact_data_id: 2 },
      { first_name: "Олег", last_name: "Коваль", gender: "male", contact_data_id: 3 },
      { first_name: "Марія", last_name: "Бондар", gender: "female", contact_data_id: 4 },
    ],
  });

  await prisma.trainer.createMany({
    data: [
      { first_name: "Сергій", last_name: "Мельник", is_admin: true, contact_data_id: 5 },
      { first_name: "Анна", last_name: "Шевченко", is_admin: false, contact_data_id: 6 },
    ],
  });

  await prisma.gym.createMany({
    data: [
      { address: "м. Київ, вул. Спортивна, 10" },
      { address: "м. Львів, просп. Свободи, 25" },
    ],
  });

  await prisma.room.createMany({
    data: [
      { capacity: 80, gym_id: 1 },
      { capacity: 90, gym_id: 1 },
      { capacity: 50, gym_id: 2 },
      { capacity: 70, gym_id: 2 },
    ],
  });

  await prisma.class_type.createMany({
    data: [
      { name: "workout", description: "Силові тренування for gym rats only", level: "intermediate" },
      { name: "yoga", description: "Подихайте маткою вперше на наших заняттях з йоги!", level: "beginner" },
      { name: "swimming_pool", description: "Тренування у басейні для професійних плавців", level: "advanced" },
    ],
  });

  await prisma.room_class_type.createMany({
    data: [
      { room_id: 1, class_type_id: 1 },
      { room_id: 2, class_type_id: 2 },
      { room_id: 3, class_type_id: 3 },
      { room_id: 4, class_type_id: 1 },
    ],
  });

  await prisma.$executeRawUnsafe(`
    INSERT INTO class_session (room_id, class_type_id, duration, capacity, date, trainer_id)
    VALUES (1, 1, '01:30:00', 20, '2025-10-10', 1),
      (4, 1, '01:00:00', 15, '2025-10-11', 1),
      (3, 3, '02:00:00', 10, '2025-10-12', 2),
      (2, 2, '01:15:00', 12, '2025-10-13', 2);
  `);

  await prisma.qualification.createMany({
    data: [
      { trainer_id: 1, class_type_id: 1 },
      { trainer_id: 1, class_type_id: 2 },
      { trainer_id: 2, class_type_id: 3 },
    ],
  });

  await prisma.trainer_placement.createMany({
    data: [
      { trainer_id: 1, gym_id: 1 },
      { trainer_id: 2, gym_id: 2 },
    ],
  });

  await prisma.membership.createMany({
    data: [
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
    ],
  });

  await prisma.payment.createMany({
    data: [
      { amount: 700, status: "completed", method: "online", client_id: 4, membership_id: 1 },
      { amount: 100, status: "pending", method: "card", client_id: 1, membership_id: 2 },
      { amount: 700, status: "failed", method: "online", client_id: 4 },
      { amount: 700, status: "completed", method: "online", client_id: 4, membership_id: 3 },
    ],
  });

  await prisma.attendance.createMany({
    data: [
      { session_id: 3, client_id: 4, status: "cancelled" },
      { session_id: 4, client_id: 1, status: "booked" },
    ],
  });

  console.warn("seed completed");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
