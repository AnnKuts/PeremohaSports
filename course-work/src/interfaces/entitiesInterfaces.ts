// Интерфейсы для всех репозиториев

export interface IAttendanceRepository {
  findAll(options?: { limit?: number; offset?: number }): Promise<{ attendances: any[], total: number }>;
  findById(sessionId: number, clientId: number): Promise<any>;
  findBySessionId(sessionId: number): Promise<any[]>;
  delete(sessionId: number, clientId: number): Promise<any>;
  updateStatus(sessionId: number, clientId: number, newStatus: string): Promise<any>;
  create(sessionId: number, clientId: number, status: string): Promise<any>;
}

export interface IGymRepository {
  create(address: string): Promise<any>;
  findById(gymId: number): Promise<any>;
  findAll(options?: { includeStats?: boolean; limit?: number; offset?: number }): Promise<{ gyms: any[], total: number }>;
  delete(gymId: number): Promise<any>;
  searchByAddress(searchTerm: string, options?: { limit?: number; offset?: number }): Promise<{ gyms: any[], total: number }>;
  findGymsWithUtilizationData(): Promise<any[]>;
  createGymWithRoomsAndTrainers(data: any): Promise<any>;
  findRoomsByGymId(gymId: number): Promise<any[]>;
  findTrainersByGymId(gymId: number): Promise<any[]>;
}

export interface IRoomRepository {
  create(data: any): Promise<any>;
  findAll(options?: { includeStats?: boolean; limit?: number; offset?: number }): Promise<{ rooms: any[], total: number }>;
  findById(roomId: number): Promise<any>;
  delete(roomId: number): Promise<any>;
  findClassTypesByRoomId(roomId: number): Promise<any[]>;
  findSessionsByRoomId(roomId: number): Promise<any[]>;
  createRoomClassType(roomId: number, classTypeId: number): Promise<any>;
  searchRooms(filters: any): Promise<{ rooms: any[], total: number }>;
  updateCapacity(roomId: number, newCapacity: number): Promise<any>;
}

export interface IClassTypeRepository {
  create(data: any): Promise<any>;
  findAll(options?: { includeStats?: boolean; limit?: number; offset?: number }): Promise<{ classTypes: any[], total: number }>;
  findById(classTypeId: number): Promise<any>;
  findTrainersByClassTypeId(classTypeId: number): Promise<any[]>;
  getTrainers(classTypeId: number): Promise<any[]>;
}