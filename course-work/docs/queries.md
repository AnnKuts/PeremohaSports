# Complex SQL Queries Documentation

This document provides detailed explanations and sample queries for analyzing gym utilization, revenue, and attendance data.**

## Table of Contents:

- [Room Revenue and Attendance Analysis](#room-revenue-and-attendance-analysis)
- [Monthly Revenue by Class Type](#monthly-revenue-by-class-type)
- [Gyms and Room Utilization Data](#gyms-and-room-utilization-data)

## 1. Room Revenue and Attendance Analysis

**Business Question:**  
Which gyms and rooms generate the most revenue and have the highest attendance?

**SQL Query:**

```sql
  SELECT 
    g.gym_id,
    g.address AS gym_address,
    r.room_id,
    r.capacity AS room_capacity,
    COUNT(a.session_id) AS attendance_count,
    SUM(m.price) AS total_revenue
  FROM gym g
  JOIN room r ON r.gym_id = g.gym_id
  JOIN class_session cs ON cs.room_id = r.room_id
  JOIN attendance a ON a.session_id = cs.session_id
  JOIN membership m ON m.client_id = a.client_id AND cs.class_type_id = m.class_type_id
  WHERE a.status IN ('attended', 'booked')
  GROUP BY g.gym_id, g.address, r.room_id, r.capacity
  ORDER BY total_revenue DESC, attendance_count DESC;
  ```

**Explanation:**

- **JOIN with multiple tables:** The query connects the `gym`, `room`, `class_session`, `attendance`, and `membership` tables to get data about gyms, rooms, sessions, attendance, and revenue.

- **COUNT(a.session_id):** Calculates the attendance count for each room and gym by counting the number of sessions attended or booked by clients.

- **SUM(m.price):** Calculates the total revenue for each room and gym by summing up the prices of memberships associated with attended or booked sessions.

- **GROUP BY:** Groups the results by gym, room, and room capacity to aggregate data on a per-room basis for each gym.

- **ORDER BY:** Sorts the results by total revenue in descending order and attendance count in descending order to prioritize the most profitable and most attended rooms and gyms.

- **Pagination:** The query can be extended with LIMIT and OFFSET to implement pagination, allowing results to be fetched in smaller chunks for UI purposes.

**Sample Output:**

| gym_id | gym_address        | room_id | room_capacity | attendance_count | total_revenue |
|--------|--------------------|---------|---------------|------------------|---------------|
| 10     | 707 Redwood St, Kyiv | 10      | 60            | 1                | 1400.00       |
| 8      | 505 Walnut St, Kyiv  | 8       | 45            | 1                | 1200.00       |
| 7      | 404 Cedar St, Kyiv   | 7       | 35            | 1                | 1100.00       |
| 5      | 202 Elm St, Kyiv     | 5       | 50            | 1                | 900.00        |
| 4      | 101 Maple St, Kyiv   | 4       | 40            | 1                | 800.00        |
| 2      | 456 Oak St, Kyiv     | 2       | 20            | 1                | 600.00        |
| 1      | 123 Main St, Kyiv    | 1       | 25            | 1                | 500.00        |

## 2. Monthly Revenue by Class Type

**Business Question:**  
What is the monthly revenue and attendance by class type for the past specified number of months?

**SQL Query:**  

```sql
SELECT
  ct.name AS class_category,
  DATE_TRUNC('month', cs.date) AS month,
  COUNT(a.session_id) AS attendance_count,
  SUM(m.price) AS total_revenue
FROM class_session cs
JOIN room_class_type rct ON cs.room_id = rct.room_id AND cs.class_type_id = rct.class_type_id
JOIN class_type ct ON cs.class_type_id = ct.class_type_id
JOIN attendance a ON cs.session_id = a.session_id
JOIN membership m ON a.client_id = m.client_id AND cs.class_type_id = m.class_type_id
WHERE a.status = 'attended'
GROUP BY ct.name, DATE_TRUNC('month', cs.date)
HAVING SUM(m.price) > 500
ORDER BY month DESC, total_revenue DESC;
```

**Explanation:**

- **JOIN with multiple tables:** The query connects several tables (class_session, room_class_type, class_type, attendance, and membership) to get data on class types, room assignments, attendance, and membership details.

- **TO_CHAR(cs.date, 'YYYY-MM'):** Converts the cs.date field (session date) to a month-year format (e.g., '2023-05') for easy grouping and reporting.

- **COUNT(a.session_id):** Counts the number of sessions attended by users for each class type and month.

- **SUM(m.price):** Calculates the total revenue from memberships for each class type and month, based on the price of the membership.

- **GROUP BY:** Groups the results by class type (ct.name) and month (TO_CHAR(cs.date, 'YYYY-MM')).

- **HAVING:** Filters the results based on two conditions: Only include results where total revenue is greater than the specified minRevenue. Only include results where the attendance count is greater than or equal to the specified minAttendance.

- **Date Range Filter:** The WHERE clause filters sessions to include only those within the last months months, by comparing the session date to the current date minus the specified interval (INTERVAL '${months} months').

- **Ordering:** The results are sorted by month (most recent first) and then by total revenue in descending order to show the most profitable classes first.

- **Pagination:** This query can be adjusted with LIMIT and OFFSET if needed for pagination, allowing results to be retrieved in manageable chunks.

**Sample Output:**

| class_category | month                | attendance_count | total_revenue |
|----------------|----------------------|------------------|---------------|
| yoga           | 2025-12-01           | 3                | 2700.00       |

## 3. **Gyms and Room Utilization Data**

**Business Question:**  
What is the utilization data for gyms and their rooms, including class sessions and attendance?

**SQL Query:**

```sql
SELECT 
  g.gym_id,
  g.address AS gym_address,
  r.room_id,
  r.capacity AS room_capacity,
  ct.name AS class_category,
  COUNT(a.session_id) AS attendance_count
FROM gym g
JOIN room r ON r.gym_id = g.gym_id
JOIN room_class_type rct ON rct.room_id = r.room_id
JOIN class_type ct ON rct.class_type_id = ct.class_type_id
JOIN class_session cs ON cs.room_id = r.room_id AND cs.class_type_id = ct.class_type_id
JOIN attendance a ON a.session_id = cs.session_id
WHERE a.status IN ('attended', 'booked')
GROUP BY g.gym_id, g.address, r.room_id, r.capacity, ct.name
ORDER BY g.gym_id, r.room_id, ct.name;
```

Explanation:

- **JOIN with multiple tables:** The query connects multiple tables: gym, room, room_class_type, class_type, class_session, and attendance to gather detailed information about gym rooms, the types of classes offered, and the attendance for each session.

- **COUNT(a.session_id):** This counts the number of sessions attended or booked by users for each gym room and class type.

- **GROUP BY:** The query groups the results by gym, room, and class type to get the attendance data on a per-room and per-class basis.

- **WHERE:** Filters attendance records based on the status being either attended or booked, meaning the query only considers sessions where users either attended or booked a session.

- **Ordering:** The results are sorted by gym ID, room ID, and class type to structure the output based on gyms, rooms, and types of classes.

**Sample Output:**

| gym_id | gym_address            | room_id | room_capacity | class_category | attendance_count |
|--------|------------------------|---------|---------------|----------------|------------------|
| 1      | "м. Київ, вул. Спортивна, 10" | 2       | 90            | yoga           | 1                |

## 4. Payment-based Revenue Analytics

**Business Question:**
What is the actual realized revenue from payments, grouped by month and class type?

**SQL Query:**

```sql
SELECT 
  TO_CHAR(p.created_at, 'YYYY-MM') AS month,
  ct.name AS class_type_name,
  SUM(p.amount) AS total_revenue,
  COUNT(p.payment_id) as payments_count
FROM payment p
JOIN membership m ON p.membership_id = m.membership_id
JOIN class_type ct ON m.class_type_id = ct.class_type_id
WHERE p.status = 'completed' 
  AND p.is_deleted = false
  -- Optional: Filter by year/month
  AND p.created_at >= '2025-01-01' 
  AND p.created_at <= '2025-12-31'
GROUP BY TO_CHAR(p.created_at, 'YYYY-MM'), ct.name
ORDER BY month ASC;
```

**Explanation:**

- **Source Table:** Uses the `payment` table as the source of truth for financial data, rather than estimating based on attendance
- .
- **JOINs:** Joins with `membership` and `class_type` to categorize revenue by the specific type of class/service purchased.

- **Filters:** Includes only `completed` payments that are not soft-deleted. Can be filtered by date range (year/month).

- **Aggregations:**
  - `SUM(p.amount)`: Calculates total actual revenue.
  - `COUNT(p.payment_id)`: Counts the number of successful transactions.
- **Grouping:** Aggregates data by Month and Class Type name.

**Sample Output:**

| month      | class_type_name | total_revenue | payments_count |
|------------|-----------------|---------------|----------------|
| 2025-10    | yoga            | 1400.00       | 2              |
| 2025-11    | swimming        | 2100.00       | 3              |
