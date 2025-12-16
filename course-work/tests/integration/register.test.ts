import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import prisma from "../../src/lib/prisma";
import app from "../../src/app";
import { clearTestData } from "./clearTestData";
import { main as seed } from "../../prisma/seed";

describe("POST /register (integration, Prisma)", () => {
  let classTypeId: number;

  beforeEach(async () => {
    await clearTestData();
    await seed();

    const classType = await prisma.class_type.findFirst({
      where: { name: "yoga" },
    });

    expect(classType).not.toBeNull();
    classTypeId = classType!.class_type_id;
  });

  it("should create contact, client, membership and payment in one transaction", async () => {
    const payload = {
      firstName: "Ivan",
      lastName: "Petrenko",
      gender: "male",
      email: "ivan.test@test.com",
      phone: "+380501234567",
      membershipType: classTypeId,
      startDate: "2025-01-01",
      endDate: "2025-02-01",
      price: 1000,
      paymentMethod: "card",
      isDisposable: false,
    };

    const response = await request(app)
      .post("/register")
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);

    const contact = await prisma.contact_data.findUnique({
      where: { email: payload.email },
    });
    expect(contact).not.toBeNull();

    const client = await prisma.client.findFirst({
      where: { contact_data_id: contact!.contact_data_id },
    });
    expect(client).not.toBeNull();

    const membership = await prisma.membership.findFirst({
      where: { client_id: client!.client_id },
    });
    expect(membership).not.toBeNull();
    expect(membership!.class_type_id).toBe(classTypeId);

    const payment = await prisma.payment.findFirst({
      where: { membership_id: membership!.membership_id },
    });
    expect(payment).not.toBeNull();
    expect(Number(payment!.amount)).toBe(1000);
    expect(payment!.method).toBe("card");
  });

  it("should rollback transaction if email already exists", async () => {
    const payload = {
      firstName: "Duplicate",
      lastName: "User",
      gender: "female",
      email: "duplicate@test.com",
      phone: "+380509999999",
      membershipType: classTypeId,
      startDate: "2025-01-01",
      endDate: "2025-02-01",
      price: 500,
      paymentMethod: "cash",
    };

    // first — success
    const ok = await request(app).post("/register").send(payload);
    expect(ok.status).toBe(201);

    // second — should fail
    const fail = await request(app)
      .post("/register")
      .send({
        ...payload,
        phone: "+380508888888",
      });

    expect(fail.status).toBeGreaterThanOrEqual(400);

    // rollback — client must be only one
    const clients = await prisma.client.findMany({
      where: {
        contact_data: { email: payload.email },
      },
    });

    expect(clients.length).toBe(1);
  });

  it("should rollback if membershipType does not exist", async () => {
    const response = await request(app)
      .post("/register")
      .send({
        firstName: "Fail",
        lastName: "Case",
        gender: "male",
        email: "fail@test.com",
        phone: "+380507777777",
        membershipType: 999999, // invalid
        startDate: "2025-01-01",
        endDate: "2025-02-01",
        price: 300,
        paymentMethod: "online",
      });

    expect(response.status).toBeGreaterThanOrEqual(400);

    const contact = await prisma.contact_data.findUnique({
      where: { email: "fail@test.com" },
    });

    expect(contact).toBeNull();
  });
});
