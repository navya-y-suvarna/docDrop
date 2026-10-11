# DocDrop API Documentation

Base URL: `http://localhost:5000/api`

---

## Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Log in and receive JWT token | No |
| `GET` | `/api/auth/me` | Fetch currently authenticated user | Yes |
| `PUT` | `/api/auth/profile` | Update profile information | Yes |
| `PUT` | `/api/auth/change-password`| Update user password | Yes |

---

## File Vault Endpoints (`/api/files`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/files/upload` | Upload document (multipart/form-data) | Yes |
| `GET` | `/api/files` | List documents (search `q`, filter `category`, `sort`) | Yes |
| `GET` | `/api/files/stats/summary`| Storage quota and file count metrics | Yes |
| `GET` | `/api/files/:id` | Get document metadata | Yes |
| `GET` | `/api/files/:id/view` | Stream document for browser inline preview | Yes (Owner) |
| `GET` | `/api/files/:id/download` | Download original file | Yes (Owner) |
| `PUT` | `/api/files/:id` | Update document tags, notes, or visibility | Yes (Owner) |
| `DELETE`| `/api/files/:id` | Delete document from storage and database | Yes (Owner) |
| `POST` | `/api/files/:id/share` | Create unguessable share link | Yes (Owner) |
| `GET` | `/api/files/:id/shares` | List all share links for a document | Yes (Owner) |

---

## Secure Share Endpoints (`/api/shares`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/shares/my-shares` | List all user's shared links | Yes |
| `DELETE`| `/api/shares/:token` | Revoke active share link | Yes (Owner) |
| `GET` | `/api/shares/public/:token` | Public file metadata (unguessable URL) | Public |
| `POST` | `/api/shares/public/:token/verify` | Verify passcode for protected link | Public |
| `GET` | `/api/shares/public/:token/view` | Public stream for online preview | Public (With passcode if set) |
| `GET` | `/api/shares/public/:token/download` | Public download stream | Public (With passcode if set) |

---

## Smart Print & Xerox Queue Endpoints (`/api/orders`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/orders` | Submit print order with options & QR ticket | Yes |
| `POST` | `/api/orders/quote` | Instant pricing quote calculator | Yes |
| `GET` | `/api/orders` | List user order history | Yes |
| `GET` | `/api/orders/:id` | Get order details & QR code | Yes (Owner/Admin) |
| `GET` | `/api/orders/admin/queue` | Admin shop queue management | Admin |
| `PUT` | `/api/orders/admin/:id/status`| Update status (`processing`, `ready_for_pickup`, `completed`)| Admin |
| `POST` | `/api/orders/admin/verify-pickup`| Counter verification of 6-char pickup code | Admin |

---

## Payment & Receipt Endpoints (`/api/payments`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/payments/process` | Process order payment checkout | Yes |
| `GET` | `/api/payments/receipt/:orderId`| Get transaction receipt | Yes (Owner/Admin) |

---

## In-App Notifications (`/api/notifications`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/notifications` | Fetch user alerts & unread counter | Yes |
| `PUT` | `/api/notifications/:id/read` | Mark individual notification read | Yes |
| `PUT` | `/api/notifications/read-all`| Mark all notifications read | Yes |
