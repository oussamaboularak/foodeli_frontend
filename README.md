# Foodeli Frontend

A modern, responsive food delivery platform frontend built with React and Tailwind CSS.

## 🚀 Features

- **Multi-Role Authentication**: Secure login and registration for Clients, Drivers, Restaurant Owners, and Admins.
- **Dynamic Dashboard**: Personalized views and navigation based on user roles.
- **Restaurant Management**: Browsing restaurants, menus, and placing orders.
- **Order Tracking**: Real-time status updates and order history.
- **Modern UI/UX**: Built with Tailwind CSS 4, Radix UI, and Lucide icons for a premium feel.
- **API Integration**: Robust communication with the backend using Axios and JWT authentication.

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Routing**: [React Router 7](https://reactrouter.com/)
- **State & Logic**: Axios, JWT-Decode, React Context API.
- **Icons**: [Lucide React](https://lucide.dev/)

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/oussamaboularak/foodeli_frontend.git
   cd foodeli_frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Proxy Configuration
The development server is configured to proxy API requests to `http://127.0.0.1:3000`. Ensure your backend is running on this address, or update `vite.config.ts`.

## 📂 Project Structure

- `src/api`: Axios client and API endpoint hooks.
- `src/components`: Reusable UI components (Layout, UI primitives).
- `src/contexts`: Authentication and global state management.
- `src/pages`: Main application views (Dashboard, Login, Restaurants, etc.).
- `src/types`: TypeScript interfaces for auth, menu, orders, and users.

## 📝 License

This project is for demonstration purposes part of the Foodeli platform.
