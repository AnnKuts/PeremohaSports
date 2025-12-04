`npm install prisma --save-dev`
`npm install @prisma/client`
`npx prisma init`

configured database url in .env:

`DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<dbname>?schema=public"`

`npx prisma db pull`

1. Init
`npx prisma migrate dev --name init`

2. Add feedback table 
`npx prisma migrate dev --name add-feedback-table`

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

3. Rename disposable field
`npx prisma migrate dev --name rename-disposable-field`

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
4. Delete comment field
`npx prisma migrate dev --name drop-comment-column`

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

5. Drop feedback table
`npx prisma migrate dev --name drop-feedback-table`

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
