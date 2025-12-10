// Gym types
export type CreateGymData = {
  address: string;
};

// Room types
export type CreateRoomData = {
  capacity: number;
  gym_id: number;
};

// ClassType types
export type CreateClassTypeData = {
  name: string;
  description?: string;
  level: string;
};
