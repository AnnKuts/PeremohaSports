import prisma from "../src/lib/prisma";
import "dotenv/config";

export async function main() {
  console.log("Starting database seeding...");

  const contacts = await Promise.all([
    prisma.contact_data.create({ data: { phone: "380501112233", email: "ivan.petrenko@example.com" } }),
    prisma.contact_data.create({ data: { phone: "380671234567", email: "olena.ivanova@example.com" } }),
    prisma.contact_data.create({ data: { phone: "380931112244", email: "oleh.koval@example.com" } }),
    prisma.contact_data.create({ data: { phone: "380631231231", email: "maria.bondar@example.com" } }),
    prisma.contact_data.create({ data: { phone: "380991111222", email: "serhiy.melnyk@example.com" } }),
    prisma.contact_data.create({ data: { phone: "380681234587", email: "anna.shevchenko@example.com" } }),
  ]);

  await prisma.client.createMany({
    data: [
      { first_name: "Іван", last_name: "Петренко", gender: "male", contact_data_id: contacts[0].contact_data_id },
      { first_name: "Олена", last_name: "Іванова", gender: "female", contact_data_id: contacts[1].contact_data_id },
      { first_name: "Олег", last_name: "Коваль", gender: "male", contact_data_id: contacts[2].contact_data_id },
      { first_name: "Марія", last_name: "Бондар", gender: "female", contact_data_id: contacts[3].contact_data_id },
    ],
  });

  await prisma.trainer.createMany({
    data: [
      { first_name: "Сергій", last_name: "Мельник", is_admin: true, contact_data_id: contacts[4].contact_data_id },
      { first_name: "Анна", last_name: "Шевченко", is_admin: false, contact_data_id: contacts[5].contact_data_id },
    ],
  });

  const gyms = await Promise.all([
    prisma.gym.create({ data: { address: "м. Київ, вул. Спортивна, 10" } }),
    prisma.gym.create({ data: { address: "м. Львів, просп. Свободи, 25" } }),
  ]);

  const rooms = await Promise.all([
    prisma.room.create({ data: { capacity: 80, gym_id: gyms[0].gym_id } }),
    prisma.room.create({ data: { capacity: 90, gym_id: gyms[0].gym_id } }),
    prisma.room.create({ data: { capacity: 50, gym_id: gyms[1].gym_id } }),
    prisma.room.create({ data: { capacity: 70, gym_id: gyms[1].gym_id } }),
  ]);

  const classTypes = await Promise.all([
    prisma.class_type.create({ data: { name: "workout", description: "Силові тренування for gym rats only", level: "intermediate" } }),
    prisma.class_type.create({ data: { name: "yoga", description: "Подихайте маткою вперше на наших заняттях з йоги!", level: "beginner" } }),
    prisma.class_type.create({ data: { name: "swimming_pool", description: "Тренування у басейні для професійних плавців", level: "advanced" } }),
  ]);

  await prisma.room_class_type.createMany({
    data: [
      { room_id: rooms[0].room_id, class_type_id: classTypes[0].class_type_id },
      { room_id: rooms[1].room_id, class_type_id: classTypes[1].class_type_id },
      { room_id: rooms[2].room_id, class_type_id: classTypes[2].class_type_id },
      { room_id: rooms[3].room_id, class_type_id: classTypes[0].class_type_id },
    ],
  });

  const trainers = await prisma.trainer.findMany();

  await prisma.$executeRawUnsafe(`
    INSERT INTO class_session (room_id, class_type_id, duration, capacity, date, trainer_id)
    VALUES (${rooms[0].room_id}, ${classTypes[0].class_type_id}, '01:30:00', 20, '2025-10-10', ${trainers[0].trainer_id}),
      (${rooms[3].room_id}, ${classTypes[0].class_type_id}, '01:00:00', 15, '2025-10-11', ${trainers[0].trainer_id}),
      (${rooms[2].room_id}, ${classTypes[2].class_type_id}, '02:00:00', 10, '2025-10-12', ${trainers[1].trainer_id}),
      (${rooms[1].room_id}, ${classTypes[1].class_type_id}, '01:15:00', 12, '2025-10-13', ${trainers[1].trainer_id});
  `);

  await prisma.qualification.createMany({
    data: [
      { trainer_id: trainers[0].trainer_id, class_type_id: classTypes[0].class_type_id },
      { trainer_id: trainers[0].trainer_id, class_type_id: classTypes[1].class_type_id },
      { trainer_id: trainers[1].trainer_id, class_type_id: classTypes[2].class_type_id },
    ],
  });

  await prisma.trainer_placement.createMany({
    data: [
      { trainer_id: trainers[0].trainer_id, gym_id: gyms[0].gym_id },
      { trainer_id: trainers[1].trainer_id, gym_id: gyms[1].gym_id },
    ],
  });

  const clients = await prisma.client.findMany();

  const memberships = await Promise.all([
    prisma.membership.create({
      data: {
        start_date: new Date("2025-10-10"),
        end_date: new Date("2025-11-11"),
        price: 700,
        status: "active",
        is_disposable: false,
        client_id: clients[3].client_id, 
        class_type_id: classTypes[2].class_type_id,
      }
    }),
    prisma.membership.create({
      data: {
        start_date: new Date("2025-10-13"),
        end_date: new Date("2025-10-14"),
        price: 100,
        status: "active",
        is_disposable: true,
        client_id: clients[0].client_id, 
        class_type_id: classTypes[1].class_type_id,
      }
    }),
    prisma.membership.create({
      data: {
        start_date: new Date("2025-09-05"),
        end_date: new Date("2025-10-06"),
        price: 700,
        status: "expired",
        is_disposable: false,
        client_id: clients[3].client_id,
        class_type_id: classTypes[2].class_type_id,
      }
    }),
  ]);

  await prisma.payment.createMany({
    data: [
      { amount: 700, status: "completed", method: "online", client_id: clients[3].client_id, membership_id: memberships[0].membership_id },
      { amount: 100, status: "pending", method: "card", client_id: clients[0].client_id, membership_id: memberships[1].membership_id },
      { amount: 700, status: "failed", method: "online", client_id: clients[3].client_id },
      { amount: 700, status: "completed", method: "online", client_id: clients[3].client_id, membership_id: memberships[2].membership_id },
    ],
  });

  const sessions = await prisma.class_session.findMany();

  await prisma.attendance.createMany({
    data: [
      { session_id: sessions[2].session_id, client_id: clients[3].client_id, status: "cancelled" },
      { session_id: sessions[3].session_id, client_id: clients[0].client_id, status: "booked" },
    ],
  });

  console.log("seed completed");
}

if (process.argv[1].endsWith("prisma/seed.ts")) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}