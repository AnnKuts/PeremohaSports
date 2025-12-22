import prisma from '../lib/prisma';

interface RegisterData {
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  email: string;
  phone: string;
  membershipType: number;
  startDate: string;
  endDate: string;
  price: number;
  paymentMethod: 'cash' | 'card' | 'online';
  isDisposable?: boolean;
}

export const registerRepository = {
  async findContactByEmailOrPhone(email: string, phone: string) {
    return prisma.contact_data.findFirst({
      where: {
        OR: [{ email: email }, { phone: phone }]
      }
    });
  },

  async findClassTypeById(classTypeId: number) {
    return prisma.class_type.findUnique({
      where: { class_type_id: classTypeId }
    });
  },

  async registerWithTransaction(data: RegisterData) {
    return prisma.$transaction(async (tx) => {
      const contact = await tx.contact_data.create({
        data: {
          email: data.email,
          phone: data.phone
        }
      });

      const client = await tx.client.create({
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          gender: data.gender,
          contact_data_id: contact.contact_data_id
        }
      });

      const membership = await tx.membership.create({
        data: {
          client_id: client.client_id,
          class_type_id: data.membershipType,
          start_date: new Date(data.startDate),
          end_date: new Date(data.endDate),
          price: data.price,
          status: 'active',
          is_disposable: data.isDisposable || false
        }
      });

      const payment = await tx.payment.create({
        data: {
          client_id: client.client_id,
          membership_id: membership.membership_id,
          amount: data.price,
          method: data.paymentMethod,
          status: 'pending'
        }
      });

      return {
        contact,
        client,
        membership,
        payment
      };
    });
  }
};
