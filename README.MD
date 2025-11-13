# 💼 Workly - Employee Attendance & Payroll Management SaaS

![Workly](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![MongoDB](https://img.shields.io/badge/database-MongoDB-green)

**Workly** is a complete, production-ready SaaS application for managing employee attendance and payroll. Built specifically for small businesses in Pakistan and developing markets.

---

## 🚀 **Features**

### ✅ **Core Features**
- Multi-company/tenant support (true SaaS)
- Role-based access control (Admin & Employee)
- Employee management (CRUD operations)
- Daily attendance tracking (check-in/check-out)
- Automatic payroll calculation
- Leave management system
- PDF payslip generation
- Dashboard analytics
- Mobile responsive design

### 🔒 **Security**
- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting (100 requests/15 min)
- CORS protection
- Helmet security headers
- Input validation
- Session management

### 📊 **Business Features**
- Subscription management (trial/pro)
- Employee limits per plan
- Multi-month payroll history
- Attendance reports
- Leave approval workflow
- Salary deduction automation

---

## 🛠️ **Tech Stack**

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, Tailwind CSS, Vanilla JavaScript |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Authentication** | JWT (jsonwebtoken) |
| **Security** | bcrypt, helmet, cors, express-rate-limit |
| **Validation** | express-validator |
| **Deployment** | Render (Backend), Netlify (Frontend) |

---

## 📋 **Prerequisites**

Before you begin, ensure you have:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB Atlas Account** (free) - [Sign Up](https://www.mongodb.com/cloud/atlas/register)
- **Git** (optional) - [Download](https://git-scm.com/)
- **Code Editor** (VS Code recommended) - [Download](https://code.visualstudio.com/)

---

## 🚀 **Quick Start (Local Development)**

### **Step 1: Download/Clone the Project**

```bash
# If using Git
git clone https://github.com/yourusername/workly-saas.git
cd workly-saas

# OR just create the folder structure manually
mkdir workly-saas
cd workly-saas