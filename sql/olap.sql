--shows trainers whose max class capacity is at least 20.
SELECT t.trainer_id,
       t.first_name,
       t.last_name,
       MAX(cs.capacity) AS max_capacity_taught
FROM trainer t
JOIN class_session cs ON cs.trainer_id = t.trainer_id
GROUP BY t.trainer_id, t.first_name, t.last_name
HAVING MAX(cs.capacity) >= 20;

--shows clients with completed payments totaling over 200, including total and largest payment.
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

--finds class type with the highest total attendance across all sessions
SELECT ct.class_type_id,
       ct.name,
       COUNT(a.client_id) AS total_attendance
FROM class_type ct
JOIN class_session cs ON cs.class_type_id = ct.class_type_id
JOIN attendance a ON a.session_id = cs.session_id
GROUP BY ct.class_type_id, ct.name
HAVING COUNT(a.client_id) = (
    SELECT MAX(total_cnt)
    FROM (
        SELECT COUNT(a.client_id) AS total_cnt
        FROM class_type ct
        JOIN class_session cs ON cs.class_type_id = ct.class_type_id
        JOIN attendance a ON a.session_id = cs.session_id
        GROUP BY ct.class_type_id
    ) t
);

--returns clients showing their highest membership price
SELECT c.client_id,
       c.first_name,
       c.last_name,
       MAX(m.price) AS max_membership_price
FROM client c
LEFT JOIN membership m ON m.client_id = c.client_id
GROUP BY c.client_id, c.first_name, c.last_name
HAVING MAX(m.price) > 0;

--how many classes did each trainer conduct
SELECT t.trainer_id, t.first_name, t.last_name, COUNT(*) AS sessions_count
FROM class_session cs
       JOIN trainer t ON cs.trainer_id = t.trainer_id
GROUP BY t.trainer_id, t.first_name, t.last_name;

--each client's earliest payment
SELECT client_id, MIN(created_at) AS first_payment_date
FROM payment
GROUP BY client_id;

--all clients and their last attendance date
SELECT c.client_id, c.first_name, c.last_name, MAX(a.session_id) AS last_visited_session
FROM client c
       LEFT JOIN attendance a ON c.client_id = a.client_id
GROUP BY c.client_id, c.first_name, c.last_name
HAVING MAX(a.session_id) IS NOT NULL;

--cLients who have an active membership
SELECT c.client_id, c.first_name, c.last_name
FROM client c
WHERE c.client_id IN (
  SELECT m.client_id
  FROM membership m
  WHERE m.status = 'active'
);
