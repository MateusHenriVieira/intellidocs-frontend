"use client";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { listDepartments, createDepartment, deleteDepartment, Department } from "@/lib/api";
import { Plus, Building2, Trash2, Loader2, User, Mail, Lock } from "lucide-react";

export default function DepartmentsPage() {
  const [depts, setDepts] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [respName, setRespName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const data = await listDepartments();
    setDepts(data);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createDepartment({ 
        name, 
        responsible_name: respName, 
        email, 
        password 
      });
      alert("Secretaria e Gestor criados com sucesso!");
      setIsModalOpen(false);
      loadData();
      // Limpa form
      setName(""); setRespName(""); setEmail(""); setPassword("");
    } catch (e: any) { alert(e.message); }
  }

  async function handleDelete(id: number) {
    if (confirm("Tem certeza? Isso não apaga os documentos, mas remove a secretaria da lista.")) {
      await deleteDepartment(id);
      loadData();
    }
  }

  return (
    <div className="flex bg-[#F8F9FC] min-h-screen font-sans text-slate-900">
      <Sidebar />
      <main className="flex-1 ml-64 p-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Estrutura Organizacional</h1>
            <p className="text-slate-500">Gerencie as secretarias e seus respectivos gestores.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-slate-900/20"
          >
            <Plus className="w-5 h-5" /> Nova Secretaria
          </button>
        </div>

        {loading ? <div className="p-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-900"/></div> : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider pl-6">Departamento</th>
                  <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Acesso</th>
                  <th className="p-5 text-right pr-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {depts.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-5 pl-6 font-medium text-slate-700 flex items-center gap-3">
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
                        <Building2 className="w-5 h-5"/>
                      </div>
                      <span className="text-base">{d.name}</span>
                    </td>
                    <td className="p-5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        Restrito: {d.name}
                      </span>
                    </td>
                    <td className="p-5 text-right pr-6">
                      <button 
                        onClick={() => handleDelete(d.id)} 
                        className="text-slate-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remover Secretaria"
                      >
                        <Trash2 className="w-5 h-5"/>
                      </button>
                    </td>
                  </tr>
                ))}
                {depts.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-10 text-center text-slate-400">
                      Nenhuma secretaria cadastrada. Clique em "Nova Secretaria" para começar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* MODAL DE CADASTRO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200">
            
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-900 border border-slate-200">
                <Building2 className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Cadastrar Secretaria</h2>
              <p className="text-slate-500 text-sm mt-1">Crie o departamento e defina o gestor responsável.</p>
            </div>

            <form onSubmit={handleCreate} className="space-y-5">
              
              {/* Nome da Secretaria */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Nome do Departamento</label>
                <input 
                  required 
                  className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all font-medium" 
                  placeholder="Ex: Secretaria de Saúde"
                  value={name} onChange={e => setName(e.target.value)}
                />
              </div>

              <div className="border-t border-slate-100 my-4 pt-4">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <User className="w-3 h-3" /> Dados do Secretário/Gestor
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Responsável</label>
                    <input 
                      required 
                      className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 transition-all" 
                      placeholder="Nome Completo"
                      value={respName} onChange={e => setRespName(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email de Acesso</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input 
                          type="email" required 
                          className="w-full pl-10 p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 transition-all text-sm" 
                          placeholder="email@gov.br"
                          value={email} onChange={e => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Senha Inicial</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input 
                          type="password" required 
                          className="w-full pl-10 p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 transition-all text-sm" 
                          placeholder="••••••"
                          value={password} onChange={e => setPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-bold border border-slate-200 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg">Criar Acesso</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}