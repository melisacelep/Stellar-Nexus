# 🌌 Stellar Nexus | Next-Gen Blockchain dApp

**Stellar Nexus** is a full-stack decentralized application (dApp) built on the **Stellar Testnet**.

This project demonstrates how a modern web application can interact with the Stellar blockchain using a **React frontend**, **Node.js backend**, and the **Stellar SDK**.

Users can create and fund testnet accounts, check wallet balances, and send XLM payments through a simple web interface.

---

## ✨ Features

- Fund a Stellar Testnet account using **Friendbot**
- View balances of any Stellar public key
- Send XLM payments through the application
- Verify transactions on the blockchain explorer
- Clean and simple user interface

---

## 🛠 Tech Stack

### Frontend
- React
- Vite
- CSS

### Backend
- Node.js
- Express.js

### Blockchain
- Stellar SDK
- Stellar Horizon Testnet API

---

## 📁 Project Structure

```
stellar-nexus
│
├── backend/      # Express API communicating with Stellar
│
├── frontend/     # React user interface
│
└── README.md
```

---

## 🚀 Installation

### Prerequisites

Make sure you have installed:

- Node.js
- npm

You will also need a **Stellar Testnet public key**.

You can generate one here:  
https://laboratory.stellar.org

---

## Backend Setup

Navigate to the backend directory:

```bash
cd backend
npm install
node index.js
```

Create a `.env` file inside the **backend** folder:

```
PORT=5000
STELLAR_SERVER_SECRET=YOUR_TESTNET_SECRET
```

This secret key belongs to the **server testnet account** that will send transactions.

You can fund the account using Friendbot:

https://friendbot.stellar.org

---

## Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
npm install
npm run dev
```

The application will usually run at:

```
http://localhost:5173
```

---

## 📖 Usage

### 1. Fund an Account

Enter a **Stellar Testnet Public Key** and click **Fund with Friendbot**.

The backend will call the Friendbot service to create and fund the account.

---

### 2. Check Balance

Click **Get Balance** to retrieve the XLM balance of the account.

---

### 3. Send Payment

Enter:

- Destination Public Key
- Amount (XLM)

Click **Send Payment** to submit a transaction.

The backend builds and signs the transaction using the server account.

---

### 4. Verify Transaction

After sending a payment, the application will return a **transaction hash**.

You can verify the transaction using a Stellar explorer such as:

https://stellar.expert

---

## 🏗 Architecture

The project follows a simple full-stack architecture:

```
User Browser
      ↓
React Frontend
      ↓
Node.js / Express API
      ↓
Stellar Horizon Testnet
```

The backend communicates directly with the Stellar network using the **stellar-sdk**.

---

## 🔮 Future Improvements

Possible improvements include:

- Wallet connection using **Freighter**
- Transaction history visualization
- Multi-asset support
- UI improvements

---

## ❤️ Built for Learning Blockchain Development

This project demonstrates how modern web technologies can integrate with **Stellar blockchain infrastructure** to build decentralized financial applications. 
# Stellar-Nexus
🌌 Stellar Nexus: A premium Stellar Testnet dApp with Glassmorphism UI. Built with React, Node.js, and Stellar SDK for lightning-fast blockchain transactions.
