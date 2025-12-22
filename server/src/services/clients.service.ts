import { UpdateClientInput } from '../schemas/clients.schema.js';
import { clientsRepository } from '../repositories/clients.repository';

export const clientsService = {
  async getClients(active?: boolean) {
    const clients = await clientsRepository.findMany(active);

    return clients.map((client) => ({
      client_id: client.client_id,
      first_name: client.first_name,
      last_name: client.last_name,
      gender: client.gender,
      membership: client.membership?.[0] ?? null
    }));
  },

  async getClientById(id: number) {
    const client = await clientsRepository.findById(id);

    if (!client) throw new Error('Client not found');
    return client;
  },

  async getClientMemberships(id: number) {
    const exists = await clientsRepository.findById(id);
    if (!exists) throw new Error('Client not found');

    return clientsRepository.getMembershipsByClientId(id);
  },

  async getClientPayments(id: number) {
    const exists = await clientsRepository.findById(id);
    if (!exists) throw new Error('Client not found');

    return clientsRepository.getPaymentsByClientId(id);
  },

  async getClientAttendance(id: number) {
    const exists = await clientsRepository.findById(id);
    if (!exists) throw new Error('Client not found');

    return clientsRepository.getAttendanceByClientId(id);
  },

  async updateClient(id: number, data: UpdateClientInput) {
    const client = await clientsRepository.findByIdWithContactData(id);

    if (!client) throw new Error('Client not found');

    return clientsRepository.updateWithTransaction(id, data, client.contact_data_id);
  },

  async deleteClient(id: number) {
    const client = await clientsRepository.findById(id);

    if (!client) throw new Error('Client not found');

    return clientsRepository.softDelete(id);
  }
};
