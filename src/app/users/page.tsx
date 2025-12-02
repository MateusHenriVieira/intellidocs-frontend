"use client";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { listCompanyUsers, createCompanyUser, deleteCompanyUser, User } from "@/lib/api";
import { Plus, User as UserIcon, Trash2, Loader2, Shield, Users as UsersIcon } from "lucide-react";

export default function TeamPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("Geral");
  const [role, setRole] = useState("consultor");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await listCompanyUsers();
      setUsers(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createCompanyUser({ full_name: name, email, password, department, role });
      alert("Usuário criado com sucesso!");
      setIsModalOpen(false);
      loadData();
      setName(""); setEmail(""); setPassword("");
    } catch (err: any) { alert(err.message); }
  }

  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja remover este usuário?")) return;
    try {
      await deleteCompanyUser(id);
      loadData();
    } catch (e) { alert("Erro ao deletar"); }
  }

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gestão de Equipe</h1>
            <p className="text-slate-500">Cadastre secretários e operadores da prefeitura.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-200"
          >
            <Plus className="w-5 h-5" /> Novo Usuário
          </button>
        </div>

        {loading ? <div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600"/></div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((u) => (
              <div key={u.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-lg">
                    {u.full_name.charAt(0)}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                    {u.role}
                  </span>
                </div>
                
                <h3 className="font-bold text-slate-900 text-lg truncate">{u.full_name}</h3>
                <p className="text-slate-500 text-sm mb-4">{u.email}</p>
                
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-6 bg-slate-50 p-2 rounded-lg">
                  <Shield className="w-3 h-3" /> Depto: <span className="font-medium text-slate-600">{u.department}</span>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-xs text-slate-400">Produtividade: <b>{u.pages_scanned_count}</b> págs</span>
                  {u.role !== 'admin' && (
                    <button onClick={() => handleDelete(u.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <UsersIcon className="w-6 h-6 text-blue-600"/> Cadastrar Colaborador
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                <input required className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Corporativo</label>
                <input type="email" required className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Departamento</label>
                  <select className="w-full p-3 border rounded-xl bg-white" value={department} onChange={e => setDepartment(e.target.value)}>
                    <option value="Geral">Geral</option>
                    <option value="Saúde">Saúde</option>
                    <option value="Educação">Educação</option>
                    <option value="Obras">Obras</option>
                    <option value="Finanças">Finanças</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Permissão</label>
                  <select className="w-full p-3 border rounded-xl bg-white" value={role} onChange={e => setRole(e.target.value)}>
                    <option value="consultor">Consultor (Apenas Lê)</option>
                    <option value="alimentador">Alimentador (Upload)</option>
                    <option value="gestor">Gestor (Total Setor)</option>
                    <option value="admin">Admin TI</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Senha Inicial</label>
                <input type="password" required className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-600 hover:bg-slate-100 rounded-xl font-medium">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}