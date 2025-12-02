"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Search, UploadCloud, PieChart, Users, Settings, FileText, ChevronRight, LogOut } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Busca Inteligente", href: "/search", icon: Search },
    { label: "Digitalização", href: "/upload", icon: UploadCloud },
    { label: "Analytics & BI", href: "/reports", icon: PieChart },
    { label: "Gestão de Equipe", href: "/users", icon: Users }, 
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-screen flex flex-col fixed left-0 top-0 z-50">
      
      {/* Brand */}
      <div className="h-20 flex items-center px-8 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-2 rounded-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-lg tracking-tight">IntelliDocs</h1>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-8 space-y-1">
        <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Principal</p>
        
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`} />
                {item.label}
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-slate-400" />}
            </Link>
          );
        })}

        <div className="mt-8">
          <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Sistema</p>
          <Link href="/admin/tenants" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all">
            <Settings className="w-5 h-5 text-slate-400" />
            Configurações
          </Link>
        </div>
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-100">
        <button className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-slate-50 transition-colors text-left">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 font-bold border-2 border-white shadow-sm">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">João da Silva</p>
            <p className="text-xs text-slate-500 truncate">Prefeitura Demo</p>
          </div>
          <LogOut className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </aside>
  );
}