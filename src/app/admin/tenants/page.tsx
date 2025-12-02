"use client";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
// IMPORTANTE: Adicione deleteTenant aqui
import { listTenants, createTenant, updateTenantStatus, deleteTenant, Tenant } from "@/lib/api";
// IMPORTANTE: Adicione Trash2 aqui
import { Plus, Building2, CheckCircle, XCircle, Loader2, Lock, Trash2 } from "lucide-react";

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [plan, setPlan] = useState("basic");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await listTenants();
      setTenants(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await createTenant(name, cnpj, plan);
      alert(`Prefeitura criada!\nLogin Admin: ${res.generated_login}`);
      setIsModalOpen(false);
      loadData();
      setName(""); setCnpj("");
    } catch (err: any) { alert(err.message); }
  }

  async function toggleStatus(id: number, currentStatus: boolean) {
    try {
      await updateTenantStatus(id, !currentStatus);
      loadData();
    } catch (e) { alert("Erro ao atualizar"); }
  }

  // --- NOVA FUNÇÃO DE DELETAR ---
  async function handleDelete(id: number, name: string) {
    const confirmMessage = `ATENÇÃO: Você está prestes a excluir a "${name}".\n\nIsso apagará TODOS os usuários e documentos desta prefeitura.\n\nTem certeza absoluta?`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await deleteTenant(id);
        loadData(); // Recarrega a lista
      } catch (err: any) {
        alert(err.message);
      }
    }
  }
  // ------------------------------

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gestão de Clientes</h1>
            <p className="text-slate-500">Administração de Prefeituras e Contratos.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-200"
          >
            <Plus className="w-5 h-5" /> Nova Prefeitura
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600"/></div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-6 text-sm font-semibold text-slate-500">Nome da Entidade</th>
                  <th className="p-6 text-sm font-semibold text-slate-500">CNPJ (Login)</th>
                  <th className="p-6 text-sm font-semibold text-slate-500">Plano</th>
                  <th className="p-6 text-sm font-semibold text-slate-500">Status</th>
                  <th className="p-6 text-sm font-semibold text-slate-500 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-6 font-medium text-slate-900 flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500"><Building2 className="w-5 h-5" /></div>
                      {t.name}
                    </td>
                    <td className="p-6 text-slate-600 font-mono text-sm">{t.cnpj}</td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${t.plan_type === 'enterprise' ? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                        {t.plan_type}
                      </span>
                    </td>
                    <td className="p-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${t.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {t.is_active ? <CheckCircle className="w-3 h-3"/> : <XCircle className="w-3 h-3"/>}
                        {t.is_active ? "Ativo" : "Bloqueado"}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => toggleStatus(t.id, t.is_active)}
                          className={`text-xs font-bold px-3 py-2 rounded-lg border transition-colors flex items-center gap-1 ${t.is_active ? 'border-orange-200 text-orange-600 hover:bg-orange-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}
                        >
                          {t.is_active ? <><Lock className="w-3 h-3"/> Bloquear</> : <><CheckCircle className="w-3 h-3"/> Ativar</>}
                        </button>
                        
                        {/* BOTÃO DE EXCLUIR */}
                        <button 
                          onClick={() => handleDelete(t.id, t.name)}
                          className="text-xs font-bold px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors flex items-center gap-1"
                          title="Excluir Prefeitura"
                        >
                          <Trash2 className="w-3 h-3" /> Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modal de Cadastro (Mantido igual) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-1 text-slate-900">Cadastrar Nova Prefeitura</h2>
            <p className="text-slate-500 text-sm mb-6">Um admin será criado automaticamente.</p>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Entidade</label>
                <input required className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Pref. Municipal de X" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">CNPJ (Será o Login e Senha)</label>
                <input required className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="00.000.000/0001-91" value={cnpj} onChange={e => setCnpj(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Plano de Contrato</label>
                <select className="w-full p-3 border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500" value={plan} onChange={e => setPlan(e.target.value)}>
                  <option value="basic">Básico (Lite)</option>
                  <option value="pro">Profissional (Standard)</option>
                  <option value="enterprise">Enterprise (Governo)</option>
                </select>
              </div>
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium border border-slate-200">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200">Criar Acesso</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}