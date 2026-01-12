"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { 
  listCompanyUsers, 
  createCompanyUser, 
  deleteCompanyUser, 
  listDepartments, 
  getUserProfile, 
  User, 
  Department, 
  UserProfile 
} from "@/lib/api";
import { 
  Plus, 
  Trash2, 
  Loader2, 
  Users as UsersIcon, 
  Briefcase, 
  Lock, 
  Shield, 
  Mail, 
  User as UserIcon 
} from "lucide-react";

export default function TeamPage() {
  const router = useRouter();
  
  // Estados de Dados
  const [users, setUsers] = useState<User[]>([]);
  const [depts, setDepts] = useState<Department[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  
  // Estados de Interface
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulário
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("Geral");
  const [role, setRole] = useState("consultor");

  // --- INICIALIZAÇÃO E SEGURANÇA ---
  useEffect(() => {
    const role = localStorage.getItem("user_role");
    
    // Regra de Segurança: Consultores e Alimentadores não gerenciam equipe
    if (!role) {
      router.push("/login");
    } else if (role === "consultor" || role === "alimentador") {
      router.push("/");
       alert("Acesso Negado: Você não tem permissão para gerenciar equipe."); // Opcional
    } else {
      initData();
    }
  }, []);

  async function initData() {
    try {
      const [profileData, usersData, deptsData] = await Promise.all([
        getUserProfile(),
        listCompanyUsers(),
        listDepartments()
      ]);
      
      setCurrentUser(profileData);
      setUsers(usersData);
      setDepts(deptsData);
      
      // Se for Gestor, fixa o departamento dele no formulário automaticamente
      if (profileData.role === 'gestor') {
        setDepartment(profileData.department);
      }
      
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  }

  // --- AÇÕES ---

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createCompanyUser({ full_name: name, email, password, department, role });
      alert("Usuário criado com sucesso!");
      setIsModalOpen(false);
      
      // Recarrega a lista para mostrar o novo usuário
      const updatedUsers = await listCompanyUsers();
      setUsers(updatedUsers);
      
      // Limpa o form
      setName(""); setEmail(""); setPassword("");
      // Reseta role padrão, mas mantém departamento se for gestor
      setRole("consultor");
      if (currentUser?.role !== 'gestor') setDepartment("Geral");

    } catch (err: any) { 
      alert(err.message || "Erro ao criar usuário"); 
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja remover este usuário? Essa ação não pode ser desfeita.")) return;
    try {
      await deleteCompanyUser(id);
      // Atualiza a lista localmente filtrando o ID removido (mais rápido que recarregar tudo)
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (e) { 
      alert("Erro ao deletar usuário."); 
    }
  }

  // Helpers de Permissão
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';
  const isGestor = currentUser?.role === 'gestor';

  return (
    <div className="flex bg-[#F8F9FC] min-h-screen font-sans text-slate-900">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8 lg:p-12">
        <div className="max-w-7xl mx-auto">
          
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-10 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-1">Gestão de Equipe</h1>
              <p className="text-slate-500">
                {isAdmin 
                  ? "Administre o acesso de todos os colaboradores da prefeitura." 
                  : `Gerencie a equipe vinculada à secretaria: ${currentUser?.department}`}
              </p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#0f172a] hover:bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-slate-900/20 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="w-5 h-5" /> Novo Membro
            </button>
          </div>

          {/* CONTEÚDO */}
          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="w-10 h-10 animate-spin mx-auto text-slate-900 mb-4"/>
              <p className="text-slate-500 font-medium">Carregando equipe...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
              <UsersIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-700">Nenhum membro encontrado</h3>
              <p className="text-slate-500 text-sm">Clique em "Novo Membro" para adicionar alguém.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((u) => (
                <div key={u.id} className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group">
                  
                  {/* Header do Card */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-600 font-bold text-lg border border-slate-100 shadow-sm">
                      {u.full_name.charAt(0).toUpperCase()}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      u.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-100' : 
                      u.role === 'gestor' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {u.role}
                    </span>
                  </div>
                  
                  {/* Dados do Usuário */}
                  <div className="mb-6">
                    <h3 className="font-bold text-slate-900 text-lg truncate mb-1" title={u.full_name}>{u.full_name}</h3>
                    <div className="flex items-center gap-2 text-slate-400 text-sm truncate" title={u.email}>
                      <Mail className="w-3.5 h-3.5" /> {u.email}
                    </div>
                  </div>
                  
                  {/* Secretaria */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="p-1.5 bg-white rounded-md shadow-sm border border-slate-100">
                      <Briefcase className="w-3.5 h-3.5 text-blue-600" /> 
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Secretaria</p>
                      <p className="font-semibold text-slate-700">{u.department}</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <div className="text-xs">
                      <span className="text-slate-400">Produtividade:</span>
                      <div className="font-bold text-slate-900 text-sm">{u.pages_scanned_count} <span className="text-[10px] font-normal text-slate-400">págs</span></div>
                    </div>
                    
                    {/* Só pode excluir se não for ele mesmo */}
                    {u.id !== currentUser?.id && (
                      <button 
                        onClick={() => handleDelete(u.id)} 
                        className="text-slate-300 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remover Usuário"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* MODAL DE CADASTRO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200">
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900">
                <div className="p-2 bg-slate-100 rounded-lg"><UsersIcon className="w-5 h-5 text-slate-700"/></div>
                Cadastrar Membro
              </h2>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Nome Completo</label>
                <div className="relative group">
                  <UserIcon className="absolute left-3 top-3 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input required className="w-full pl-10 p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all text-sm font-medium" placeholder="Ex: Maria da Silva" value={name} onChange={e => setName(e.target.value)} />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Email Corporativo</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input type="email" required className="w-full pl-10 p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all text-sm font-medium" placeholder="maria@prefeitura.gov.br" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                
                {/* CAMPO SECRETARIA (Inteligente) */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Secretaria</label>
                  {isAdmin ? (
                    <select 
                      className="w-full p-3 border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-slate-900/10 transition-all text-sm font-medium cursor-pointer" 
                      value={department} 
                      onChange={e => setDepartment(e.target.value)}
                    >
                      <option value="Geral">Geral</option>
                      {depts.map(d => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  ) : (
                    // Se for gestor, mostra travado
                    <div className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 flex items-center gap-2 cursor-not-allowed select-none">
                      <Lock className="w-3 h-3"/> {currentUser?.department}
                    </div>
                  )}
                </div>

                {/* CAMPO PERMISSÃO */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Permissão</label>
                  <select 
                    className="w-full p-3 border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-slate-900/10 transition-all text-sm font-medium cursor-pointer" 
                    value={role} 
                    onChange={e => setRole(e.target.value)}
                  >
                    <option value="consultor">Consultor</option>
                    <option value="alimentador">Alimentador</option>
                    {/* Apenas Admins podem criar Gestores ou outros Admins */}
                    {isAdmin && <option value="gestor">Gestor</option>}
                    {isAdmin && <option value="admin">Admin TI</option>}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Senha Inicial</label>
                <div className="relative group">
                  <Shield className="absolute left-3 top-3 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input type="password" required className="w-full pl-10 p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all text-sm font-medium" placeholder="••••••" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-bold border border-slate-200 transition-colors text-sm">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg text-sm flex justify-center items-center gap-2 disabled:opacity-70">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar Membro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}