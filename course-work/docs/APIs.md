## **API/usage examples**  

**Table of Contents**  
   - [Attendance](#attendance--attendance-)
   - [ClassTypes](#classtypes--class-types-)
   - [Gyms](#gyms--gyms-)
   - [Rooms](#rooms--rooms-)
   - [Register](#register--register-)
   - [Auth](#auth--auth-)
   - [Clients](#clients--clients-)
   - [Memberships](#membershps--memberships-)
   - [Payments](#payments--payments-)

### Attendance ( `/attendance/` )

#### 1. **Get all attendances (with pagination)**  
   **Method:** `GET`  
   **Endpoint:** `/`  
   **Query Params:**  
   - `page` (optional): Page number for pagination.  
   - `limit` (optional): Number of records per page.  
   
   **Description:**  
   Returns a list of all attendances with pagination support.  
   
   | **Role**        | **Required to access**   |  
   |-----------------|--------------------------|  
   | **Registered**  | ✅ |  
   | **Client**  | ✅ (Own attendance only) |  
   | **Trainer**     | ✅ (Attendance for own clients) |  
   | **Admin**       | ✅        |  
   
   **Example Request:**  
   ```http
   GET /attendance/?page=1&limit=10
   ```
 **Example Response:**  
   ```json
   {
     "success": true,
     "data": [
       {
         "session_id": 4,
         "client_id": 1,
         "status": "booked",
         "is_deleted": false
       },
       {
         "session_id": 3,
         "client_id": 4,
         "status": "cancelled",
         "is_deleted": false
       }
     ],
     "total": 2
   }
   ```

#### 2. **Get attendances by ID**  
   **Method:** `GET`  
   **Endpoint:** `/by-id`  
   **Query Params:**  
   - `attendance_id` (required): ID of the attendance record. 
    
   **Description:**  
   Returns information about a specific attendance by its ID.  
   
   | **Role**        | **Required to access**   |  
   |-----------------|--------------------------|  
   | **Registered**  | ✅ |  
   | **Client**  | ✅ (Own attendance only) |  
   | **Trainer**     | ❌ |  
   | **Admin**       | ✅ |  

   **Example Request:**  
   ```http
   GET /attendance/by-id?session_id=4&client_id=1
   ```

#### 3. **Get all attendances by session ID**  
   **Method:** `GET`  
   **Endpoint:** `/session/:session_id`  
   **Description:**  
   Returns all attendances belonging to a specific session.  

   | **Role**        | **Required to access**   |  
   |-----------------|--------------------------|  
   | **Client**  | ❌ |  
   | **Trainer**     | ✅ |  
   | **Admin**       | ✅ |  

   **Example Request:**  
   ```http
   GET /attendance/session/3
   ```

   **Example Response:**  
   ```json
   {
     "success": true,
     "data": [
       {
         "session_id": 3,
         "client_id": 4,
         "status": "cancelled",
         "is_deleted": false
       }
     ],
     "session_id": 3
   }
   ```
#### 4. **Delete attendances by ID**  
   **Method:** `DELETE`  
   **Endpoint:** `/by-id`  
   **Description:**  
   Deletes the attendance by the specified ID.  
   
   | **Role**        | **Required to access**   |  
   |-----------------|--------------------------|     
   | **Client**  | ❌ |  
   | **Trainer**     | ❌ |  
   | **Admin**       | ✅ |

   **Example Request:**  
   ```http
   DELETE /attendance/by-id?session_id=4&client_id=1
   ```

   **Example Response:**  
   ```json
   {
     "success": true,
     "data": {
       "success": true,
       "deletedAttendance": {
         "session_id": 4,
         "client_id": 1,
         "status": "booked",
         "is_deleted": true
       }
     },
     "message": "Attendance record deleted successfully"
   }
   ```

#### 5. **Create new attendance**  
   **Method:** `POST`  
   **Endpoint:** `/`  
   **Description:**  
   Creates a new attendance record.  

   | **Role**        | **Required to access**   |  
   |-----------------|--------------------------|  
   | **Client**  | ❌ |  
   | **Trainer**     | ✅ |  
   | **Admin**       | ✅ |

   **Example Request:**  
   ```http
   POST /
   ```

   **Body:**  
   ```json
   {
     "session_id": 1,
     "client_id": 1,
     "status": "booked"
   }
   ```    

   **Example Response:**  
   ```json
   {
     "success": true,
     "data": {
       "success": true,
       "attendance": {
         "session_id": 1,
         "client_id": 1,
         "status": "booked",
         "is_deleted": false
       }
     },
     "message": "Attendance record created successfully"
   }
   ```

#### 6. **Update attendance status**  
   **Method:** `PUT`  
   **Endpoint:** `/status`  
   **Description:**  
   Updates attendance status (e.g., "attended", "cancelled"). 

   | **Role**        | **Required to access**   |  
   |-----------------|--------------------------|  
   | **Client**  | ❌ |  
   | **Trainer**     | ✅ |  
   | **Admin**       | ✅ |

   **Example Request:**  
   ```http
   PUT /attendance/status
   ```
 
   **Body:**  
   ```json
   {
     "session_id": 1,
     "client_id": 1,
     "status": "missed"
   }
   ```
   
**Example Response:**  
   ```json
   {
     "success": true,
     "data": {
       "success": true,
       "attendance": {
         "session_id": 1,
         "client_id": 1,
         "status": "missed",
         "is_deleted": false
       },
       "changes": {
         "from": "booked",
         "to": "missed"
       }
     },
     "message": "Status updated successfully"
   }
   ```

### ClassTypes ( `/class-types/` )

#### 1. **Create class type**  
   **Method:** `POST`  
   **Endpoint:** `/`  
   **Description:**  
   Creates a new class type.

   | **Role**        | **Required to access**   |  
   |-----------------|--------------------------|  
   | **Client**      | ❌                        |  
   | **Trainer**     | ❌                        |  
   | **Admin**       | ✅                        |

   **Example Request:**  
   ```http
   POST /class-types
   ```

   **Request Body:**  
   ```json
   {
     "name": "pilates",
     "description": "pilates for you!",
     "level": "beginner"
   }
   ```

   **Example Response:**  
   ```json
   {
     "success": true,
     "data": {
       "class_type_id": 4,
       "name": "pilates",
       "description": "pilates for you!",
       "level": "beginner",
       "is_deleted": false,
       "_count": {
         "membership": 0,
         "qualification": 0,
         "room_class_type": 0
       }
     },
     "message": "Class type created successfully"
   }
   ```

#### 2. **Get all class types**  
   **Method:** `GET`  
   **Endpoint:** `/`  
   **Description:**  
   Returns a list of all class types.

   | **Role**        | **Required to access**   |  
   |-----------------|--------------------------|  
   | **Registered**      | ❌                        |  
   | **Client**      | ✅                        |  
   | **Trainer**     | ✅                        |  
   | **Admin**       | ✅                        |

   **Example Request:**  
   ```http
   GET /class-types
   ```

#### 3. **Get class type by ID**  
   **Method:** `GET`  
   **Endpoint:** `/:id`  
   **Description:**  
   Returns a class type by its ID.

   | **Role**        | **Required to access**   |  
   |-----------------|--------------------------|  
   | **Registered**      | ❌                        |  
   | **Client**      | ✅                        |  
   | **Trainer**     | ✅                        |  
   | **Admin**       | ✅                        |

   **Example Request:**  
   ```http
   GET /class-types/3
   ```

#### 4. **Update class type**  
   **Method:** `PUT`  
   **Endpoint:** `/:id`  
   **Description:**  
   Updates class type fields (name, description, level, is_deleted).

   | **Role**        | **Required to access**   |  
   |-----------------|--------------------------|  
   | **Client**      | ❌                        |  
   | **Trainer**     | ❌                        |  
   | **Admin**       | ✅                        |

   **Example Request:**  
   ```http
   PUT /class-types/4
   ```

   **Request Body:**  
   ```json
   {
     "name": "not pilates anymore",
     "description": "just description",
     "level": "beginner"
   }
   ```

   **Example Response:**  
   ```json
   {
     "success": true,
     "data": {
       "class_type_id": 4,
       "name": "not pilates anymore",
       "description": "just description",
       "level": "beginner",
       "is_deleted": false,
       "_count": {
         "membership": 0,
         "qualification": 0,
         "room_class_type": 0
       }
     },
     "message": "Class type updated successfully"
   }
   ```

#### 5. **Delete class type (soft delete)**  
   **Method:** `DELETE`  
   **Endpoint:** `/:id`  
   **Description:**  
   Soft deletes a class type (sets `is_deleted` to true and cascades).

   | **Role**        | **Required to access**   |  
   |-----------------|--------------------------|  
   | **Client**      | ❌                        |  
   | **Trainer**     | ❌                        |  
   | **Admin**       | ✅                        |

   **Example Request:**  
   ```http
   DELETE /class-types/4
   ```

   **Example Response:**  
   ```json
   {
     "success": true,
     "data": {
       "class_type_id": 4,
       "name": "not pilates anymore",
       "description": "just description",
       "level": "beginner",
       "is_deleted": true
     },
     "message": "Class type soft-deleted successfully"
   }
   ```

#### 6. **Get trainers for class type**  
   **Method:** `GET`  
   **Endpoint:** `/:id/trainers`  
   **Description:**  
   Returns a list of trainers for the given class type.

   | **Role**        | **Required to access**   |  
   |-----------------|--------------------------|  
   | **Regisetered** | ❌                        |  
   | **Client**      | ✅                        |  
   | **Trainer**     | ✅                        |  
   | **Admin**       | ✅                        |

   **Example Request:**  
   ```http
   GET /class-types/3/trainers
   ```

#### 7. **Get monthly revenue analytics**  
   **Method:** `GET`  
   **Endpoint:** `/analytics/monthly-revenue`  
   **Description:**  
   Returns monthly revenue analytics for class types.

   | **Role**        | **Required to access**   |  
   |-----------------|--------------------------|  
   | **Client**      | ❌                        |  
   | **Trainer**     | ❌                        |  
   | **Admin**       | ✅                        |

   **Example Request:**  
   ```http
   GET /class-types/analytics/monthly-revenue
   ```

   **Example Response:**  
   ```json
   {
     "success": true,
     "data": [
       {
         "class_category": "yoga",
         "month": "2025-12-01",
         "attendance_count": 3,
         "total_revenue": 2700.00
       }
     ]
   }
   ```

### Gyms ( `/gyms/` )

#### 1. **Create gym**  
   **Method:** `POST`  
   **Endpoint:** `/`  
   **Description:**  
   Creates a new gym.

   | **Role**        | **Required to access**   |  
   |-----------------|--------------------------|  
   | **Client**      | ❌                        |  
   | **Trainer**     | ❌                        |  
   | **Admin**       | ✅                        |

   **Example Request:**  
   ```http
   POST /gyms
   ```

   **Request Body:**  
   ```json
   {
     "address": "м. Київ, вул. Марковського, 2а"
   }
   ```

   **Example Response:**  
   ```json
   {
     "success": true,
     "data": {
       "success": true,
       "gym": {
         "gym_id": 3,
         "address": "м. Київ, вул. Марковського, 2а",
         "is_deleted": false,
         "room": [],
         "trainer_placement": [],
         "_count": {
           "room": 0,
           "trainer_placement": 0
         }
       },
       "summary": {
         "roomsCreated": 0,
         "trainersAssigned": 0,
         "totalClassTypes": 0
       },
       "creationType": "simple"
     },
     "message": "Simple gym created successfully"
   }
   ```

#### 2. **Get all gyms**  
   **Method:** `GET`  
   **Endpoint:** `/`  
   **Description:**  
   Returns a list of all gyms.

   | **Role**        | **Required to access**   |  
   |-----------------|--------------------------|  
   | **Regisetered** | ❌                        |  
   | **Client**      | ✅                        |  
   | **Trainer**     | ✅                        |  
   | **Admin**       | ✅                        |

   **Example Request:**  
   ```http
   GET /gyms
   ```

#### 3. **Search gyms by address**  
   **Method:** `GET`  
   **Endpoint:** `/search?address=<address>`  
   **Description:**  
   Searches gyms by address (substring search).

   | **Role**        | **Required to access**   |  
   |-----------------|--------------------------|  
   | **Regisetered** | ❌                        |  
   | **Client**      | ✅                        |  
   | **Trainer**     | ✅                        |  
   | **Admin**       | ✅                        |

   **Example Request:**  
   ```http
   GET /gyms/search?address=Київ
   ```

   **Example Response:**  
   ```json
   {
     "success": true,
     "data": [
       {
         "gym_id": 3,
         "address": "м. Київ, вул. Марковського, 2а",
         "is_deleted": false,
         "_count": {
           "room": 0,
           "trainer_placement": 0
         }
       },
       {
         "gym_id": 1,
         "address": "м. Київ, вул. Спортивна, 10",
         "is_deleted": false,
         "_count": {
           "room": 2,
           "trainer_placement": 1
         }
       }
     ],
     "total": 2
   }
   ```

#### 4. **Get gym utilization analytics**  
   **Method:** `GET`  
   **Endpoint:** `/analytics/utilization`  
   **Description:**  
   Returns gym utilization analytics (e.g., attendance, gym usage).

   | **Role**        | **Required to access**   |  
   |-----------------|--------------------------|  
   | **Client**      | ❌                        |  
   | **Trainer**     | ❌                        |  
   | **Admin**       | ✅                        |

   **Example Request:**  
   ```http
   GET /gyms/analytics/utilization
   ```

   **Example Response:**  
   ```json
   {
     "success": true,
     "data": [
       {
         "gym_id": 1,
         "gym_address": "м. Київ, вул. Спортивна, 10",
         "total_rooms": 2,
         "total_capacity": 170,
         "total_sessions": 2,
         "avg_session_capacity": 16,
         "total_bookings": 1,
         "utilization_rate": 3.13,
         "avg_sessions_per_room": 1
       },
       {
         "gym_id": 2,
         "gym_address": "м. Львів, просп. Свободи, 25",
         "total_rooms": 2,
         "total_capacity": 120,
         "total_sessions": 2,
         "avg_session_capacity": 12.5,
         "total_bookings": 0,
         "utilization_rate": 0,
         "avg_sessions_per_room": 1
       }
     ],
     "message": "Gym utilization analysis"
   }
   ```

#### 5. **Get gym by ID**  
   **Method:** `GET`  
   **Endpoint:** `/:id`  
   **Description:**  
   Returns information about a gym by its ID.

   | **Role**        | **Required to access**   |  
   |-----------------|--------------------------|  
   | **Regisetered** | ❌                        |  
   | **Client**      | ✅                        |  
   | **Trainer**     | ✅                        |  
   | **Admin**       | ✅                        |

   **Example Request:**  
   ```http
   GET /gyms/1
   ```

   **Example Response:**  
   ```json
   {
     "success": true,
     "data": {
       "gym_id": 1,
       "address": "м. Київ, вул. Спортивна, 10",
       "is_deleted": false,
       "_count": {
         "room": 2,
         "trainer_placement": 1
       }
     }
   }
   ```

#### 6. **Get rooms in gym**  
   **Method:** `GET`  
   **Endpoint:** `/:id/rooms`  
   **Description:**  
   Returns a list of rooms in the selected gym.

   | **Role**        | **Required to access**   |  
   |-----------------|--------------------------| 
   | **Regisetered** | ✅                        |   
   | **Client**      | ✅                        |  
   | **Trainer**     | ✅                        |  
   | **Admin**       | ✅                        |

   **Example Request:**  
   ```http
   GET /gyms/1/rooms
   ```

#### 7. **Get trainers in gym**  
   **Method:** `GET`  
   **Endpoint:** `/:id/trainers`  
   **Description:**  
   Returns a list of trainers working in the selected gym.

   | **Role**        | **Required to access**   |  
   |-----------------|--------------------------|  
   | **Regisetered** | ❌                        |  
   | **Client**      | ✅                        |  
   | **Trainer**     | ✅                        |  
   | **Admin**       | ✅                        |

   **Example Request:**  
   ```http
   GET /gyms/1/trainers
   ```

#### 8. **Delete gym**  
   **Method:** `DELETE`  
   **Endpoint:** `/:id`  
   **Description:**  
   Soft deletes a gym (sets `is_deleted` to true and cascades deletion).

   | **Role**        | **Required to access**   |  
   |-----------------|--------------------------|  
   | **Client**      | ❌                        |  
   | **Trainer**     | ❌                        |  
   | **Admin**       | ✅                        |

   **Example Request:**  
   ```http
   DELETE /gyms/1
   ```

   **Example Response:**  
   ```json
   {
     "success": true,
     "data": {
       "success": true,
       "deletedGym": {
         "gym_id": 1,
         "address": "м. Київ, вул. Спортивна, 10",
         "is_deleted": true
       }
     },
     "message": "Gym deleted successfully with cascade deletion"
   }
   ```

#### 9. **Update gym**  
   **Method:** `PUT`  
   **Endpoint:** `/:id`  
   **Description:**  
   Updates gym data.

   | **Role**        | **Required to access**   |  
   |-----------------|--------------------------|  
   | **Client**      | ❌                        |  
   | **Trainer**     | ❌                        |  
   | **Admin**       | ✅                        |

   **Example Request:**  
   ```http
   PUT /gyms/2
   ```

   **Request Body:**  
   ```json
   {
     "address": "вул. Нова, 2"
   }
   ```

   **Example Response:**  
   ```json
   {
     "success": true,
     "data": {
       "gym_id": 2,
       "address": "м. Львів, вул. Нова, 7д",
       "is_deleted": false
     },
     "message": "Gym updated successfully"
   }
   ```

### Rooms ( `/rooms/` )

#### 1. **Create room**  
   **Method:** `POST`  
   **Endpoint:** `/`  
   **Description:**  
   Creates a new room (hall) in the selected gym.

   | **Role**        | **Required to access**   |  
   |-----------------|--------------------------|  
   | **Client**      | ❌                        |  
   | **Trainer**     | ❌                        |  
   | **Admin**       | ✅                        |

   **Example Request:**  
   ```http
   POST /rooms
   ```

   **Request Body:**  
   ```json
   {
     "gym_id": 1,
     "capacity": 20
   }
   ```

   **Example Response:**  
   ```json
   {
     "success": true,
     "data": {
       "room_id": 5,
       "capacity": 20,
       "gym_id": 1,
       "is_deleted": false,
       "gym": {
         "gym_id": 1,
         "address": "м. Київ, вул. Спортивна, 10",
         "is_deleted": false
       },
       "_count": {
         "room_class_type": 0
       }
     }
   }
   ```
#### 2. **Get all rooms**  
   **Method:** `GET`  
   **Endpoint:** `/`  
   **Description:**  
   Returns a list of all rooms in the gyms.

   | **Role**        | **Required to access**   |  
   |-----------------|--------------------------| 
   | **Regisetered**      | ✅                  |  
   | **Client**      | ✅                        |  
   | **Trainer**     | ✅                        |  
   | **Admin**       | ✅                        |

   **Example Request:**  
   ```http
   GET /rooms
   ```

#### 3. **Search rooms**  
   **Method:** `GET`  
   **Endpoint:** `/search`  
   **Description:**  
   Searches rooms by filters (e.g., by gym or minimum capacity).

   | **Role**        | **Required to access**   |  
   |-----------------|--------------------------|  
   | **Regisetered** | ✅                       |  
   | **Client**      | ✅                        |  
   | **Trainer**     | ✅                        |  
   | **Admin**       | ✅                        |

   **Example Request:**  
   ```http
   GET /rooms/search?gymId=1&minCapacity=10
   ```

   **Example Response:**  
   ```json
   {
     "success": true,
     "data": [
       {
         "room_id": 2,
         "capacity": 90,
         "gym_id": 1,
         "is_deleted": false,
         "gym": {
           "gym_id": 1,
           "address": "м. Київ, вул. Спортивна, 10",
           "is_deleted": false
         },
         "_count": {
           "room_class_type": 1
         }
       }
     ],
     "total": 1
   }
   ```

#### 4. **Get room by ID**  
   **Method:** `GET`  
   **Endpoint:** `/:id`  
   **Description:**  
   Returns information about a room by its ID.

   | **Role**        | **Required to access**   |  
   |-----------------|--------------------------|  
   | **Regisetered** | ✅                        |  
   | **Client**      | ✅                        |  
   | **Trainer**     | ✅                        |  
   | **Admin**       | ✅                        |

   **Example Request:**  
   ```http
   GET /rooms/3
   ```

### 5. **Get sessions in room**  
   **Method:** `GET`  
   **Endpoint:** `/:id/sessions`  
   **Description:**  
   Returns a list of sessions (classes) held in the selected room.

   | **Role**        | **Required to access**   |  
   |-----------------|--------------------------|
   | **Regisetered** | ✅                        |    
   | **Client**      | ✅                        |  
   | **Trainer**     | ✅                        |  
   | **Admin**       | ✅                        |

   **Example Request:**  
   ```http
   GET /rooms/3/sessions
   ```

#### 6. **Get class types in room**  
   **Method:** `GET`  
   **Endpoint:** `/:id/class-types`  
   **Description:**  
   Returns a list of class types (e.g., types of training) that take place in the selected room.

   | **Role**        | **Required to access**   |  
   |-----------------|--------------------------|
   | **Regisetered**      | ✅                        |  
   | **Client**      | ✅                        |  
   | **Trainer**     | ✅                        |  
   | **Admin**       | ✅                        |

   **Example Request:**  
   ```http
   GET /rooms/3/class-types
   ```

   **Example Response:**  
   ```json
   {
     "success": true,
     "data": [
       {
         "room_id": 3,
         "class_type_id": 3,
         "is_deleted": false,
         "class_type": {
           "class_type_id": 3,
           "name": "swimming_pool",
           "description": "Тренування у басейні для професійних плавців",
           "level": "advanced",
           "is_deleted": false
         },
         "_count": {
           "class_session": 1
         }
       }
     ],
     "room_id": 3
   }
   ```

#### 7. **Associate class type with room**  
   **Method:** `POST`  
   **Endpoint:** `/class-type`  
   **Description:**  
   Associates a class type with a room.

   | **Role**        | **Required to access**   |  
   |-----------------|--------------------------|  
   | **Client**      | ❌                        |  
   | **Trainer**     | ❌                        |  
   | **Admin**       | ✅                        |

   **Example Request:**  
   ```http
   POST /rooms/class-type
   ```

   **Example Response:**  
   ```json
   {
     "success": true,
     "data": {
       "room_id": 1,
       "class_type_id": 2
     },
     "message": "Class type associated successfully"
   }
   ```

#### 8. **Delete room**  
   **Method:** `DELETE`  
   **Endpoint:** `/:id`  
   **Description:**  
   Soft deletes a room (sets `is_deleted` to true).

   | **Role**        | **Required to access**   |  
   |-----------------|--------------------------|  
   | **Client**      | ❌                        |  
   | **Trainer**     | ❌                        |  
   | **Admin**       | ✅                        |

   **Example Request:**  
   ```http
   DELETE /rooms/1
   ```

#### 9. **Update room capacity**  
   **Method:** `PUT`  
   **Endpoint:** `/:id/capacity`  
   **Description:**  
   Updates the capacity of the selected room.

   | **Role**        | **Required to access**   |  
   |-----------------|--------------------------|  
   | **Client**      | ❌                        |  
   | **Trainer**     | ❌                        |  
   | **Admin**       | ✅                        |

   **Example Request:**  
   ```http
   PUT /rooms/1/capacity
   ```

   **Request Body:**  
   ```json
   {
     "capacity": 50
   }
   ```
#### 10. **Get room revenue and attendance analytics**  
   **Method:** `GET`  
   **Endpoint:** `/analytics/room-revenue`  
   **Description:**  
   Returns room revenue and attendance analytics.

   | **Role**        | **Required to access**   |  
   |-----------------|--------------------------|  
   | **Client**      | ❌                        |  
   | **Trainer**     | ❌                        |  
   | **Admin**       | ✅                        |

   **Example Request:**  
   ```http
   GET /rooms/analytics/room-revenue
   ```

   **Example Response:**  
   ```json
   [
    {
        "gym_id": 1,
        "gym_address": "м. Київ, вул. Спортивна, 10",
        "room_id": 2,
        "room_capacity": 10,
        "attendance_count": 1,
        "total_revenue": "100"
    }
   ]
   ```


### Auth ( `/auth/` )

#### 1. **Login**
**Method:** `POST`  
**Endpoint:** `/login`  
**Endpoint:** `/request-code`
**Description:**  
Sends OTP code to user's email for authentication.  Creates new user if doesn't exist, or logs in existing user.

| **Role**        | **Required to access**   |  
   |-----------------|--------------------------|  
| **Guest**       | ✅                        |  
| **Client**      | ❌                        |  
| **Trainer**     | ❌                        |  
| **Admin**       | ❌                        |

**Example Request:**
   ```http
   POST /auth/request-code
   POST /auth/login
   ```

**Request Body:**
   ```json
   {
     "email": "ivan.petrenko@example.com"
   }
   ```

**Example Response:**
   ```json
{
  "success": true,
  "message": "If an account exists, a code has been sent."
}
   ```

#### 2. **Verify OTP**
**Method:** `POST`  
**Endpoint:** `/verify-code`  
**Description:**  
Verifies the OTP code sent to user's email and returns JWT token.

| **Role**        | **Required to access**   |  
   |-----------------|--------------------------|  
| **Guest**       | ✅                        |  
| **Client**      | ❌                        |  
| **Trainer**     | ❌                        |  
| **Admin**       | ❌                        |

**Example Request:**
   ```http
   POST /auth/verify-code
   ```

**Request Body:**
   ```json
{
  "email": "anjakuts03@gmail.com",
  "code": "eyJlbWFpbCI6ImFuamFrdXRzMDNAZ21haWwuY29tIiwiYWN0b3IiOiJ0cmFpbmVyIiwiYWN0b3JJZCI6MywiZXhwaXJlc0F0IjoxNzY1OTYxODk4NDY3LCJub25jZSI6IjJlNmVhZmNjNjM2NjU3ZjgifXwwM2YyNmRjNjg3MzA2MmUzNjRmMmZlYzA4N2EzNmFjMWVjODJjYjVlNTY1NDczYmNhMmRjYWRhMzgwYTFhYTg0"
}
   ```

**Example Response:**
   ```json
{
  "success": true,
  "actor": "trainer",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY3RvciI6InRyYWluZXIiLCJ0cmFpbmVySWQiOjMsImVtYWlsIjoiYW5qYWt1dHMwM0BnbWFpbC5jb20iLCJpc0FkbWluIjp0cnVlLCJpYXQiOjE3NjU5NjEyNzAsImV4cCI6MTc2NjA0NzY3MH0.vkF_kuNMzJBlk7tan2t4uY81wZacPA2J_CyOCz8brhY",
  "data": {
    "id": 3,
    "firstName": "Анна",
    "lastName": "Куц",
    "email": "anjakuts03@gmail.com",
    "isAdmin": true
  }
}
   ```

#### 3. **Get Current User**
**Method:** `GET`  
**Endpoint:** `/me`  
**Description:**  
Returns information about the currently authenticated user.

| **Role**        | **Required to access**   |  
   |-----------------|--------------------------|  
| **Registered**  | ✅                        |  
| **Client**      | ✅                        |  
| **Trainer**     | ✅                        |  
| **Admin**       | ✅                        |

**Example Request:**
   ```http
   GET /auth/me
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY3RvciI6InRyYWluZXIiLCJ0cmFpbmVySWQiOjMsImVtYWlsIjoiYW5qYWt1dHMwM0BnbWFpbC5jb20iLCJpc0FkbWluIjp0cnVlLCJpYXQiOjE3NjU5NjEyNzAsImV4cCI6MTc2NjA0NzY3MH0.vkF_kuNMzJBlk7tan2t4uY81wZacPA2J_CyOCz8brhY 
   ```

**Example Response:**
   ```json
   {
  "success": true,
  "actor": "trainer",
  "data": {
    "id": 3,
    "firstName": "Анна",
    "lastName": "Куц",
    "email": "anjakuts03@gmail.com",
    "isAdmin": true,
    "qualifications": [],
    "gyms": []
  }
}
   ```

#### 3. **Get Current User**
**Method:** `DELETE`  
**Endpoint:** `/me`  
**Description:**  
Soft deletes the currently authenticated user.


| **Role**       | **Required to access**   |  
   |----------------|--------------------------|  
| **Registered** | ✅                        |  
| **Client**     | ✅                        |  
| **Trainer**    | ✅                        |  
| **Admin**      | ✅                        |


**Example Request:**
   ```http
   DELETE /auth/me 
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY3RvciI6ImNsaWVudCIsImNsaWVudElkIjo0LCJlbWFpbCI6Im1hcmlhLmJvbmRhckBleGFtcGxlLmNvbSIsImlhdCI6MTc2NTk2Mjc1MCwiZXhwIjoxNzY2MDQ5MTUwfQ.i5Lb8-U1VAt0GGcpSeBsgqCzKNluAcskvs8o1K8OOIE
   ```

**Example Response:**
   ```json
{
  "success": true,
  "message": "Account deleted successfully"
}
   ```
Ось API документація тільки для цих ендпоінтів:

### Register ( `/register/` )

#### 1. **Register new client**
   **Method:** `POST`
   **Endpoint:** `/`
   **Description:**
   Registers a new client with contact data, membership, and initial payment.

   | **Role**        | **Required to access**   |
   |-----------------|--------------------------|
   | **Public**      | ✅                        |

   **Example Request:**
   ```http
   POST /register
   ```

   **Request Body:**
   ```json
   {
     "firstName": "Іван",
     "lastName": "Петренко",
     "gender": "male",
     "email": "ivan.petrenko@example.com",
     "phone": "+380501112233",
     "membershipType": 1,
     "startDate": "2025-10-10",
     "endDate": "2025-11-10",
     "price": 700,
     "paymentMethod": "card",
     "isDisposable": false
   }
   ```

   **Example Response:**
   ```json
   {
     "success": true,
     "data": {
       "contact": {
         "contact_data_id": 1,
         "email": "ivan.petrenko@example.com",
         "phone": "+380501112233"
       },
       "client": {
         "client_id": 1,
         "first_name": "Іван",
         "last_name": "Петренко",
         "gender": "male",
         "contact_data_id": 1
       },
       "membership": {
         "membership_id": 1,
         "client_id": 1,
         "class_type_id": 1,
         "start_date": "2025-10-10T00:00:00.000Z",
         "end_date": "2025-11-10T00:00:00.000Z",
         "price": 700,
         "status": "active",
         "is_disposable": false
       },
       "payment": {
         "payment_id": 1,
         "client_id": 1,
         "membership_id": 1,
         "amount": 700,
         "method": "card",
         "status": "pending"
       }
     }
   }
   ```

### Clients ( `/clients/` )

#### 1. **Get all clients**
**Method:** `GET`  
**Endpoint:** `/`  

**Description:**  
Returns a list of all clients.

| **Role**        | **Required to access**   |  
   |-----------------|--------------------------|  
| **Registered**  | ❌                        |  
| **Client**      | ❌                        |  
| **Trainer**     | ❌                        |  
| **Admin**       | ✅                        |  

**Example Request:**
   ```http
   GET /clients/
   Authorization: Bearer <admin_token>
   ```

**Example Response:**
   ```json
[
  {
    "client_id": 1,
    "first_name": "Іван",
    "last_name": "Петренко",
    "gender": "male",
    "membership": {
      "status": "active",
      "end_date": "2025-10-14T00:00:00.000Z"
    }
  },
  {
    "client_id": 2,
    "first_name": "Олена",
    "last_name": "Іванова",
    "gender": "female",
    "membership": null
  },
  {
    "client_id": 3,
    "first_name": "Олег",
    "last_name": "Коваль",
    "gender": "male",
    "membership": null
  }
]
   ```

#### 2. **Get client by ID**
**Method:** `GET`  
**Endpoint:** `/:id`  
**Description:**  
Returns information about a specific client by their ID.

| **Role**        | **Required to access**   |  
   |-----------------|--------------------------|  
| **Registered**  | ❌                        |  
| **Client**      | ✅ (Own profile only)     |  
| **Trainer**     | ❌                        |  
| **Admin**       | ✅                        |  

**Example Request:**
   ```http
   GET /clients/1
   Authorization: Bearer <token>
   ```

**Example Response:**
   ```json
{
  "client_id": 1,
  "first_name": "Іван",
  "last_name": "Петренко",
  "gender": "male",
  "contact_data_id": 5,
  "is_deleted": false,
  "contact_data": {
    "contact_data_id": 5,
    "phone": "380501112233",
    "email": "ivan.petrenko@example.com"
  },
  "membership": [
    {
      "membership_id": 3,
      "start_date": "2025-10-13T00:00:00.000Z",
      "end_date": "2025-10-14T00:00:00.000Z",
      "price": "100",
      "status": "active",
      "is_disposable": true,
      "client_id": 1,
      "class_type_id": 3,
      "class_type": {
        "class_type_id": 3,
        "name": "yoga",
        "description": "Подихайте маткою вперше на наших заняттях з йоги!",
        "level": "beginner",
        "is_deleted": false
      }
    }
  ],
  "payment": [
    {
      "payment_id": 2,
      "created_at": "2025-12-17T08:43:09.814Z",
      "amount": "100",
      "status": "pending",
      "method": "card",
      "client_id": 1,
      "membership_id": 3,
      "is_deleted": false,
      "membership": {
        "membership_id": 3,
        "start_date": "2025-10-13T00:00:00.000Z",
        "end_date": "2025-10-14T00:00:00.000Z",
        "price": "100",
        "status": "active",
        "is_disposable": true,
        "client_id": 1,
        "class_type_id": 3
      }
    }
  ],
  "attendance": [
    {
      "session_id": 4,
      "client_id": 1,
      "status": "booked",
      "is_deleted": false,
      "class_session": {
        "session_id": 4,
        "room_id": 3,
        "class_type_id": 3,
        "capacity": 12,
        "date": "2025-10-13T00:00:00.000Z",
        "trainer_id": 2,
        "is_deleted": false,
        "trainer": {
          "trainer_id": 2,
          "first_name": "Анна",
          "last_name": "Шевченко",
          "is_admin": false,
          "contact_data_id": 4,
          "is_deleted": false
        }
      }
    }
  ]
}
  ```
```JSON
{
  "client_id": 1,
  "first_name": "Іван",
  "last_name": "Петренко",
  "gender": "male",
  "contact_data_id": 5,
  "is_deleted": false,
  "contact_data": {
    "contact_data_id": 5,
    "phone": "380501112233",
    "email": "ivan.petrenko@example.com"
  },
  "membership": [
    {
      "membership_id": 3,
      "start_date": "2025-10-13T00:00:00.000Z",
      "end_date": "2025-10-14T00:00:00.000Z",
      "price": "100",
      "status": "active",
      "is_disposable": true,
      "client_id": 1,
      "class_type_id": 3,
      "class_type": {
        "class_type_id": 3,
        "name": "yoga",
        "description": "Подихайте маткою вперше на наших заняттях з йоги!",
        "level": "beginner",
        "is_deleted": false
      }
    }
  ],
  "payment": [
    {
      "payment_id": 2,
      "created_at": "2025-12-17T08:43:09.814Z",
      "amount": "100",
      "status": "completed",
      "method": "card",
      "client_id": 1,
      "membership_id": 3,
      "is_deleted": false,
      "membership": {
        "membership_id": 3,
        "start_date": "2025-10-13T00:00:00.000Z",
        "end_date": "2025-10-14T00:00:00.000Z",
        "price": "100",
        "status": "active",
        "is_disposable": true,
        "client_id": 1,
        "class_type_id": 3
      }
    }
  ],
  "attendance": [
    {
      "session_id": 4,
      "client_id": 1,
      "status": "booked",
      "is_deleted": false,
      "class_session": {
        "session_id": 4,
        "room_id": 3,
        "class_type_id": 3,
        "capacity": 12,
        "date": "2025-10-13T00:00:00.000Z",
        "trainer_id": 2,
        "is_deleted": false,
        "trainer": {
          "trainer_id": 2,
          "first_name": "Анна",
          "last_name": "Шевченко",
          "is_admin": false,
          "contact_data_id": 4,
          "is_deleted": false
        }
      }
    }
  ]
}
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY3RvciI6InRyYWluZXIiLCJ0cmFpbmVySWQiOjMsImVtYWlsIjoiYW5qYWt1dHMwM0BnbWFpbC5jb20iLCJpc0FkbWluIjp0cnVlLCJpYXQiOjE3NjU5NjQyNTksImV4cCI6MTc2NjA1MDY1OX0.y2HB0JXakQw6bAaAddjjwiIjhSM8vlo4NBk2VDgC2bo

#### 3. **Get client's memberships**
**Method:** `GET`  
**Endpoint:** `/:id/memberships`  
**Description:**  
Returns all memberships belonging to a specific client.

| **Role**        | **Required to access**   |  
   |-----------------|--------------------------|  
| **Client**      | ✅ (Own memberships only) |  
| **Trainer**     | ❌                        |  
| **Admin**       | ✅                        |

**Example Request:**
   ```http
   GET /clients/1/memberships
   Authorization: Bearer <token>
   ```

**Example Response:**
   ```json
   {
     "success": true,
     "data": [
       {
         "membership_id": 2,
         "start_date":  "2025-10-13",
         "end_date": "2025-10-14",
         "price": "100.00",
         "status": "active",
         "is_disposable": true,
         "client_id": 1,
         "class_type_id": 2,
         "class_type":  {
           "class_type_id": 2,
           "name": "yoga",
           "level": "beginner",
           "description": "Подихайте маткою вперше на наших заняттях з йоги! ",
           "is_deleted":  false
         }
       }
     ],
     "total": 1
   }
   ```

#### 4. **Get client's payments**
**Method:** `GET`  
**Endpoint:** `/:id/payments`  
**Description:**  
Returns all payments made by a specific client.

| **Role**        | **Required to access**   |  
   |-----------------|--------------------------|  
| **Client**      | ✅ (Own payments only)    |  
| **Trainer**     | ❌                        |  
| **Admin**       | ✅                        |

**Example Request:**
   ```http
   GET /clients/4/payments
   Authorization: Bearer <token>
   ```

**Example Response:**
   ```json
   {
     "success": true,
     "data": [
       {
         "payment_id": 1,
         "created_at": "2025-12-17T10:30:00.000Z",
         "amount": "700.00",
         "status": "completed",
         "method": "online",
         "client_id": 4,
         "membership_id": 1,
         "is_deleted": false,
         "membership":  {
           "membership_id":  1,
           "start_date": "2025-10-10",
           "end_date": "2025-11-11",
           "status": "active",
           "class_type":  {
             "name": "swimming_pool",
             "level": "advanced"
           }
         }
       },
       {
         "payment_id": 3,
         "created_at":  "2025-12-17T11:00:00.000Z",
         "amount": "700.00",
         "status":  "failed",
         "method":  "online",
         "client_id": 4,
         "membership_id": null,
         "is_deleted": false
       },
       {
         "payment_id": 4,
         "created_at":  "2025-12-17T11:15:00.000Z",
         "amount": "700.00",
         "status": "completed",
         "method": "online",
         "client_id": 4,
         "membership_id": 3,
         "is_deleted":  false,
         "membership": {
           "membership_id": 3,
           "start_date": "2025-09-05",
           "end_date":  "2025-10-06",
           "status": "expired",
           "class_type": {
             "name": "swimming_pool",
             "level":  "advanced"
           }
         }
       }
     ],
     "total": 3
   }
   ```

#### 5. **Get client's attendance history**
**Method:** `GET`  
**Endpoint:** `/:id/attendance`  
**Description:**  
Returns attendance history for a specific client.

| **Role**        | **Required to access**   |  
   |-----------------|--------------------------|  
| **Client**      | ✅ (Own attendance only)  |  
| **Trainer**     | ❌                        |  
| **Admin**       | ✅                        |

**Example Request:**
   ```http
   GET /clients/4/attendance
   Authorization:  Bearer <token>
   ```

**Example Response:**
   ```json
   {
     "success": true,
     "data": [
       {
         "session_id": 3,
         "client_id": 4,
         "status": "cancelled",
         "is_deleted":  false,
         "class_session": {
           "session_id": 3,
           "date": "2025-10-12",
           "duration": "02:00:00",
           "capacity": 10,
           "room_id": 3,
           "class_type_id":  3,
           "trainer_id": 2,
           "is_deleted": false,
           "trainer": {
             "trainer_id": 2,
             "first_name": "Анна",
             "last_name": "Шевченко"
           },
           "room_class_type": {
             "room":  {
               "room_id":  3,
               "capacity": 50,
               "gym":  {
                 "gym_id":  2,
                 "address": "м. Львів, просп. Свободи, 25"
               }
             },
             "class_type": {
               "name": "swimming_pool",
               "level": "advanced",
               "description": "Тренування у басейні для професійних плавців"
             }
           }
         }
       }
     ],
     "total": 1
   }
   ```

#### 6. **Update client**
**Method:** `PATCH`  
**Endpoint:** `/:id`  
**Description:**  
Updates client information (name, gender, contact data). Only allows partial updates.

| **Role**        | **Required to access**   |  
   |-----------------|--------------------------|  
| **Client**      | ✅ (Own profile only)     |  
| **Trainer**     | ❌                        |  
| **Admin**       | ✅                        |

**Example Request:**
   ```http
   PATCH /clients/1
   Authorization: Bearer <token>
   ```

**Request Body:**
   ```json
{
  "first_name": "Іван",
  "last_name": "Бондаренко",
  "contact_data": {
    "email": "ivan.petrenko@example.com"
  }
}
   ```

**Example Response:**
   ```json
{
  "client_id": 1,
  "first_name": "Іван",
  "last_name": "Бондаренко",
  "gender": "male",
  "contact_data_id": 5,
  "is_deleted": false,
  "contact_data": {
    "contact_data_id": 5,
    "phone": "380501112233",
    "email": "ivan.petrenko@example.com"
  }
}
   ```



PATCH /payments/:id
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY3RvciI6InRyYWluZXIiLCJ0cmFpbmVySWQiOjMsImVtYWlsIjoiYW5qYWt1dHMwM0BnbWFpbC5jb20iLCJpc0FkbWluIjp0cnVlLCJpYXQiOjE3NjU5NjQyNTksImV4cCI6MTc2NjA1MDY1OX0.y2HB0JXakQw6bAaAddjjwiIjhSM8vlo4NBk2VDgC2bo

```JSON
{
  "status": "completed"
}
```

```JSON
{
    "success": true,
    "data": {
        "payment_id": 2,
        "created_at": "2025-12-17T08:43:09.814Z",
        "amount": "100",
        "status": "completed",
        "method": "card",
        "client_id": 1,
        "membership_id": 3,
        "is_deleted": false,
        "client": {
            "client_id": 1,
            "first_name": "Іван",
            "last_name": "Петренко",
            "gender": "male",
            "contact_data_id": 5,
            "is_deleted": false,
            "contact_data": {
                "contact_data_id": 5,
                "phone": "380501112233",
                "email": "ivan.petrenko@example.com"
            }
        },
        "membership": {
            "membership_id": 3,
            "start_date": "2025-10-13T00:00:00.000Z",
            "end_date": "2025-10-14T00:00:00.000Z",
            "price": "100",
            "status": "active",
            "is_disposable": true,
            "client_id": 1,
            "class_type_id": 3,
            "class_type": {
                "class_type_id": 3,
                "name": "yoga",
                "description": "Подихайте маткою вперше на наших заняттях з йоги!",
                "level": "beginner",
                "is_deleted": false
            }
        }
    }
}
```

### Membershps ( `/memberships/` )

#### 1. **Create membership**
   **Method:** `POST`
   **Endpoint:** `/`
   **Description:**
   Creates a new membership for a client.

   | **Role**        | **Required to access**   |
   |-----------------|--------------------------|
   | **Client**      | ✅ (via Register only)    |
   | **Trainer**     | ❌                        |
   | **Admin**       | ✅                        |

   **Example Request:**
   ```http
   POST /memberships
   ```

   **Request Body:**
   ```json
   {
     "client_id": 1,
     "class_type_id": 2,
     "start_date": "2025-10-10",
     "end_date": "2025-11-10",
     "price": 500,
     "is_disposable": false
   }
   ```

   **Example Response:**
   ```json
   {
     "success": true,
     "data": {
       "membership_id": 5,
       "client_id": 1,
       "class_type_id": 2,
       "start_date": "2025-10-10T00:00:00.000Z",
       "end_date": "2025-11-10T00:00:00.000Z",
       "price": 500,
       "status": "active",
       "is_disposable": false
     }
   }
   ```

#### 2. **Get all memberships**
   **Method:** `GET`
   **Endpoint:** `/`
   **Description:**
   Returns a list of all memberships.

   | **Role**        | **Required to access**   |
   |-----------------|--------------------------|
   | **Client**      | ❌                        |
   | **Trainer**     | ❌                        |
   | **Admin**       | ✅                        |

   **Example Request:**
   ```http
   GET /memberships
   ```

#### 3. **Get membership by ID**
   **Method:** `GET`
   **Endpoint:** `/:id`
   **Description:**
   Returns a membership by its ID.

   | **Role**        | **Required to access**   |
   |-----------------|--------------------------|
   | **Client**      | ❌                        |
   | **Trainer**     | ❌                        |
   | **Admin**       | ✅                        |

   **Example Request:**
   ```http
   GET /memberships/5
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY3RvciI6InRyYWluZXIiLCJ0cmFpbmVySWQiOjMsImVtYWlsIjoiYW5qYWt1dHMwM0BnbWFpbC5jb20iLCJpc0FkbWluIjp0cnVlLCJpYXQiOjE3NjU5NjQyNTksImV4cCI6MTc2NjA1MDY1OX0.y2HB0JXakQw6bAaAddjjwiIjhSM8vlo4NBk2VDgC2bo
   ```

#### 4. **Update membership**
   **Method:** `PATCH`
   **Endpoint:** `/:id`
   **Description:**
   Updates membership details (dates, status, price).

   | **Role**        | **Required to access**   |
   |-----------------|--------------------------|
   | **Client**      | ❌                        |
   | **Trainer**     | ❌                        |
   | **Admin**       | ✅                        |

   **Example Request:**
   ```http
   PATCH /memberships/5
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY3RvciI6InRyYWluZXIiLCJ0cmFpbmVySWQiOjMsImVtYWlsIjoiYW5qYWt1dHMwM0BnbWFpbC5jb20iLCJpc0FkbWluIjp0cnVlLCJpYXQiOjE3NjU5NjQyNTksImV4cCI6MTc2NjA1MDY1OX0.y2HB0JXakQw6bAaAddjjwiIjhSM8vlo4NBk2VDgC2bo
   ```

   **Request Body:**
   ```json
   {
     "status": "frozen",
     "end_date": "2025-11-20"
   }
   ```

#### 5. **Delete membership**
   **Method:** `DELETE`
   **Endpoint:** `/:id`
   **Description:**
   Hard deletes a membership (admin only).

   | **Role**        | **Required to access**   |
   |-----------------|--------------------------|
   | **Client**      | ❌                        |
   | **Trainer**     | ❌                        |
   | **Admin**       | ✅                        |

   **Example Request:**
   ```http
   DELETE /memberships/5
   ```

### Payments ( `/payments/` )

#### 1. **Get all payments**
   **Method:** `GET`
   **Endpoint:** `/`
   **Description:**
   Returns a list of all payments. May filter by status, method, client_id.

   | **Role**        | **Required to access**   |
   |-----------------|--------------------------|
   | **Client**      | ❌                        |
   | **Trainer**     | ❌                        |
   | **Admin**       | ✅                        |

   **Example Request:**
   ```http
   GET /payments?status=completed
   ```

#### 2. **Get payment by ID**
   **Method:** `GET`
   **Endpoint:** `/:id`
   **Description:**
   Returns a payment by its ID.

   | **Role**        | **Required to access**   |
   |-----------------|--------------------------|
   | **Client**      | ❌                        |
   | **Trainer**     | ❌                        |
   | **Admin**       | ✅                        |

   **Example Request:**
   ```http
   GET /payments/2
   ```

#### 3. **Create payment**
   **Method:** `POST`
   **Endpoint:** `/`
   **Description:**
   Creates a new payment.

   | **Role**        | **Required to access**   |
   |-----------------|--------------------------|
   | **Public/Auth** | ✅ (Public for initial)   |

   **Example Request:**
   ```http
   POST /payments
   ```

   **Request Body:**
   ```json
   {
     "amount": 100,
     "method": "card",
     "client_id": 1,
     "membership_id": 3
   }
   ```

#### 4. **Update payment**
   **Method:** `PATCH`
   **Endpoint:** `/:id`
   **Description:**
   Updates payment status or details.

   | **Role**        | **Required to access**   |
   |-----------------|--------------------------|
   | **Client**      | ❌                        |
   | **Trainer**     | ❌                        |
   | **Admin**       | ✅                        |

   **Example Request:**
   ```http
   PATCH /payments/1
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY3RvciI6InRyYWluZXIiLCJ0cmFpbmVySWQiOjMsImVtYWlsIjoiYW5qYWt1dHMwM0BnbWFpbC5jb20iLCJpc0FkbWluIjp0cnVlLCJpYXQiOjE3NjU5NjQyNTksImV4cCI6MTc2NjA1MDY1OX0.y2HB0JXakQw6bAaAddjjwiIjhSM8vlo4NBk2VDgC2bo
   ```

   **Request Body:**
   ```json
   {
     "status": "completed"
   }
   ```
**Example Response:**
```JSON
{
    "success": true,
    "data": {
        "payment_id": 2,
        "created_at": "2025-12-17T08:43:09.814Z",
        "amount": "100",
        "status": "completed",
        "method": "card",
        "client_id": 1,
        "membership_id": 3,
        "is_deleted": false,
        "client": {
            "client_id": 1,
            "first_name": "Іван",
            "last_name": "Петренко",
            "gender": "male",
            "contact_data_id": 5,
            "is_deleted": false,
            "contact_data": {
                "contact_data_id": 5,
                "phone": "380501112233",
                "email": "ivan.petrenko@example.com"
            }
        },
        "membership": {
            "membership_id": 3,
            "start_date": "2025-10-13T00:00:00.000Z",
            "end_date": "2025-10-14T00:00:00.000Z",
            "price": "100",
            "status": "active",
            "is_disposable": true,
            "client_id": 1,
            "class_type_id": 3,
            "class_type": {
                "class_type_id": 3,
                "name": "yoga",
                "description": "Подихайте маткою вперше на наших заняттях з йоги!",
                "level": "beginner",
                "is_deleted": false
            }
        }
    }
}
```

#### 5. **Get revenue analytics**
   **Method:** `GET`
   **Endpoint:** `/analytics/revenue`
   **Description:**
   Returns revenue analytics grouped by class type.

   | **Role**        | **Required to access**   |
   |-----------------|--------------------------|
   | **Client**      | ❌                        |
   | **Trainer**     | ❌                        |
   | **Admin**       | ✅                        |

   **Example Request:**
   ```http
   GET /payments/analytics/revenue?year=2025&month=12
   ```
**Example Request:**
```JSON
{
"success": true,
"data": [
{
"month": "2025-12",
"classTypes": [
{
"classTypeId": 2,
"classTypeName": "swimming_pool",
"totalRevenue": 1400,
"paymentsCount": 2
},
{
"classTypeId": 3,
"classTypeName": "yoga",
"totalRevenue": 100,
"paymentsCount": 1
}
],
"totalMonthRevenue": 1500
}
],
"filters": {
"year": 2025,
"month": 12
}
}
```