enum payment_method {
  cash = "cash",
  card = "card",
  online = "online",
}

enum payment_status {
  pending = "pending",
  completed = "completed",
  failed = "failed",
  refunded = "refunded",
}

enum membership_status {
  active = "active",
  expired = "expired",
  frozen = "frozen",
  cancelled = "cancelled",
}

enum gender_name {
  male = "male",
  female = "female",
}

enum specialty_name {
  workout = "workout",
  yoga = "yoga",
  swim_pool = "swimming pool",
}

interface ContactData {
  contact_data_id: string;
  phone: string;
  email: string;
}

interface Client {
  client_id: string;
  first_name: string;
  last_name: string;
  gender: gender_name;
  contact_data_id: string; // FK -> ContactData
}

interface Membership {
  membership_id: string;
  start_date: Date;
  end_date: Date;
  price: number;
  status: membership_status;
  is_disposable: boolean;
  client_id: string;       // FK -> Client
  class_type_id: string;   // FK -> ClassType
}

interface Payment {
  payment_id: string;
  timestamp: Date;
  amount: number;
  status: payment_status;
  method: payment_method;
  client_id: string;       // FK -> Client
  membership_id: string;   // FK -> Membership
}

interface Qualification {
  trainer_id: string;      // FK -> Trainer
  class_type_id: string;   // FK -> ClassType
}

interface Gym {
  gym_id: string;
  address: string;
  gym_capacity: number;
}

interface Trainer {
  trainer_id: string;
  first_name: string;
  last_name: string;
  specialty: specialty_name;
  contact_data_id: string; // FK -> ContactData
}

interface TrainerPlacement {
  trainer_id: string;      // FK -> Trainer
  gym_id: string;          // FK -> Gym
}

interface ClassSession {
  session_id: string;
  capacity: number;
  date: Date;
  duration: number;        
  trainer_id: string;      // FK -> Trainer
  class_type_id: string;   // FK -> ClassType
  room_id: string;         // FK -> Room
}

interface Attendance {
  session_id: string;      // FK -> ClassSession
  client_id: string;       // FK -> Client
  status: string;
}

interface ClassType {
  class_type_id: string;
  name: string;
  description: string;
  level: string;
}

interface Room {
  room_id: string;
  capacity: number;
  gym_id: string;          // FK -> Gym
}

interface RoomClassType {
  room_id: string;         // FK -> Room
  class_type_id: string;   // FK -> ClassType
  name: string;
}
