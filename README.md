# Splitwise Clone

A full-stack web application inspired by Splitwise, designed to help groups and individuals track shared expenses, payments, and balances. Built with React for the frontend and Node.js/Express with MongoDB for the backend.

## Features
- User authentication (register, login)
- Dashboard for viewing balances and recent activity
- Group management (create, view, join groups)
- Add and track expenses within groups
- Record payments between users
- Email notifications for key actions
- Responsive UI

## Tech Stack
- **Frontend:** React (client/)
- **Backend:** Node.js, Express (server/)
- **Database:** MongoDB

## Folder Structure
```
client/         # React frontend
server/         # Node.js/Express backend
```

### Client
- `src/pages/` - Main pages (Dashboard, Group, Login, Register, etc.)
- `src/api.js` - API calls to backend

### Server
- `controllers/` - Route logic
- `models/` - Mongoose models (User, Group, Expense, Payment)
- `routes/` - API endpoints
- `middleware/` - Auth middleware
- `utils/` - Utility functions (e.g., sendEmail)
- `config/db.js` - MongoDB connection

## Getting Started

### Prerequisites
- Node.js & npm
- MongoDB (local or Atlas)

### Installation
1. **Clone the repository:**
   ```powershell
   git clone <repo-url>
   cd splitwise-clone
   ```
2. **Install dependencies:**
   ```powershell
   cd server
   npm install
   cd ../client
   npm install
   ```
3. **Configure environment variables:**
   - Create `.env` files in `server/` and `client/` as needed (see sample `.env.example` if provided).
4. **Start the backend server:**
   ```powershell
   cd server
   npm start
   ```
5. **Start the frontend:**
   ```powershell
   cd client
   npm start
   ```
6. **Access the app:**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend: [http://localhost:5000](http://localhost:5000)

## API Endpoints
- `/api/auth` - Authentication
- `/api/groups` - Group management
- `/api/expenses` - Expense tracking
- `/api/payments` - Payments
- `/api/users` - User info

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
This project is for educational purposes.
