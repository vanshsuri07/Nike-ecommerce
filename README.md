# 🏷️ Nike E-Commerce AI Platform 👟



AI-powered e-commerce platform for Nike sneakers — built with **Next.js 15**, **Stripe**, and **Neon Database**, featuring **AI-driven product generation**.
<p align="center">
  <img src="https://github.com/vanshsuri07/Nike-ecommerce/blob/main/public/Screenshot1.png" width="65%" />
   &nbsp;&nbsp;&nbsp;
  <img src="https://github.com/vanshsuri07/Nike-ecommerce/blob/main/public/screenshothome.png" width="20%" />
</p>

---

## 🚀 Live Demo  
👉 [Click here to try it out](https://nike-ecommerce-five.vercel.app/)

---

## ✨ Features

- 🛍️ **Product Catalog** – Browse Nike sneakers with dynamic product pages  
- 🛒 **Shopping Cart & Checkout** – Seamless add-to-cart and secure checkout with Stripe  
- 🔑 **Authentication** – User accounts powered by `better-auth`  
- 📧 **Email Integration** – Order confirmations via React Email + Nodemailer  
- 🖼️ **3D Product Previews** – Enhanced visuals with React Three Fiber + Drei  
- ⚡ **AI-Powered Product Creation** – Add a shoe name + image, AI auto-generates description, price, tags & more  
- 📊 **Admin Tools** – Manage products, sizes, and inventory via Drizzle ORM scripts  

---

## 🛠️ Tech Stack

**Frontend:** Next.js 15, React 19, Tailwind CSS 4, Framer Motion, Zustand  
**Backend:** Drizzle ORM, Neon (Postgres), Node.js  
**AI:** Google Generative AI (`@google/generative-ai`)  
**Payments:** Stripe  
**Auth & Email:** better-auth, React Email, Nodemailer  
**3D/Graphics:** React Three Fiber, Drei, Maath  
**Validation:** Zod, Drizzle-Zod  

---

## 🚀 Getting Started

### 1. Clone the repository
```
git clone https://github.com/vanshsuri07/Nike-ecommerce.git
cd nike-ecommerce
```

### 2. Install dependencies
```
npm install
```

### 3. Set up environment variables
```
DATABASE_URL
BETTER_AUTH_SECRET
BETTER_AUTH_URL
STRIPE_SECRET_KEY
GMAIL_EMAIL
GMAIL_APP_PASSWORD
```

### 4. Run the development server
```
npm run dev
```

## 🗄️ Database Management

- 📦 Generate schema: npm run db:generate

- 🔄 Run migrations: npm run db:migrate

- 🌱 Seed data: npm run db:seed

- 🗑️ Drop database: npm run db:drop



## 🤖 AI Product Generator

Easily create products with AI:
```
npm run ai:upload
```

Just provide a shoe name + image, and the AI generates:

- ✅ Product description

- ✅ Pricing

- ✅ Tags & metadata

- ✅ Inventory sizes


## 📸 Screenshots

### 👤 Auth Page
<p align="center">
  <img src="https://github.com/vanshsuri07/Nike-ecommerce/blob/main/public/screenshot-sign.png" width="600"/>
</p>

### 🛒 Cart Page
<p align="center">
  <img src="https://github.com/vanshsuri07/Nike-ecommerce/blob/main/public/screenshotcart.png" width="600"/>
</p>

### 🤖 AI Product Generator
<p align="center">
  <img src="https://github.com/vanshsuri07/Nike-ecommerce/blob/main/public/screenshotai.png" width="600"/>
</p>


 ## 📜 License

This project is licensed under the MIT License – feel free to use and modify.

