"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Search, UploadCloud, PieChart, Users, 
  Settings, FileText, ChevronRight, LogOut, Building2, 
  FolderOpen, Bell 
} from "lucide-react";
import { useEffect, useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    // Carrega dados do usuário (Client-side)
    setRole(localStorage.getItem("user_role"));
    setUserName(localStorage.getItem("user_name"));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  // Helpers de Permissão
  const isAlimentador = role === "alimentador";
  const isConsultor = role === "consultor";
  const isAdmin = role === "admin" || role === "super_admin";
  const isGestor = role === "gestor";
  const canManageTeam = isAdmin || isGestor; // Gestor e Admin gerenciam equipe

  const menuItems = [
    { 
      label: "Dashboard", 
      href: "/", 
      icon: LayoutDashboard, 
      visible: true 
    },
    { 
      label: "Busca Inteligente", 
      href: "/search", 
      icon: Search, 
      visible: !isAlimentador // Alimentador não busca
    },
    { 
      label: "Meus Arquivos", 
      href: "/documents", 
      icon: FolderOpen, 
      visible: true 
    },
    { 
      label: "Digitalização", 
      href: "/upload", 
      icon: UploadCloud, 
      visible: !isConsultor // Consultor não sobe arquivos
    },
    { 
      label: "Analytics & BI", 
      href: "/reports", 
      icon: PieChart, 
      visible: !isAlimentador // Alimentador não vê BI
    },
    { 
      label: "Gestão de Equipe", 
      href: "/users", 
      icon: Users, 
      visible: canManageTeam // Apenas Gestor e Admin
    }, 
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

      {/* Menu Principal */}
      <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto">
        <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Principal</p>
        
        {menuItems.map((item) => {
          if (!item.visible) return null;
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

        {/* Menu Administrativo */}
        {isAdmin && (
          <div className="mt-8">
            <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Configurações</p>
            
            {/* Secretarias (Admin e Super Admin) */}
            <Link href="/admin/departments" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname === '/admin/departments' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
              <Building2 className="w-5 h-5 text-slate-400" />
              Secretarias
            </Link>

            {/* Prefeituras e Notificações (Apenas Super Admin) */}
            {role === "super_admin" && (
              <>
                <Link href="/admin/tenants" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname === '/admin/tenants' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                  <Settings className="w-5 h-5 text-slate-400" />
                  Prefeituras
                </Link>
                <Link href="/admin/notifications" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname === '/admin/notifications' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                  <Bell className="w-5 h-5 text-slate-400" />
                  Comunicação
                </Link>
              </>
            )}
          </div>
        )}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-100">
        <Link 
          href="/profile" 
          className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-slate-50 transition-colors text-left group border border-transparent hover:border-slate-200"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 font-bold border-2 border-white shadow-sm">
            {userName?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
              {userName || "Usuário"}
            </p>
            <p className="text-xs text-slate-500 truncate font-medium uppercase tracking-wide">
              Ver Perfil
            </p>
          </div>
          <LogOut 
            onClick={(e) => {
              e.preventDefault(); // Evita abrir o perfil ao clicar no ícone de sair
              handleLogout();
            }}
            className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors cursor-pointer" 
          />
        </Link>
      </div>
    </aside>
  );
}