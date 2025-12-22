# OLAP
This section describes the OLAP (Online Analytical Processing) aspects of the database schema, focusing on the entities and relationships that support complex data analysis and reporting.

## Table of contents
- [Trainers whose max class capacity is at least 20](#1-trainers-whose-max-class-capacity-is-at-least-20)
- [Clients with completed payments totaling over 200, including total and largest payment](#2-clients-with-completed-payments-totaling-over-200-including-total-and-largest-payment)
- [Class type with the highest total attendance across all sessions](#3-class-type-with-the-highest-total-attendance-across-all-sessions)
- [Clients' highest membership price](#4-clients-highest-membership-price)
- [Number of classes conducted by each trainer](#5-number-of-classes-conducted-by-each-trainer) 
- [Clients' earliest payment](#6-clients-earliest-payment)
- [Last attendance session for each client](#7-last-attendance-session-for-each-client)
- [Clients with active membership](#8-clients-with-active-membership)
- [Total payments made by each client](#9-total-payments-made-by-each-client)
- [Average membership price by class level](#10-average-membership-price-by-class-level)
- [Number of class types supported by each room](#11-number-of-class-types-supported-by-each-room)
- [Number of attendances per client](#12-number-of-attendances-per-client)

## 1. Trainers whose max class capacity is at least 20

```sql
SELECT t.trainer_id,
  t.first_name,
  t.last_name,
  MAX(cs.capacity) AS max_capacity_taught
FROM trainer t
       JOIN class_session cs ON cs.trainer_id = t.trainer_id
GROUP BY t.trainer_id, t.first_name, t.last_name
HAVING MAX(cs.capacity) >= 20;
```
  
**Results:**  
<img width="737" height="78" alt="image" src="https://github.com/user-attachments/assets/8fa275ee-01b1-4bd2-90b5-e57e58b886ab" />  
  
**Description:**  
This query identifies trainers whose maximum class capacity is at least 20. It calculates the maximum class size taught by each trainer and filters to include only those trainers who have a class with a capacity of 20 or more. It helps in determining trainers who are capable of managing larger classes, which can be useful for scheduling and resource allocation.  
  
## 2. Clients with completed payments totaling over 200, including total and largest payment

```sql
SELECT c.client_id,
  c.first_name,
  c.last_name,
  SUM(p.amount) AS total_paid,
  MAX(p.amount) AS largest_single_payment
FROM client c
       JOIN payment p ON p.client_id = c.client_id
WHERE p.status = 'completed'
GROUP BY c.client_id, c.first_name, c.last_name
HAVING SUM(p.amount) > 200;
```

**Results:**  
<img width="894" height="86" alt="image" src="https://github.com/user-attachments/assets/94584d85-f987-456a-8601-edf7a91bde71" />  
  
**Description:**  
This query retrieves clients who have made completed payments totaling over 200, including the sum of all payments and the largest single payment made. This query is useful for identifying high-value clients who are actively engaged with the service and can help in targeting premium services.  

## 3. Class type with the highest total attendance across all sessions

```sql
SELECT ct.class_type_id,
  ct.name,
  COUNT(a.client_id) AS total_attendance
FROM class_type ct
       JOIN class_session cs ON cs.class_type_id = ct.class_type_id
       JOIN attendance a ON a.session_id = cs.session_id
GROUP BY ct.class_type_id, ct.name
HAVING COUNT(a.client_id) = (SELECT MAX(total_cnt)
                             FROM (SELECT COUNT(a.client_id) AS total_cnt
                                   FROM class_type ct
                                          JOIN class_session cs ON cs.class_type_id = ct.class_type_id
                                          JOIN attendance a ON a.session_id = cs.session_id
                                   GROUP BY ct.class_type_id) t);
```  
**Results:**  
<img width="565" height="61" alt="image" src="https://github.com/user-attachments/assets/1b919044-b0a1-4e8d-a7f4-150a4064dadf" />  
  
**Description:**  
This query identifies the class type that has the highest total attendance across all sessions by counting the number of clients who attended each class type.This is useful to determine the most popular class type based on client engagement.  

## 4. Clients' highest membership price

```sql
SELECT c.client_id,
  c.first_name,
  c.last_name,
  MAX(m.price) AS max_membership_price
FROM client c
       LEFT JOIN membership m ON m.client_id = c.client_id
GROUP BY c.client_id, c.first_name, c.last_name
HAVING MAX(m.price) > 0;
```
**Results:**  
<img width="748" height="82" alt="image" src="https://github.com/user-attachments/assets/c05b66c0-c7ec-4c0f-b6a9-acea72a13ceb" />  

**Description:**
This query returns the highest membership price for each client. It helps in understanding the premium membership plans subscribed by clients. Useful for identifying clients who have subscribed to higher-value memberships and tailoring premium offerings.  

## 5. Number of classes conducted by each trainer

```sql
SELECT t.trainer_id, t.first_name, t.last_name, COUNT(*) AS sessions_count
FROM class_session cs
       JOIN trainer t ON cs.trainer_id = t.trainer_id
GROUP BY t.trainer_id, t.first_name, t.last_name;
```
**Results:**  
<img width="700" height="84" alt="image" src="https://github.com/user-attachments/assets/fde4a831-ca85-4c04-b089-6f88dc9aa27f" />  

**Description:**  
This query calculates the number of classes conducted by each trainer. This query helps in tracking the workload of trainers and ensuring proper distribution of teaching hours.  

## 6. Clients' earliest payment

```sql
SELECT client_id, MIN(created_at) AS first_payment_date
FROM payment
GROUP BY client_id;
```
**Results:**  
<img width="470" height="98" alt="image" src="https://github.com/user-attachments/assets/3604ddd4-40f9-4e19-8a92-0f4bc0352452" />  

**Description:**  
This query retrieves the date of the earliest payment for each client. This helps in understanding when clients first engaged with the service, useful for analyzing client loyalty and behavior.  

## 7. Last attendance session for each client

```sql
SELECT c.client_id, c.first_name, c.last_name, MAX(a.session_id) AS last_visited_session
FROM client c
       LEFT JOIN attendance a ON c.client_id = a.client_id
GROUP BY c.client_id, c.first_name, c.last_name
HAVING MAX(a.session_id) IS NOT NULL;
```
**Results:**  
<img width="721" height="89" alt="image" src="https://github.com/user-attachments/assets/4d9a3c3c-22d7-4bc0-8b59-c345493e72f5" />  

**Description:**  
This query returns each client's last attended session, which helps to track recent engagement with the service. Useful for understanding client retention and identifying those who may need re-engagement efforts.  

## 8. Clients with active membership

```sql
SELECT c.client_id, c.first_name, c.last_name
FROM client c
WHERE c.client_id IN (SELECT m.client_id
                      FROM membership m
                      WHERE m.status = 'active');
```
**Results:**  
<img width="496" height="81" alt="image" src="https://github.com/user-attachments/assets/aaf5d978-ed73-4c7a-9f6a-41c22a2cd2db" />  

**Description:**
This query lists clients who have an active membership. This helps in filtering clients who are currently engaged with the service, which is useful for promotions or customer support.  

## 9. Total payments made by each client

```sql
SELECT p.client_id,
  SUM(p.amount) AS total_paid
FROM payment p
WHERE p.status = 'completed'
GROUP BY p.client_id;
```  
**Results:**  
<img width="346" height="90" alt="image" src="https://github.com/user-attachments/assets/88357a1e-81a5-4def-869f-d2cc20a5baea" />  

**Description:**
This query calculates the total amount paid by each client, considering only completed payments. This helps in identifying the financial value of clients and can guide targeted offers or loyalty programs.  

## 10. Average membership price by class level

```sql
SELECT ct.level,
  AVG(m.price) AS avg_price
FROM membership m
       JOIN class_type ct ON m.class_type_id = ct.class_type_id
GROUP BY ct.level;
```
**Results:**  
<img width="306" height="89" alt="image" src="https://github.com/user-attachments/assets/34d172b6-84e7-4930-9ca6-30f04e801fa0" />  

**Description:**
This query calculates the average membership price for each class level. It helps in understanding the pricing trends for different class levels and can guide pricing strategies.  

## 11. Number of class types supported by each room

```sql
SELECT r.room_id,
  r.capacity,
  COUNT(rct.class_type_id) AS supported_class_types
FROM room r
       LEFT JOIN room_class_type rct ON r.room_id = rct.room_id
GROUP BY r.room_id, r.capacity;
```
**Results:**  
<img width="575" height="125" alt="image" src="https://github.com/user-attachments/assets/f5279ad4-07ff-4427-acdb-ae5b66e86dc3" />  

**Description:**
This query calculates how many class types each room supports, considering the room's capacity. This is useful for resource management, ensuring rooms are used efficiently according to their capacity.  

## 12. Number of attendances per client

```sql
SELECT c.client_id,
  c.first_name,
  c.last_name,
  (SELECT COUNT(*)
   FROM attendance a
   WHERE a.client_id = c.client_id) AS attendance_count
FROM client c;
```
**Results:**  
<img width="703" height="148" alt="image" src="https://github.com/user-attachments/assets/22f4d64a-d973-4a3b-8da6-38ab4dd48fcf" />  

**Description:**
This query calculates the total number of sessions attended by each client. It helps in tracking client engagement and identifying highly engaged clients for personalized services.  
