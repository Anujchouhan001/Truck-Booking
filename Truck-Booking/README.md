# TruckSuvidha - Truck Booking Platform
[Click here](https://somya-truck-booking.vercel.app/) to visit the site.

A comprehensive logistics platform connecting shippers with transporters across India. Built with React (Vite), Node.js, Express, and MongoDB.

## 🚀 Features

### For Customers
- Post loads with detailed requirements
- View and manage posted loads
- Track order status in real-time
- Secure payment integration with Razorpay

### For Drivers/Transporters
- Browse available loads
- Submit quotes on loads
- Manage assigned orders
- Update delivery status (Picked Up → In Transit → Delivered)

### For Admins/SuperAdmins
- Manage all loads, trucks, and users
- Update order statuses
- Manage social media links
- Edit contact page information (SuperAdmin only)

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, TailwindCSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **Authentication:** JWT, Google OAuth
- **Payments:** Razorpay

## 📦 Project Structure

```
├── frontend/          # React frontend (Vite)
│   ├── src/
│   │   ├── pages/     # Page components
│   │   ├── components/# Reusable components
│   │   ├── auth/      # Authentication context
│   │   └── api/       # API client
│   └── package.json
├── backend/           # Express backend
│   ├── src/
│   │   ├── routes/    # API routes
│   │   ├── controllers/
│   │   ├── models/    # MongoDB models
│   │   └── middleware/
│   └── package.json
├── api/               # Vercel serverless functions
└── package.json       # Root package.json
```

## 🔧 Environment Variables


### Backend (.env)
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:4000
VITE_RAZORPAY_KEY_ID=your_razorpay_key
```

## 🚀 Local Development

1. **Install dependencies:**
```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

2. **Set up environment variables:**
- Create `.env` files in both `frontend/` and `backend/` directories

3. **Run development servers:**
```bash
npm run dev
```

This starts both frontend (port 5173) and backend (port 4000) concurrently.

## 🌐 Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import repository in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

## 📱 User Roles

| Role | Access |
|------|--------|
| Guest | Landing page, Login, Register |
| Customer | Post loads, View own loads, Make payments |
| Driver | Browse loads, Submit quotes, Update delivery status |
| Admin | Manage loads, trucks, users, social media |
| SuperAdmin | All admin features + Edit contact page |

## 📄 License

MIT License

## 👨‍💻 Author

Built with ❤️ for the logistics industry
