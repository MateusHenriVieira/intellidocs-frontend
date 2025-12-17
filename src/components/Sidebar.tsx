"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Search, UploadCloud, PieChart, Users, 
  Settings, FileText, ChevronRight, LogOut, Building2, 
  FolderOpen, Bell, Shield // <--- Shield icon
} from "lucide-react";
import { useEffect, useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem("user_role"));
    setUserName(localStorage.getItem("user_name"));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const isAlimentador = role === "alimentador";
  const isConsultor = role === "consultor";
  const isAdmin = role === "admin" || role === "super_admin";
  const isGestor = role === "gestor";
  const canSeeAudit = isAdmin || isGestor;

  const menuItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard, visible: true },
    { label: "Busca Inteligente", href: "/search", icon: Search, visible: !isAlimentador },
    { label: "Meus Arquivos", href: "/documents", icon: FolderOpen, visible: true },
    { label: "Digitalização", href: "/upload", icon: UploadCloud, visible: !isConsultor },
    { label: "Analytics & BI", href: "/reports", icon: PieChart, visible: !isAlimentador },
    { label: "Gestão de Equipe", href: "/users", icon: Users, visible: isAdmin || isGestor }, 
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-screen flex flex-col fixed left-0 top-0 z-50">
      <div className="h-20 flex items-center px-8 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-2 rounded-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div><h1 className="font-bold text-slate-900 text-lg">IntelliDocs</h1></div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto">
        <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Principal</p>
        
        {menuItems.map((item) => {
          if (!item.visible) return null;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={`group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50"}`}>
              <div className="flex items-center gap-3"><item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`} />{item.label}</div>
              {isActive && <ChevronRight className="w-4 h-4 text-slate-400" />}
            </Link>
          );
        })}

        {canSeeAudit && (
          <div className="mt-8">
            <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Compliance</p>
            
            <Link href="/admin/audit" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname === '/admin/audit' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
              <Shield className="w-5 h-5 text-slate-400" /> Auditoria
            </Link>

            {isAdmin && (
               <Link href="/admin/departments" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname === '/admin/departments' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                 <Building2 className="w-5 h-5 text-slate-400" /> Secretarias
               </Link>
            )}

            {role === "super_admin" && (
              <>
                <Link href="/admin/tenants" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname === '/admin/tenants' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                  <Settings className="w-5 h-5 text-slate-400" /> Prefeituras
                </Link>
                <Link href="/admin/notifications" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname === '/admin/notifications' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                  <Bell className="w-5 h-5 text-slate-400" /> Comunicação
                </Link>
              </>
            )}
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <Link href="/profile" className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-slate-50 transition-colors group">
          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">{userName?.charAt(0).toUpperCase()}</div>
          <div className="flex-1 min-w-0"><p className="text-sm font-bold text-slate-900 truncate">{userName}</p><p className="text-xs text-slate-500">Ver Perfil</p></div>
          <LogOut onClick={(e) => {e.preventDefault(); handleLogout();}} className="w-4 h-4 text-slate-400 hover:text-red-500" />
        </Link>
      </div>
    </aside>
  );
}