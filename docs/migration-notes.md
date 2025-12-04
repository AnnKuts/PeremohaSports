# Migration notes with Prisma 
This section describes the database migration process, explaining how schema changes are versioned and applied to keep the database structure consistent with application models. Migrations support controlled schema evolution and ensure reliability across development environments

## Prisma initialization

```bash
npm install prisma --save-dev
npm install @prisma/client
npx prisma init
```
configured database url in .env:

```env
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<dbname>?schema=public"
```

```bash
npx prisma db pull
```

## Migrations

### 1. Init

```bash
npx prisma migrate dev --name init
```

### 2. Add feedback table 

```bash
npx prisma migrate dev --name add-feedback-table
```

```Prisma
  model feedback {
  id        Int      @id @default(autoincrement())
  rating    Int
  comment   String?
  createdAt DateTime @default(now())
  client    client   @relation(fields: [clientId], references: [client_id])
  clientId  Int
  session   class_session @relation(fields: [sessionId], references: [session_id])
  sessionId Int
}
```

### 3. Rename disposable field

```bash
npx prisma migrate dev --name rename-disposable-field
```

Before:
```Prisma
model membership {
membership_id Int               @id @default(autoincrement())
start_date    DateTime          @db.Date
end_date      DateTime          @db.Date
price         Decimal           @db.Decimal(10, 2)
status        membership_status @default(active)
is_disposable Boolean           @default(false)
client_id     Int
class_type_id Int
class_type    class_type        @relation(fields: [class_type_id], references: [class_type_id], onDelete: NoAction, onUpdate: NoAction)
client        client            @relation(fields: [client_id], references: [client_id], onDelete: NoAction, onUpdate: NoAction)
payment       payment[]
}
```

After:
```Prisma 
 model membership {
  membership_id Int               @id @default(autoincrement())
  start_date    DateTime          @db.Date
  end_date      DateTime          @db.Date
  price         Decimal           @db.Decimal(10, 2)
  status        membership_status @default(active)
  is_disposable Boolean           @default(false)
  client_id     Int
  class_type_id Int
  class_type    class_type        @relation(fields: [class_type_id], references: [class_type_id], onDelete: NoAction, onUpdate: NoAction)
  client        client            @relation(fields: [client_id], references: [client_id], onDelete: NoAction, onUpdate: NoAction)
  payment       payment[]
}
```
### 4. Delete comment field

```bash
npx prisma migrate dev --name drop-comment-column`
```

Before:
```Prisma
  model feedback {
  id        Int      @id @default(autoincrement())
  rating    Int
  comment   String?
  createdAt DateTime @default(now())
  client    client   @relation(fields: [clientId], references: [client_id])
  clientId  Int
  session   class_session @relation(fields: [sessionId], references: [session_id])
  sessionId Int
}
```

After:
```Prisma
model feedback {
id        Int      @id @default(autoincrement())
rating    Int
comment   String?
createdAt DateTime @default(now())
client    client   @relation(fields: [clientId], references: [client_id])
clientId  Int
session   class_session @relation(fields: [sessionId], references: [session_id])
sessionId Int
}
```

### 5. Drop feedback table

```bash
npx prisma migrate dev --name drop-feedback-table
```

```Prisma
model feedback {
id        Int      @id @default(autoincrement())
rating    Int
createdAt DateTime @default(now())
client    client   @relation(fields: [clientId], references: [client_id])
clientId  Int
session   class_session @relation(fields: [sessionId], references: [session_id])
sessionId Int
}
```
### 6. Seed data

[seed.ts](https://github.com/AnnKuts/PeremohaSports/blob/course-work/course-work/prisma/seed.ts)
```TypeScript
import {PrismaClient, Prisma} from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  await prisma.contact_data.createMany({
    data: [
      {phone: "380501112233", email: "ivan.petrenko@example.com"},
      {phone: "380671234567", email: "olena.ivanova@example.com"},
      {phone: "380931112244", email: "oleh.koval@example.com"},
      {phone: "380631231231", email: "maria.bondar@example.com"},
      {phone: "380991111222", email: "serhiy.melnyk@example.com"},
      {phone: "380681234567", email: "anna.shevchenko@example.com"},
    ],
  });

  await prisma.client.createMany({
    data: [
      {first_name: "Іван", last_name: "Петренко", gender: "male", contact_data_id: 1},
      {first_name: "Олена", last_name: "Іванова", gender: "female", contact_data_id: 2},
      {first_name: "Олег", last_name: "Коваль", gender: "male", contact_data_id: 3},
      {first_name: "Марія", last_name: "Бондар", gender: "female", contact_data_id: 4},
    ],
  });

  await prisma.trainer.createMany({
    data: [
      {first_name: "Сергій", last_name: "Мельник", is_admin: true, contact_data_id: 5},
      {first_name: "Анна", last_name: "Шевченко", is_admin: false, contact_data_id: 6},
    ],
  });

  await prisma.gym.createMany({
    data: [
      {address: "м. Київ, вул. Спортивна, 10"},
      {address: "м. Львів, просп. Свободи, 25"},
    ],
  });

  await prisma.room.createMany({
    data: [
      {capacity: 80, gym_id: 1},
      {capacity: 90, gym_id: 1},
      {capacity: 50, gym_id: 2},
      {capacity: 70, gym_id: 2},
    ],
  });

  await prisma.class_type.createMany({
    data: [
      {name: "workout", description: "Силові тренування for gym rats only", level: "intermediate"},
      {name: "yoga", description: "Подихайте маткою вперше на наших заняттях з йоги!", level: "beginner"},
      {name: "swimming_pool", description: "Тренування у басейні для професійних плавців", level: "advanced"},
    ],
  });

  await prisma.room_class_type.createMany({
    data: [
      {room_id: 1, class_type_id: 1},
      {room_id: 2, class_type_id: 2},
      {room_id: 3, class_type_id: 3},
      {room_id: 4, class_type_id: 1},
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
      {trainer_id: 1, class_type_id: 1},
      {trainer_id: 1, class_type_id: 2},
      {trainer_id: 2, class_type_id: 3},
    ],
  });

  await prisma.trainer_placement.createMany({
    data: [
      {trainer_id: 1, gym_id: 1},
      {trainer_id: 2, gym_id: 2},
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
      {amount: 700, status: "completed", method: "online", client_id: 4, membership_id: 1},
      {amount: 100, status: "pending", method: "card", client_id: 1, membership_id: 2},
      {amount: 700, status: "failed", method: "online", client_id: 4},
      {amount: 700, status: "completed", method: "online", client_id: 4, membership_id: 3},
    ],
  });

  await prisma.attendance.createMany({
    data: [
      {session_id: 3, client_id: 4, status: "cancelled"},
      {session_id: 4, client_id: 1, status: "booked"},
    ],
  });

  console.log("seed completed");
}

main()
  .catch(console.error)
  .finally(async () => prisma.$disconnect());
```
### 7. Run seed.ts

```bash
npx prisma db seed
```
Result:

<img width="783" height="158" alt="npx prisma db seed" src="https://github.com/user-attachments/assets/de6db197-af85-4f23-9e9b-78bd06c41f17" />


### 8. Check prisma studio
  
```bash
npx prisma studio
```
Result: 

#### attendance
<img width="1186" height="205" alt="Screenshot 2025-12-05 at 00 48 12" src="https://github.com/user-attachments/assets/08f769a5-a2bd-42f7-a118-e30dd0b4e27b" />

#### class_session
<img width="1437" height="205" alt="Screenshot 2025-12-05 at 00 53 04" src="https://github.com/user-attachments/assets/77b12b81-ec95-40b6-9069-6d0f095c996e" />

#### class_type
<img width="1173" height="185" alt="Screenshot 2025-12-05 at 00 53 36" src="https://github.com/user-attachments/assets/ca30e743-ca4a-4879-ab4e-4e247ae2d3e4" />

#### client
<img width="1421" height="185" alt="Screenshot 2025-12-05 at 00 53 59" src="https://github.com/user-attachments/assets/d2f58234-90d9-4c7a-97a4-d3a320d0db5a" />

#### contact_data
<img width="758" height="237" alt="Screenshot 2025-12-05 at 00 54 32" src="https://github.com/user-attachments/assets/3673d869-2f86-4f4b-b684-cb90c56b7e41" />

#### gym
<img width="660" height="176" alt="Screenshot 2025-12-05 at 01 02 19" src="https://github.com/user-attachments/assets/cb7b573c-e846-452f-9bc5-e0d0406ed7b2" />

#### membership
<img width="1422" height="176" alt="Screenshot 2025-12-05 at 01 02 39" src="https://github.com/user-attachments/assets/02128b86-9dd8-4e45-b35d-53534041940c" />

#### payment
<img width="1422" height="176" alt="Screenshot 2025-12-05 at 01 03 04" src="https://github.com/user-attachments/assets/9308d1c6-9872-4951-8216-26d59fbdf3a3" />

#### qualification
<img width="632" height="176" alt="Screenshot 2025-12-05 at 01 03 26" src="https://github.com/user-attachments/assets/cf51ebdf-1ae9-47b1-9c0a-c589cddde954" />

#### room
<img width="875" height="204" alt="Screenshot 2025-12-05 at 01 04 31" src="https://github.com/user-attachments/assets/3e5abb19-3336-45ff-b779-5171add89417" />

#### room_class_type
<img width="875" height="204" alt="Screenshot 2025-12-05 at 01 04 53" src="https://github.com/user-attachments/assets/dc62bb4c-66e4-48db-af0b-725f9f94f40b" />

#### trainer
<img width="1497" height="150" alt="Screenshot 2025-12-05 at 01 05 22" src="https://github.com/user-attachments/assets/3793e01c-cc1a-43d1-a452-3a89e5e9860d" />

#### trainer_placement
<img width="651" height="150" alt="Screenshot 2025-12-05 at 01 05 48" src="https://github.com/user-attachments/assets/50643f08-b4cb-4325-8102-675e5661f86c" />

### 9. Update schema

```bash
npx prisma db pull
```
Result:

<img width="1637" height="649" alt="npx prisma db pull" src="https://github.com/user-attachments/assets/11b1f7b2-45bb-48b6-939c-4e7a38e3630e" />

