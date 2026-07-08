# StockerAI Enterprise 📦🚀

StockerAI is a premium, state-of-the-art **Enterprise Inventory Management System (IMS)** designed to streamline tracking, ordering, analytics, and supplier relationships. It features a stunning glassmorphic interface, dark/light mode switching, responsive mobile layouts, and secure Google OAuth integration.

---

## 📂 Project Structure

```bash
├── Design/           # Application screenshots (Dashboard, Inventory, etc.)
├── Docx/             # Technical design documentation & architecture
├── Postman-Api/      # Backend API endpoint test screenshots
├── backend/          # Express.js REST API server
└── frontend/         # React.js & Vite Client Application
```

---

## ✨ Key Features

1. **📦 Advanced Inventory Management**:
   - Dynamic datagrid view of active catalog items.
   - Inline fast-edit for current stock counts.
   - Soft deactivation (`isActive: false`) instead of permanent deletions.
   - Multi-select rows with bulk order creation matching primary suppliers.

2. **📊 Analytics & Operation Dashboard**:
   - Premium dashboard layout with radial ambient glows.
   - Interactive area charts tracking monthly Sales vs Purchases.
   - Stock Health Index SVG circular ring gauge.
   - Real-time stock valuation updates.

3. **🔐 Secure User Authentication**:
   - Custom Email & Password logins using Passport.js Local Strategy.
   - One-click **Continue with Google** OAuth integration.
   - Secure cookie-based session persistence.

4. **📱 Flawless Mobile Responsiveness**:
   - Auto-dismissing drawer navigation sidebar with a blur backdrop overlay.
   - Card lists replacing tables on viewports under `768px` for touch devices.

---

## 🛠️ Quick Start Guide

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas database cluster

### 2. Run the Backend
```bash
cd backend
npm install
npm run dev
```

### 3. Run the Frontend
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser to launch the app!
