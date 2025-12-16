## **API/usage examples**  

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