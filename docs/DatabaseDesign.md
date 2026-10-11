# DocDrop Database Design

DocDrop uses **PostgreSQL** as its relational database. The schema is designed for data integrity, cascading deletions for owned resources, and indexing on frequent access paths (tokens, user IDs, categories, and order statuses).

---

## Entity-Relationship (ER) Overview

```mermaid
erDiagram
    USERS ||--o{ FILES : "owns"
    USERS ||--o{ SHARED_LINKS : "creates"
    USERS ||--o{ ORDERS : "places"
    USERS ||--o{ PAYMENTS : "makes"
    USERS ||--o{ NOTIFICATIONS : "receives"
    FILES ||--o{ SHARED_LINKS : "has"
    FILES ||--o{ ORDERS : "printed_via"
    ORDERS ||--o{ PAYMENTS : "has"

    USERS {
        int id PK
        string name
        string email UK
        string password
        string role
        timestamp created_at
        timestamp updated_at
    }

    FILES {
        int id PK
        int user_id FK
        string original_name
        string stored_filename
        string file_path
        string mime_type
        bigint file_size
        string category
        text_array tags
        text description
        boolean is_public
        timestamp created_at
        timestamp updated_at
    }

    SHARED_LINKS {
        int id PK
        int file_id FK
        int user_id FK
        string share_token UK
        string password_hash
        boolean has_password
        timestamp expires_at
        int max_downloads
        int download_count
        int view_count
        boolean is_revoked
        boolean allow_download
        timestamp created_at
    }

    ORDERS {
        int id PK
        string order_number UK
        int user_id FK
        int file_id FK
        int copies
        string color_mode
        string paper_size
        boolean double_sided
        string binding_type
        text notes
        int total_pages
        numeric total_price
        string status
        timestamp pickup_time
        string pickup_code
        text pickup_qr
        timestamp created_at
        timestamp updated_at
    }

    PAYMENTS {
        int id PK
        int order_id FK
        int user_id FK
        numeric amount
        string currency
        string payment_method
        string transaction_id UK
        string status
        timestamp created_at
    }

    NOTIFICATIONS {
        int id PK
        int user_id FK
        string title
        text message
        string type
        string link
        boolean is_read
        timestamp created_at
    }
```

---

## Tables Description

### 1. `users`
Stores user identities, credentials (hashed via bcrypt), and authorization roles (`user` or `admin`).

### 2. `files`
Stores file metadata, isolated internal storage filenames (`<uuid>.<ext>`), file size, MIME type, categories, user-assigned tags, and notes. Physical files are placed outside public HTTP static root in `backend/uploads/` and streamed strictly via authenticated/authorized controllers.

### 3. `shared_links`
Stores unguessable, 32-character crypto share tokens, optional bcrypt passcode hashes, optional expiration dates, download limit ceilings, and revocation flags.

### 4. `orders`
Manages the digital print drop queue. Includes customer choices (color vs B&W, paper format, duplex toggle, binding option), calculated pricing, order status lifecycle (`pending` -> `processing` -> `ready_for_pickup` -> `completed` -> `cancelled`), unique human-readable pickup codes, and QR verification payloads.

### 5. `payments`
Tracks simulated or live payment receipts, payment methods (UPI, Card, Wallet), and unique transaction IDs.

### 6. `notifications`
Delivers immediate in-app updates when share links are accessed, print jobs start, or when orders become ready for pickup.

---

## Key Performance Indexes
- `idx_files_user_id` on `files(user_id)`
- `idx_files_category` on `files(category)`
- `idx_shared_links_token` on `shared_links(share_token)`
- `idx_orders_user_id` on `orders(user_id)`
- `idx_orders_status` on `orders(status)`
- `idx_notifications_user_id` on `notifications(user_id)`
