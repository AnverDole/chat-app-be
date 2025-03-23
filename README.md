# Chat App Backend (Nest.js)

This is the backend for the real-time chat application built using **Nest.js**, with user authentication, friend system, real-time messaging, and MySQL database integration.

---

## Features

- JWT-based signup and login
- Real-time messaging using WebSockets (Socket.IO)
- MySQL database with TypeORM
- Friend management: search users, send/approve/reject requests
- Secure password hashing with bcrypt
- Modular, clean code structure with Nest.js modules

---

## Tech Stack

- **Framework**: Nest.js (TypeScript)
- **Database**: MySQL (via AWS RDS)
- **ORM**: TypeORM
- **Auth**: JWT + Bcrypt
- **Real-Time**: Socket.IO (WebSockets)
- **Deployment**: AWS Elastic Beanstalk (Node.js environment)
- **CI/CD**: AWS CodePipeline + CodeBuild + CodeCommit + GitHub

---

## Setup Instructions

1. **Clone the repo**

   ```bash
   git clone https://github.com/AnverDole/chat-app-be.git
   cd chat-app-be
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment variables**\
   Create a `.env` file:

   ```env
   DB_HOST=<your-rds-endpoint>
   DB_PORT=3306
   DB_USERNAME=<your-db-username>
   DB_PASSWORD=<your-db-password>
   DB_NAME=<your-db-name>
   JWT_SECRET=your_jwt_secret
   ```

4. **Run the app**

   ```bash
   npm run start:dev
   ```

---

## Deployment

- Backend is deployed to **AWS Elastic Beanstalk** using a Node.js environment.
- CI/CD pipeline is managed using **AWS CodePipeline** and **CodeBuild**.
- Code is hosted on **GitHub** and mirrored to **AWS CodeCommit** for automated builds.

---

## Extra Features

- Friend search and request approval/rejection
- Real-time message delivery status with Socket.IO&#x20;
- Environment-based config for secure production deployment

---

## Assumptions and Limitations

- No typing indicators
- Email verification is skipped for testing convenience

