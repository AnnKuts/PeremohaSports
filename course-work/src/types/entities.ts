export type CreateGymData = {
  address: string;
};

export type CreateRoomData = {
  capacity: number;
  gym_id: number;
};

export type CreateClassTypeData = {
  name: string;
  description?: string;
  level: string;
};
