"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { getUserProfile, UserProfile } from "@/lib/api";
import { 
  User, Mail, Briefcase, Building2, Shield, 
  FileText, Layers, Loader2, Lock, LogOut 
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await getUserProfile();
      setProfile(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  // Função para formatar cargos (ex: super_admin -> Super Admin)
  const formatRole = (role: string) => {
    const map: Record<string, string> = {
      super_admin: "Super Administrador",
      admin: "Administrador TI",
      gestor: "Secretário / Gestor",
      consultor: "Consultor",
      alimentador: "Operador de Scanner"
    };
    return map[role] || role;
  };

  // Define cor do badge baseado no cargo
  const getRoleColor = (role: string) => {
    if (role === 'super_admin' || role === 'admin') return 'bg-purple-100 text-purple-700 border-purple-200';
    if (role === 'gestor') return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="flex bg-[#F8F9FC] min-h-screen font-sans text-slate-900">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8 lg:p-12">
        <div className="max-w-4xl mx-auto">
          
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Meu Perfil</h1>
            <p className="text-slate-500">Gerencie suas informações e visualize sua produtividade.</p>
          </header>

          {loading ? (
            <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin mx-auto text-slate-900"/></div>
          ) : profile ? (
            <div className="space-y-6">
              
              {/* CARTÃO PRINCIPAL (HEADER DO PERFIL) */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Avatar Grande */}
                <div className="w-32 h-32 rounded-full bg-slate-900 text-white flex items-center justify-center text-4xl font-bold border-4 border-slate-100 shadow-xl">
                  {profile.full_name.charAt(0).toUpperCase()}
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2 justify-center md:justify-start">
                    <h2 className="text-2xl font-bold text-slate-900">{profile.full_name}</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getRoleColor(profile.role)}`}>
                      {formatRole(profile.role)}
                    </span>
                  </div>
                  
                  <p className="text-slate-500 flex items-center justify-center md:justify-start gap-2 mb-6">
                    <Building2 className="w-4 h-4" /> {profile.tenant_name}
                  </p>

                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <button 
                      onClick={() => router.push("/change-password")}
                      className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-sm"
                    >
                      <Lock className="w-4 h-4" /> Alterar Senha
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="px-4 py-2 bg-red-50 border border-red-100 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Sair
                    </button>
                  </div>
                </div>
              </div>

              {/* GRID DE INFORMAÇÕES E ESTATÍSTICAS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Coluna 1: Detalhes da Conta */}
                <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" /> Detalhes da Conta
                    </h3>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Email Corporativo</label>
                        <div className="flex items-center gap-2 text-slate-700 font-medium p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <Mail className="w-4 h-4 text-slate-400" /> {profile.email}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Departamento / Secretaria</label>
                        <div className="flex items-center gap-2 text-slate-700 font-medium p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <Briefcase className="w-4 h-4 text-slate-400" /> {profile.department}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">ID do Usuário</label>
                        <div className="flex items-center gap-2 text-slate-700 font-mono text-sm p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <Shield className="w-4 h-4 text-slate-400" /> USER-{profile.id.toString().padStart(4, '0')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coluna 2: Produtividade (KPIs) */}
                <div className="md:col-span-1 space-y-6">
                  {/* Card Uploads */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-400 uppercase">Total</span>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900">{profile.stats.documents_uploaded}</h3>
                    <p className="text-sm text-slate-500 mt-1">Documentos enviados</p>
                  </div>

                  {/* Card Páginas */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                        <Layers className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-400 uppercase">Volume</span>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900">{profile.stats.pages_scanned}</h3>
                    <p className="text-sm text-slate-500 mt-1">Páginas digitalizadas</p>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="text-center text-red-500">Erro ao carregar perfil.</div>
          )}
        </div>
      </main>
    </div>
  );
}