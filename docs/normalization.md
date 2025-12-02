# Lab 5: Database normalization
## 1. Functional Dependency Analysis (FD)

To confirm the correctness of the database structure, functional dependencies were defined for the main entities. Notation: $X \rightarrow Y$ (X uniquely determines Y).  

**1. Table `contact_data`**
* **PK:** `contact_data_id`
* **FD:** `contact_data_id` $\rightarrow$ `phone`, `email`

**2. Table `client`**
* **PK:** `client_id`
* **FD:** `client_id` $\rightarrow$ `first_name`, `last_name`, `gender`, `contact_data_id`

**3. Table `trainer`**
* **PK:** `trainer_id`
* **FD:** `trainer_id` $\rightarrow$ `first_name`, `last_name`, `is_admin`, `specialty`, `contact_data_id`

**4. Table `gym`**
* **PK:** `gym_id`
* **FD:** `gym_id` $\rightarrow$ `address`, `gym_capacity`

**5. Table `room`**
* **PK:** `room_id`
* **FD:** `room_id` $\rightarrow$ `capacity`, `gym_id`

**6. Table `class_type`**
* **PK:** `class_type_id`
* **FD:** `class_type_id` $\rightarrow$ `name`, `description`, `level`

**7. Table `room_class_type`**
* **PK:** `(room_id, class_type_id)`
* **FD:** Trivial dependency. The entire row is identified by the full key.

**8. Table `class_session`**
* **PK:** `session_id`
* **FD:** `session_id` $\rightarrow$ `room_id`, `class_type_id`, `duration`, `capacity`, `date`, `trainer_id`

**9. Table `qualification`**
* **PK:** `(trainer_id, class_type_id)`
* **FD:** `trainer_id, class_type_id` $\rightarrow$ Defines the qualification of the trainer for a specific class type

**10. Table `trainer_placement`**
* **PK:** `(trainer_id, gym_id)`
* **FD:** `trainer_id, gym_id` $\rightarrow$ Defines the placement of the trainer in the gym

**11. Table `membership`**
* **PK:** `membership_id`
* **FD:** `membership_id` $\rightarrow$ `start_date`, `end_date`, `price`, `status`, `is_dispisable`, `client_id`, `class_type_id`

**12. Table `payment`**
* **PK:** `payment_id`
* **FD:** `payment_id` $\rightarrow$ `created_at`, `amount`, `status`, `method`, `client_id`, `membership_id`

**13. Table `attendance`**
* **PK:** `(session_id, client_id)`
* **FD:** Trivial dependency. The entire row is identified by the full key.  

## 2. Checking normal forms

### **First Normal Form (1NF)**

**Requirement:** Attributes are atomic, no repeating groups.

**Verification:** The original schema does not contain lists of values ​​(for example, the `class_type` attributes in the `class_session` table do not contain lists of class types in a single field, such as "yoga, workout, swimming"). They are moved to a separate `class_type` table, where each class type is stored as a separate value.

**Status:** The schema is in 1NF.  

### **Second Normal Form (2NF)**

**Requirement:** No partial dependencies (non-key attributes depend on the entire composite key).

**Verification:** The `room_class_type` table has a composite key (`room_id`, `class_type_id`) and does not contain any attributes that depend on any part of that key. All other tables have a simple key.

**Status:** The schema is in 2NF.

### Third Normal Form (3NF)

**Requirement:** No transitive dependencies (a non-key attribute depends on another non-key attribute).

**Verification:**

1. In the `trainer` table, the specialty attribute is redundant because this information is already stored in the `qualification` table, which has a relationship between the trainer and the classes. This creates a transitive dependency: trainer.specialty $\rightarrow$ qualification.class_type_id $\rightarrow$ class_type.name.

2. In the `gym` table, the `gym_capacity` attribute can be calculated based on data from the `room` table, which violates the principle of storing only the necessary information.

**Status:** The schema violates 3NF because of redundant attributes in the `trainer` and `gym` tables.

## 3. Identifying Redundancy and Anomaliesbb
### **Problem Tables:**

1. **`Trainer` Table:**

```sql
CREATE TABLE IF NOT EXISTS trainer (
  trainer_id serial PRIMARY KEY,
  first_name varchar(32) NOT NULL,
  last_name varchar(32) NOT NULL,
  is_admin boolean NOT NULL,
  specialty class_name NOT NULL,  -- Problematic attribute
  contact_data_id integer NOT NULL references contact_data (contact_data_id)
);
```

**Problem:** The `specialty` attribute is duplicated because the information is already stored in the `qualification` table.

**Update Anomaly:** If a trainer's specialty changes, data must be updated in multiple places: the trainer table and the `qualification` table.

2. **`Gym` Table:**

```sql
CREATE TABLE IF NOT EXISTS gym (
  gym_id serial PRIMARY KEY,
  address varchar(60) NOT NULL UNIQUE,
  gym_capacity integer NOT NULL CHECK (gym_capacity > 0)  -- Problematic attribute
);
```

**Problem:** The `gym_capacity` attribute can be calculated based on data from the room table. This violates the principle of avoiding storing calculated values.

**Update anomaly:** If the room capacity changes, the `gym_capacity` value in the gym table is not automatically updated, resulting in the need to manually update the data in multiple places.  

## 4. Apply Normalization (Fix)

### Step 1: Remove Redundant Attributes

```sql
-- Remove specialty attribute from trainer table
ALTER TABLE trainer
DROP COLUMN specialty;

-- Remove gym_capacity attribute from gym table
ALTER TABLE gym
DROP COLUMN gym_capacity;
```

### Step 2: Calculate gym_capacity via query

To get the gym capacity, you can calculate it as the sum of the capacities of all rooms belonging to this gym.

```sql
SELECT g.gym_id, SUM(r.capacity) AS gym_capacity
FROM gym g
JOIN room r ON r.gym_id = g.gym_id
GROUP BY g.gym_id;
```

### After this change:

**Redundancy removed:** Trainer specialty data is stored only in the qualification table, which ensures that duplication is avoided.

**Fixed update anomalies:** When changing the trainer's specialty or room capacity, statistics are updated automatically.

**Schema fully complies with 3NF requirements:** Violations of 1NF, 2NF and 3NF have been fixed, and the schema has become more efficient.
