# DocDrop — Project Engineering Report

## 1. Executive Summary

DocDrop solves two core friction points in modern document collaboration and local shop printing:
1. **Uncontrolled or Complex File Sharing**: Cloud drives often expose files without fine-grained limits or require complicated account sharing. DocDrop delivers unguessable cryptographic URLs with optional bcrypt passcodes, expiration timers, download limits, and instant revocation.
2. **Waiting in Physical Print Shop Queues**: College campuses, libraries, and Xerox centers suffer from bottlenecks, USB malware risks, and long physical queues. DocDrop enables students and professionals to queue print jobs in advance, customize print specs with transparent pricing, and collect printed orders via contactless QR tokens.

---

## 2. System Architecture

DocDrop employs a decoupled, responsive client-server architecture:
- **Frontend**: Built with React 18, Vite, Tailwind CSS, and Lucide Icons. Designed for mobile, tablet, and desktop viewports. Implements client-side routing, live upload progress tracking, audio/visual toast alerts, and responsive modal interactions.
- **Backend API**: Built with Node.js, Express, Multer, and PostgreSQL. Adheres to RESTful conventions, JWT authentication, and streaming file pipelines.
- **Data Storage**: PostgreSQL handles all relational metadata, indexing, foreign keys, and cascading deletes. Files are stored with secure UUID identifiers outside public HTTP paths.

---

## 3. Security Highlights

- **Unguessable Tokens**: Share links use 128-bit cryptographic hex tokens.
- **Password Protection**: Passcodes are hashed with `bcryptjs` (salt rounds: 10).
- **Private File Isolation**: Stored file paths are never revealed to clients. Direct static directory indexing is blocked. All access is streamed via authorization controllers.
- **File Validation**: Enforces size ceilings (25MB) and blocks executable script extensions (`.exe`, `.sh`, `.bat`, etc.).
- **Access Control & Multi-Tenancy**: Data isolation guarantees users can only access and modify their own files unless explicitly granted access via a valid share token.
- **Admin Role Separation**: Dedicated shop management portal for operator actions.

---

## 4. Verification and Testing

DocDrop includes an automated verification test suite covering all 13 critical functional flows:
- Server health check
- Authentication (login & JWT issuance)
- User profile verification
- Multipart file upload & categorization
- Search, filter, and sorting
- Inline file streaming
- Cryptographic link sharing with password protection
- Passcode challenge verification
- Session-based file download
- Print drop order placement & pricing calculation
- Contactless QR ticket generation
- Transaction receipt simulation
- Admin queue management and pickup verification
