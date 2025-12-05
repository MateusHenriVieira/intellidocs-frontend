"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { 
  listTenants, 
  createTenant, 
  updateTenantStatus, 
  deleteTenant, 
  getTenantDetails, 
  Tenant, 
  TenantDetails 
} from "@/lib/api";
import { 
  Plus, Building2, CheckCircle2, XCircle, Loader2, 
  Lock, Unlock, Trash2, Eye, Search, MoreHorizontal, DollarSign 
} from "lucide-react";
import { TenantModal } from "@/components/TenantModal";

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([]);
  const [search, setSearch] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  
  // Estado para o Modal de Raio-X (Detalhes)
  const [selectedTenant, setSelectedTenant] = useState<TenantDetails | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [plan, setPlan] = useState("basic");
  const [value, setValue] = useState("1500");

  useEffect(() => {
    loadData();
  }, []);

  // Filtro de busca local
  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    setFilteredTenants(
      tenants.filter(t => 
        t.name.toLowerCase().includes(lowerSearch) || 
        t.cnpj.includes(lowerSearch)
      )
    );
  }, [search, tenants]);

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
      const res = await createTenant({ 
        name, cnpj, plan_type: plan, 
        plan_value: parseFloat(value) 
      });
      alert(`Prefeitura criada com sucesso!\n\nLogin Admin: ${res.generated_login}\nSenha: ${res.generated_password}`);
      setIsModalOpen(false);
      loadData();
      setName(""); setCnpj("");
    } catch (err: any) { 
      alert(err.message); 
    }
  }

  async function toggleStatus(id: number, currentStatus: boolean, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(currentStatus ? "Bloquear acesso desta prefeitura?" : "Reativar acesso?")) return;
    
    setActionLoading(id);
    try {
      await updateTenantStatus(id, !currentStatus);
      loadData();
    } catch (e) { alert("Erro ao atualizar"); }
    finally { setActionLoading(null); }
  }

  async function handleDelete(id: number, name: string, e: React.MouseEvent) {
    e.stopPropagation();
    const confirmMessage = `ATENÇÃO: Você está prestes a excluir a "${name}".\n\nIsso apagará TODOS os usuários, secretarias e documentos vinculados.\n\nTem certeza absoluta?`;
    if (window.confirm(confirmMessage)) {
      setActionLoading(id);
      try {
        await deleteTenant(id);
        loadData();
      } catch (err: any) {
        alert(err.message);
      } finally { setActionLoading(null); }
    }
  }

  // --- ABRE O MODAL DE DETALHES ---
  async function handleSelect(id: number) {
    try {
      const details = await getTenantDetails(id);
      setSelectedTenant(details);
    } catch (e) {
      alert("Erro ao carregar detalhes da prefeitura.");
    }
  }

  return (
    <div className="flex bg-[#F8F9FC] min-h-screen font-sans text-slate-900">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8 lg:p-12">
        <div className="max-w-[1600px] mx-auto">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Gestão de Clientes</h1>
              <p className="text-slate-500">Controle de contratos, status e acesso das prefeituras.</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#0f172a] hover:bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-slate-900/20 hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" /> Cadastrar Prefeitura
            </button>
          </div>

          {/* Barra de Filtro */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-8 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar por nome ou CNPJ..." 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-slate-900/10 focus:bg-white transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="text-xs font-medium text-slate-500 px-2">
              {filteredTenants.length} Registros
            </div>
          </div>

          {/* Tabela */}
          {loading ? (
            <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin mx-auto text-slate-900"/></div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="p-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-8">Entidade</th>
                    <th className="p-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Contrato</th>
                    <th className="p-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status Financeiro</th>
                    <th className="p-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right pr-8">Gerenciar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTenants.map((t) => (
                    <tr 
                      key={t.id} 
                      onClick={() => handleSelect(t.id)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      <td className="p-6 pl-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-lg border border-slate-200 group-hover:bg-white group-hover:shadow-sm transition-all">
                            {t.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-base">{t.name}</p>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">{t.cnpj}</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-6">
                        <div className="flex flex-col gap-1">
                          <span className={`w-fit px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                            t.plan_type === 'enterprise' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                          }`}>
                            {t.plan_type}
                          </span>
                          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                            <DollarSign className="w-3 h-3"/> {t.plan_value?.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                          </span>
                        </div>
                      </td>
                      
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          {t.is_active ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                              <CheckCircle2 className="w-3 h-3"/> Ativo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-100">
                              <XCircle className="w-3 h-3"/> Bloqueado
                            </span>
                          )}
                          {t.payment_status === 'atrasado' && (
                             <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-[10px] font-bold">PENDENTE</span>
                          )}
                        </div>
                      </td>
                      
                      <td className="p-6 text-right pr-8">
                        <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                          {/* Detalhes */}
                          <button 
                            title="Ver Detalhes"
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Bloquear/Desbloquear */}
                          <button 
                            onClick={(e) => toggleStatus(t.id, t.is_active, e)}
                            disabled={actionLoading === t.id}
                            title={t.is_active ? "Bloquear Acesso" : "Liberar Acesso"}
                            className={`p-2 rounded-lg transition-colors ${
                              t.is_active 
                                ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50" 
                                : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                            }`}
                          >
                            {actionLoading === t.id ? <Loader2 className="w-4 h-4 animate-spin"/> : (t.is_active ? <Lock className="w-4 h-4"/> : <Unlock className="w-4 h-4"/>)}
                          </button>
                          
                          {/* Excluir */}
                          <button 
                            onClick={(e) => handleDelete(t.id, t.name, e)}
                            disabled={actionLoading === t.id}
                            title="Excluir Prefeitura"
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            {actionLoading === t.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4"/>}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredTenants.length === 0 && (
                <div className="p-12 text-center text-slate-400 text-sm">
                  Nenhuma prefeitura encontrada.
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal Cadastro */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 border border-slate-200">
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-900 border border-slate-200">
                <Building2 className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Novo Contrato</h2>
              <p className="text-slate-500 text-sm mt-1">Cadastre a prefeitura e configure o plano.</p>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Nome da Entidade</label>
                <input required className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all font-medium" placeholder="Ex: Pref. Municipal de X" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">CNPJ</label>
                <input required className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all font-medium" placeholder="00.000.000/0001-91" value={cnpj} onChange={e => setCnpj(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Plano</label>
                  <select className="w-full p-3 border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium" value={plan} onChange={e => setPlan(e.target.value)}>
                    <option value="basic">Basic</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Valor (R$)</label>
                  <input type="number" className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all font-medium" value={value} onChange={e => setValue(e.target.value)} />
                </div>
              </div>
              
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-bold border border-slate-200 transition-colors text-sm">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg text-sm">Criar Acesso</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalhes (Raio-X) */}
      {selectedTenant && (
        <TenantModal 
          tenant={selectedTenant} 
          onClose={() => setSelectedTenant(null)}
          onUpdate={loadData} 
        />
      )}

    </div>
  );
}