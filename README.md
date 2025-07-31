# 🛡️ RBAC Configuration Tool

A full-stack Role-Based Access Control (RBAC) system built with **Next.js 14 (App Router)**, **Supabase**, **TypeScript**, and **Shadcn UI**. Easily manage users, roles, and permissions with secure access control and audit logging.

---

## 👶 RBAC Explained for Kids

RBAC means giving different people different keys. A “teacher” key opens classrooms, and a “student” key opens books. Each role has powers, so everyone only does what they’re supposed to—like in a game where players have special moves!

---

## ✅ Features

- 🔐 Create, edit, delete **Roles** and **Permissions**
- 👤 Assign roles to users
- 🔎 View effective permissions
- 📜 Audit log of all role/permission actions
- 🧠 (Optional) Natural language permission search
- 🔒 Role-based route protection
- 🎨 Beautiful UI with **Tailwind + Shadcn**

---

## 🧱 Tech Stack

| Layer     | Tech                            |
|-----------|---------------------------------|
| Frontend  | Next.js 14, TypeScript, Shadcn UI |
| Backend   | Supabase (Postgres + Auth)      |
| Database  | Tables: roles, permissions, user_roles, etc. |
| Auth      | Supabase Email Auth             |
| Logs      | `audit_logs` table              |
| Deploy    | Vercel                          |

---

## 📁 Folder Structure

/app
/auth → Login / Signup
/dashboard
/roles → Create/edit roles
/permissions→ Create/edit permissions
/user-roles → Assign roles to users
/logs → View audit logs
/profile → User settings
/components → Reusable UI
/lib → Supabase client

---


## 🧩 Database Schema (Supabase)

### Tables

- `roles(id UUID, name TEXT, description TEXT)`
- `permissions(id UUID, name TEXT, description TEXT)`
- `role_permissions(role_id UUID, permission_id UUID)`
- `user_roles(user_id UUID, role_id UUID)`
- `audit_logs(id UUID, action TEXT, entity TEXT, entity_id UUID, details JSON, performed_by UUID, timestamp TIMESTAMP)`

### Views

- `users_view(id UUID, email TEXT)` — created from `auth.users`

---

## 🧪 Audit Log Entry Example

```json
{
  "action": "create",
  "entity": "permission",
  "entity_id": "uuid-value",
  "details": {
    "name": "can_create_reports"
  },
  "performed_by": "user-uuid"
}
```
---

## 🧩 🚀 Getting Started

### Clone the Repo
```bash
git clone https://github.com/your-username/rbac-tool.git
cd RBAC CONFIG
```
### Install Dependencies
```bash
npm install
```
### Add Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
### Run Locally
```bash
npm run dev
```
---

## 📤 Deploy on Vercel
1>Push your code to GitHub

2>Go to vercel.com

3>Import your repo

4>Add environment variables in the Vercel dashboard

5>Click Deploy

---
## 📸 Demo

Live Demo: [rbac-config.vercel.app](https://rbac-config.vercel.app/) *(update this URL if needed)*

---

## 📄 License

MIT License © 2025 sunny kumar
