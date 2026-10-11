# DocDrop 📄✨

**DocDrop** is a modern full-stack document vault, secure sharing platform, and smart print drop management system. It allows users to securely store, categorize, and preview documents, share them using unguessable password-protected links with expiration timers, and queue print jobs with upfront pricing and contactless QR code pickup.

---

## 🚀 Key Features

### 📁 Document Vault
- **Multi-Format Support**: Store PDFs, images, spreadsheets, text/code, and office documents up to 25MB.
- **Instant Previews**: Embedded viewers for PDFs, high-res image modal, and code/text viewers.
- **Organized Filtering**: Search by keyword, filter by file category, and sort by date, name, or size.
- **Tags & Notes**: Add custom tags and descriptions to documents.
- **Secure File Storage**: Stored files are isolated using UUID-based internal identifiers and streamed strictly through authorized endpoints.

### 🔗 Unguessable Secure Sharing
- **128-Bit Crypto Tokens**: Unique, unguessable links generated with Node.js crypto.
- **Passcode Protection**: Set optional bcrypt-hashed access passwords.
- **Expiration Controls**: Preset durations (1 hour, 24 hours, 7 days, 30 days, or never).
- **Download Limits & Permissions**: Restrict to view-only mode or set a maximum download ceiling.
- **Instant Revocation**: Disable or delete shared links at any time.
- **Public Recipient Portal**: Dedicated mobile-responsive page where recipients can unlock and view documents.

### 🖨️ Smart Print & Xerox Drop
- **Interactive Print Studio**: Configure copies, color mode (B&W or Color), paper size (A4, A3, Letter), duplex double-sided mode, and binding (Staple, Spiral).
- **Transparent Price Engine**: Real-time quote calculation with paper savings for double-sided prints.
- **Contactless QR Ticket**: Generates an encrypted QR code and 6-character pickup code.
- **Digital Queue Management**: Print shops track incoming jobs in real time and advance statuses (`Pending` ➔ `Processing` ➔ `Ready for Pickup` ➔ `Completed`).
- **Counter Verification Scanner**: Operators verify pickup codes in seconds.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Axios, React Router v6.
- **Backend**: Node.js, Express, Multer, PostgreSQL (`pg`), JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `qrcode`.
- **Database**: PostgreSQL (relational tables with foreign key cascades and performance indexing).

---

## 📋 Prerequisites

- **Node.js**: v18.0.0 or higher (v22+ recommended)
- **PostgreSQL**: v13 or higher running locally or remotely

---

## ⚡ Quick Start

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone <repo-url>
cd docDrop

# Install dependencies for both backend and frontend
npm run install:all
```

### 2. Configure Environment Variables

Create `.env` inside `backend/` (or copy from `backend/.env.example`):

```bash
cp backend/.env.example backend/.env
```

Ensure your `backend/.env` contains your PostgreSQL connection string and secret keys:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/docdrop
JWT_SECRET=your_super_secret_jwt_key_here
CLIENT_URL=http://localhost:5173
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=25
```

### 3. Initialize Database & Seed Demo Data

Run the database setup script to create all tables, indexes, and seed demo accounts:

```bash
npm run init-db
```

This creates:
- **Demo User**: `demo@docdrop.com` / `Demo@123`
- **Admin User**: `admin@docdrop.com` / `Admin@123`

### 4. Run the Application

You can start both backend and frontend concurrently:

```bash
npm start
```

Or run them in separate terminals:

```bash
# Terminal 1: Start Backend API (http://localhost:5000)
npm run dev:backend

# Terminal 2: Start Frontend (http://localhost:5173)
npm run dev:frontend
```

Now open [http://localhost:5173](http://localhost:5173) in your browser!

---

## 🧪 Automated Testing

DocDrop includes an automated end-to-end test suite testing all 13 core flows:

```bash
npm test
```

Test results cover:
1. Health check
2. User authentication & JWT issuance
3. Profile retrieval
4. Multipart file upload & categorization
5. Search & filtering
6. Inline file streaming
7. Password-protected share link creation
8. Public share metadata inspection
9. Passcode challenge verification
10. Authorized download stream
11. Print order placement & price quotation
12. Order payment simulation & receipt
13. Admin queue tracking & pickup code verification

---

## 📖 Documentation

- [API Documentation](docs/API_Documentation.md)
- [Database Design](docs/DatabaseDesign.md)
- [Project Report](docs/ProjectReport.md)
