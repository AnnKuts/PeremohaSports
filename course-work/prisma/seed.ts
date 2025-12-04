import {PrismaClient} from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  const contactData = [
    {phone: "380501112233", email: "ivan.petrenko@example.com"},
    {phone: "380671234567", email: "olena.ivanova@example.com"},
    {phone: "380931112244", email: "oleh.koval@example.com"},
    {phone: "380631231231", email: "maria.bondar@example.com"},
    {phone: "380991111222", email: "serhiy.melnyk@example.com"},
    {phone: "380681234567", email: "anna.shevchenko@example.com"},
  ];
  await prisma.contact_data.createMany({data: contactData});

  const clientData = [
    {first_name: "Іван", last_name: "Петренко", gender: "male", contact_data_id: 1},
    {first_name: "Олена", last_name: "Іванова", gender: "female", contact_data_id: 2},
    {first_name: "Олег", last_name: "Коваль", gender: "male", contact_data_id: 3},
    {first_name: "Марія", last_name: "Бондар", gender: "female", contact_data_id: 4},
  ];
  await prisma.client.createMany({data: clientData});

  const trainerData = [
    {first_name: "Сергій", last_name: "Мельник", is_admin: true, contact_data_id: 5},
    {first_name: "Анна", last_name: "Шевченко", is_admin: false, contact_data_id: 6},
  ];
  await prisma.trainer.createMany({data: trainerData});

  const gymData = [
    {address: "м. Київ, вул. Спортивна, 10"},
    {address: "м. Львів, просп. Свободи, 25"},
  ];
  await prisma.gym.createMany({data: gymData});

  const roomData = [
    {capacity: 80, gym_id: 1},
    {capacity: 90, gym_id: 1},
    {capacity: 50, gym_id: 2},
    {capacity: 70, gym_id: 2},
  ];
  await prisma.room.createMany({data: roomData});

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
  await prisma.class_type.createMany({data: classTypeData});

  const roomClassTypeData = [
    {room_id: 1, class_type_id: 1},
    {room_id: 2, class_type_id: 2},
    {room_id: 3, class_type_id: 3},
    {room_id: 4, class_type_id: 1},
  ];
  await prisma.room_class_type.createMany({data: roomClassTypeData});

  const classSessionData = [
    {room_id: 1, class_type_id: 1, capacity: 20, date: new Date("2025-10-10"), trainer_id: 1},
    {room_id: 4, class_type_id: 1, capacity: 15, date: new Date("2025-10-11"), trainer_id: 1},
    {room_id: 3, class_type_id: 3, capacity: 10, date: new Date("2025-10-12"), trainer_id: 2},
    {room_id: 2, class_type_id: 2, capacity: 12, date: new Date("2025-10-13"), trainer_id: 2},
  ];
  await prisma.class_session.createMany({data: classSessionData});

  const qualificationData = [
    {trainer_id: 1, class_type_id: 1},
    {trainer_id: 1, class_type_id: 2},
    {trainer_id: 2, class_type_id: 3},
  ];
  await prisma.qualification.createMany({data: qualificationData});

  const trainerPlacementData = [
    {trainer_id: 1, gym_id: 1},
    {trainer_id: 2, gym_id: 2},
  ];
  await prisma.trainer_placement.createMany({data: trainerPlacementData});

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
  await prisma.membership.createMany({data: membershipData});

  const paymentData = [
    {amount: 700, status: "completed", method: "online", client_id: 4, membership_id: 1},
    {amount: 100, status: "pending", method: "card", client_id: 1, membership_id: 2},
    {amount: 700, status: "failed", method: "online", client_id: 4},
    {amount: 700, status: "completed", method: "online", client_id: 4, membership_id: 3},
    {amount: 500, status: "completed", method: "card", client_id: 4, membership_id: 4},
    {amount: 300, status: "completed", method: "online", client_id: 1, membership_id: 5},
    {amount: 800, status: "completed", method: "online", client_id: 4, membership_id: 6},
  ];
  await prisma.payment.createMany({data: paymentData});

  const attendanceData = [
    {session_id: 3, client_id: 4, status: "cancelled"},
    {session_id: 4, client_id: 1, status: "booked"},
  ];
  await prisma.attendance.createMany({data: attendanceData});

  console.log("seed completed");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });