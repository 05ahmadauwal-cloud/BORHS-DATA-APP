# BORHS Data — Enterprise VTU & Data Reselling Platform

A production-ready, full-stack VTU (Virtual Top-Up) and bills payment platform built for the Nigerian market.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Query, Zustand, React Hook Form + Zod |
| Backend | Node.js, Express.js, JWT Auth, Bcrypt |
| Database | MongoDB Atlas (Mongoose) |
| Payments | Paystack, Flutterwave |
| Notifications | Nodemailer (Email), Twilio (SMS + WhatsApp) |
| Deployment | Render (Backend + Frontend), MongoDB Atlas |

---

## Features

### User Roles
- **Super Admin** — Full platform control
- **Admin** — User/transaction/product management
- **Agent** — Discounted purchases + commission earnings
- **Customer** — Standard purchases

### Services
- ✅ Data Purchase (MTN, Airtel, Glo, 9Mobile — SME, Corporate, Gifting, Direct)
- ✅ Airtime Purchase (All networks + Bulk)
- ✅ Electricity Bills (IKEDC, EKEDC, AEDC, KEDCO, JED, PHED)
- ✅ Cable TV (DStv, GOtv, StarTimes)
- ✅ Education PINs (WAEC, NECO, NABTEB, JAMB)

### Financial
- ✅ Wallet system with ledger
- ✅ Paystack & Flutterwave integration
- ✅ Webhook verification
- ✅ Wallet-to-wallet transfer
- ✅ Transaction PIN

### Growth
- ✅ 3-level referral system (5% / 2% / 1%)
- ✅ Agent commission engine
- ✅ KYC verification (Tier 1/2/3)

### Security
- ✅ Helmet, CORS, Rate Limiting
- ✅ XSS, CSRF, HPP protection
- ✅ Input sanitization (mongo-sanitize)
- ✅ Audit logs (auto-expire 90 days)
- ✅ Account lockout after failed logins
- ✅ JWT + Refresh token rotation

---

## Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account
- Paystack/Flutterwave accounts
- Twilio account (for SMS/WhatsApp)
- Gmail or SMTP service (for email)

### 1. Clone & Setup

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Fill in all values in .env

# Frontend
cd ../frontend
npm install
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `backend/.env` with your credentials:

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/borhs_vtu
JWT_SECRET=your_secret
PAYSTACK_SECRET_KEY=sk_live_...
FLUTTERWAVE_SECRET_KEY=FLWSECK_...
SMTP_HOST=smtp.gmail.com
SMTP_USER=you@gmail.com
SMTP_PASS=your_app_password
```

### 3. Seed Database

```bash
cd backend
npm run seed
```

This creates:
- Super Admin: `superadmin@borhsdata.com` / `Admin@1234`
- Admin: `admin@borhsdata.com` / `Admin@1234`
- Agent: `agent@borhsdata.com` / `Agent@1234`
- Customer: `customer@borhsdata.com` / `Customer@1234`

### 4. Run Development Servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Backend runs at `http://localhost:5000`  
Frontend runs at `http://localhost:5173`

---

## API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication
All protected routes require:
```
Authorization: Bearer <accessToken>
```

### Endpoints

#### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login |
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | Get current user |
| POST | `/auth/forgot-password` | Request reset email |
| POST | `/auth/reset-password/:token` | Reset password |
| POST | `/auth/change-password` | Change password |
| GET | `/auth/verify-email/:token` | Verify email |
| POST | `/auth/send-phone-otp` | Send phone OTP |
| POST | `/auth/verify-phone-otp` | Verify phone OTP |

#### Wallet
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/wallet/balance` | Get wallet balance |
| GET | `/wallet/transactions` | Transaction history |
| POST | `/wallet/transfer` | Transfer to another user |
| POST | `/wallet/set-pin` | Set transaction PIN |

#### Payment
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payment/paystack/initialize` | Initialize Paystack payment |
| GET | `/payment/paystack/verify/:ref` | Verify Paystack payment |
| POST | `/payment/flutterwave/initialize` | Initialize Flutterwave |
| POST | `/payment/webhook/paystack` | Paystack webhook |
| POST | `/payment/webhook/flutterwave` | Flutterwave webhook |

#### Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/data/plans` | Get data plans |
| POST | `/data/purchase` | Purchase data |
| GET | `/data/history` | Data purchase history |

#### Airtime
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/airtime/purchase` | Buy airtime |
| POST | `/airtime/purchase/bulk` | Bulk airtime |
| GET | `/airtime/history` | Airtime history |

#### Electricity
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/electricity/verify-meter` | Verify meter |
| POST | `/electricity/purchase` | Buy electricity |
| GET | `/electricity/history` | History |

#### Cable TV
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cable/packages` | Get cable packages |
| POST | `/cable/verify` | Verify smart card |
| POST | `/cable/purchase` | Subscribe |
| GET | `/cable/history` | History |

#### Education
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/education/prices` | Get exam PIN prices |
| POST | `/education/purchase` | Buy exam PINs |
| GET | `/education/history` | History |

#### Admin (requires admin role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/analytics` | Platform analytics |
| GET/PATCH/DELETE | `/admin/users` | User management |
| PATCH | `/admin/users/:id/suspend` | Suspend user |
| PATCH | `/admin/users/:id/activate` | Activate user |
| POST | `/admin/users/:id/adjust-wallet` | Adjust wallet |
| GET | `/admin/transactions` | All transactions |
| PATCH | `/admin/transactions/:id/reverse` | Reverse transaction |
| GET/POST/PATCH/DELETE | `/admin/data-plans` | Data plan management |
| GET/PATCH | `/admin/settings` | Platform settings |

---

## Deployment on Render

### Backend
1. Create a new **Web Service** on Render
2. Connect your GitHub repo
3. Set build command: `npm install`
4. Set start command: `node src/server.js`
5. Add all environment variables from `.env.example`

### Frontend
1. Create a new **Static Site** on Render
2. Set build command: `npm install && npm run build`
3. Set publish directory: `dist`
4. Add environment variables:
   - `VITE_API_URL=https://your-backend.onrender.com/api/v1`

### Paystack Webhook
Set webhook URL in Paystack Dashboard:
```
https://your-backend.onrender.com/api/v1/payment/webhook/paystack
```

### Flutterwave Webhook
Set webhook URL in Flutterwave Dashboard:
```
https://your-backend.onrender.com/api/v1/payment/webhook/flutterwave
```

---

## Folder Structure

```
BORHS DATA APP/
├── backend/
│   ├── src/
│   │   ├── config/         # DB connection, constants
│   │   ├── middleware/      # Auth, error handler, validation, audit
│   │   ├── models/          # All MongoDB schemas
│   │   ├── modules/         # Feature modules (auth, wallet, data, etc.)
│   │   │   ├── auth/
│   │   │   ├── wallet/
│   │   │   ├── payment/
│   │   │   ├── data/
│   │   │   ├── airtime/
│   │   │   ├── electricity/
│   │   │   ├── cable/
│   │   │   ├── education/
│   │   │   ├── agent/
│   │   │   ├── referral/
│   │   │   ├── kyc/
│   │   │   ├── notification/
│   │   │   └── admin/
│   │   ├── routes/          # Route aggregator
│   │   ├── services/        # Email, SMS, VTU providers
│   │   └── utils/           # Helpers, logger, seeder
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/             # Axios instance + all API calls
    │   ├── components/      # Reusable components + layouts
    │   ├── pages/           # All page components
    │   │   ├── public/
    │   │   ├── auth/
    │   │   ├── customer/
    │   │   ├── agent/
    │   │   └── admin/
    │   ├── store/           # Zustand state management
    │   └── utils/
    ├── .env.example
    └── package.json
```

---

## VTU Providers

The platform uses a **provider abstraction pattern** with automatic failover:

1. **VTpass** (Primary)
2. **ClubKonnect** (Fallback)
3. **Recharge and Get Paid** (Fallback)

If the primary provider fails, the system automatically tries the next one.

---

## Security Notes

- Never commit `.env` files to version control
- Use strong JWT secrets (32+ characters) in production
- Enable MongoDB Atlas IP whitelisting
- Set `NODE_ENV=production` on Render
- Configure proper CORS origins for your domain
- Enable Paystack/Flutterwave IP restrictions

---

## Support

- Email: support@borhsdata.com
- Built with ❤️ in Nigeria 🇳🇬
