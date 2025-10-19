## **Use Cases**

1. **Authorize (login) via OTP**  
2. **Manage profile**  
3. **Change contact data**  
4. **Change user data**  
5. **View schedule**  
6. **Book a class session**  
7. **Cancel class session booking**  
8. **Buy membership**  
9. **Make payment**  
10. **Pay by card**  
11. **Pay in cash**  
12. **Pay online**  
13. **View action history**  
14. **View payment history**  
15. **View attendance history**  
16. **View membership purchase history**  
17. **Browse membership plans**  
18. **Mark attendance**  
19. **Manage clients accounts**  
20. **Manage trainers**  
21. **Assign a trainer to the gym**  
22. **Register new trainers**  
23. **Delete trainers**  
24.  **Manage trainers' qualifications**  
25.  **Manage memberships**  
26.  **Manage training session**  
27.  **Create session**  
28.  **Cancel session**  
29.  **Assign trainer to session**  
30. **Manage class types**  
31. **Manage facilities**  
32. **CRUD operations with gyms**  
33. **CRUD operations with rooms**  
34. **Manage qualifications**  

## **Functional Requirements**

| № | Requirement | Related Use Cases |
|---|--------------|------------------|
| 1 | **User Authorization** | Authorize (login) via OTP |
| 2 | **Client can buy Membership** | Buy membership |
| 3 | **Client can pay for Membership** | Make payment, Pay by card, Pay in cash, Pay online |
| 4 | **Client can manage their session bookings** | Book a class session, Cancel class session booking |
| 5 | **Manage user profile** | Manage profile, Change contact data, Change user data |
| 6 | **View Schedule** | View schedule |
| 7 | **Trainer can track attendance** | Mark attendance |
| 8 | **Trainer can manage their training sessions** | Manage training session, Create session, Assign trainer to session, Cancel session |
| 9 | **Admin can manage trainers** | Manage trainers, Register new trainers, Delete trainers, Assign trainer to gym, Manage trainers' qualifications |
| 10 | **Admin can manage client accounts** | Manage clients accounts |
| 11 | **Admin can manage client memberships** | Manage memberships |
| 12 | **Admin can manage class types** | Manage class types |
| 13 | **Admin can manage qualification types** | Manage qualifications |
| 14 | **Admin can manage facilities** | Manage facilities, CRUD operations with gyms, CRUD operations with rooms |
| 15 | **Client can view their action history** | View action history, View membership purchase history, View payment history, View attendance history |
| 16 | **Client and Trainer can browse available membership plans** | Browse membership plans |

---

## **Non-Functional Requirements**

| № | Requirement | Description |
|---|--------------|-------------|
| 1 | **Multilingual and Accessible Design** | Responsive and user-friendly web design with support for Ukrainian, English, and Polish, adaptable for people with visual impairments (compatible with screen readers, uses correct semantics). |
| 2 | **Automated Backups** | System must create daily full backups and incremental backups every 6 hours, store them securely for 30 days in AWS S3, and support quick restoration after failure. |
| 3 | **Error Logging and Monitoring** | Capture all runtime and application errors, store logs with timestamps, user/session IDs, and technical details (error code, module, severity), notify administrators of critical issues, and retain logs for at least 90 days with automatic archiving every 30 days. |
| 4 | **Request Limiting (Concurrency)** | Restrict concurrent requests to 5 per user. |
| 5 | **Rate Limiting** | Restrict requests to 100 per minute and block user for 60s for exceeding limit and return Error 429 Too many requests. |
| 6 | **System Availability** | System must provide 99.9% availability per month. |
| 7 | **User Interface Performance** | UI must respond to user actions within 3 seconds under load of up to 100 concurrent users. |
