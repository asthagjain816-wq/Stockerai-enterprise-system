import React from 'react';
import { Package, LayoutDashboard, Users, ShoppingCart, BarChart3 } from 'lucide-react';

export default function MainLayout({ children }) {
  const menu = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Inventory", icon: Package, path: "/inventory" },
    { name: "Suppliers", icon: Users, path: "/suppliers" },
    { name: "Orders", icon: ShoppingCart, path: "/orders" },
    { name: "Analytics", icon: BarChart3, path: "/analytics" },
  ];

  return (
    <div className="flex min-h-screen">
      {children}
    </div>
  );
}