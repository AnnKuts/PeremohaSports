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
  contact_data_id: number;
  phone: string;
  email: string;
}

interface Client {
  client_id: number;
  first_name: string;
  last_name: string;
  gender: gender_name;
  contact_data_id: number; // FK -> ContactData
}

interface Membership {
  membership_id: number;
  start_date: Date;
  end_date: Date;
  price: number;
  status: membership_status;
  is_disposable: boolean;
  client_id: number;       // FK -> Client
  class_type_id: number;   // FK -> ClassType
}

interface Payment {
  payment_id: number;
  timestamp: Date;
  amount: number;
  status: payment_status;
  method: payment_method;
  client_id: number;       // FK -> Client
  membership_id: number;   // FK -> Membership
}

interface Qualification {
    trainer_id: number;      // FK -> Trainer
    class_type_id: number;   // FK -> ClassType
}

interface Gym {
    gym_id: number;
    address: string;
    gym_capacity: number;
}

interface Trainer {
    trainer_id: number;
    first_name: string;
    last_name: string;
    specialty: specialty_name;
    contact_data_id: number; // FK -> ContactData
}

interface TrainerPlacement {
    trainer_id: number;      // FK -> Trainer
    gym_id: number;          // FK -> Gym
}

