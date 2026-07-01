import { Link } from "react-router-dom";
import { LayoutDashboard, Package, Users, ShoppingCart, BarChart3 } from "lucide-react";

export default function MainLayout({ children }) {
  const menu = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Products", icon: Package, path: "/products" },
    { name: "Suppliers", icon: Users, path: "/suppliers" },
    { name: "Orders", icon: ShoppingCart, path: "/orders" },
    { name: "Analytics", icon: BarChart3, path: "/analytics" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">

      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 text-xl font-bold border-b border-slate-700">
          StockerAI
        </div>

        <nav className="p-4 space-y-2">
          {menu.map((item, i) => {
            const Icon = item.icon;
            return (
              <Link
                key={i}
                to={item.path}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700"
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right Side */}
      <div className="flex-1 flex flex-col">

        {/* Navbar */}
        <div className="bg-white px-6 py-4 shadow flex justify-between">
          <h1 className="font-semibold text-lg">Dashboard</h1>

          <input
            className="border px-3 py-1 rounded"
            placeholder="Search..."
          />
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>

      </div>
    </div>
  );
}