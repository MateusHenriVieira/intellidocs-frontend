"use client";
import { useState } from "react";
import { X, Building2, HardDrive, FileText, Users, Layers, Crown, Activity, Save, Loader2 } from "lucide-react";
import { TenantDetails, updateTenantStatus } from "@/lib/api";

interface Props {
  tenant: TenantDetails;
  onClose: () => void;
  onUpdate: () => void; // Callback para recarregar a lista pai
}

export function TenantModal({ tenant, onClose, onUpdate }: Props) {
  const [activeTab, setActiveTab] = useState<"overview" | "depts" | "users">("overview");
  const [plan, setPlan] = useState(tenant.plan_type);
  const [saving, setSaving] = useState(false);

  // Função para salvar alteração de plano
  const handleSavePlan = async () => {
    setSaving(true);
    try {
      await updateTenantStatus(tenant.id, tenant.is_active); // Mantém status, na vdd precisariamos passar o plano.
      // O updateTenantStatus no api.ts precisa ser capaz de passar o plano.
      // Vamos assumir que você atualizou o api.ts para aceitar { plan_type: plan } no body.
      
      // WORKAROUND RÁPIDO: Vamos chamar o fetch direto aqui ou atualizar a função updateTenantStatus
      // Para não quebrar o contrato agora, vou fazer um fetch manual aqui:
      await fetch(`http://149.56.128.99:8000/admin/tenants/${tenant.id}`, {
        method: "PATCH",
        headers: { 
           "Content-Type": "application/json", 
           "Authorization": `Bearer ${localStorage.getItem("token")}` 
        },
        body: JSON.stringify({ plan_type: plan })
      });

      alert("Plano atualizado com sucesso!");
      onUpdate();
    } catch (e) {
      alert("Erro ao atualizar plano.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-200 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{tenant.name}</h2>
              <p className="text-slate-500 text-sm font-mono mt-1">CNPJ: {tenant.cnpj}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-900">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-8 bg-white">
          {[
            { id: "overview", label: "Visão Geral", icon: Activity },
            { id: "depts", label: "Secretarias & Consumo", icon: Layers },
            { id: "users", label: "Usuários Cadastrados", icon: Users },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? "border-blue-600 text-blue-600" 
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#F8F9FC]">
          
          {/* TAB 1: VISÃO GERAL */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              
              {/* KPIs */}
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between mb-2"><span className="text-xs font-bold text-slate-400 uppercase">Armazenamento</span><HardDrive className="w-5 h-5 text-blue-500"/></div>
                  <div className="text-2xl font-bold text-slate-900">{tenant.total_storage_gb.toFixed(2)} GB</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between mb-2"><span className="text-xs font-bold text-slate-400 uppercase">Documentos</span><FileText className="w-5 h-5 text-purple-500"/></div>
                  <div className="text-2xl font-bold text-slate-900">{tenant.total_docs}</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between mb-2"><span className="text-xs font-bold text-slate-400 uppercase">Páginas</span><Layers className="w-5 h-5 text-emerald-500"/></div>
                  <div className="text-2xl font-bold text-slate-900">{tenant.total_pages}</div>
                </div>
              </div>

              {/* Gestão de Plano */}
              <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><Crown className="w-5 h-5 text-amber-500"/> Plano de Contrato</h3>
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Plano Atual</label>
                    <select 
                      value={plan} 
                      onChange={(e) => setPlan(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                      <option value="basic">Básico (Lite)</option>
                      <option value="pro">Profissional (Standard)</option>
                      <option value="enterprise">Enterprise (Governo)</option>
                    </select>
                  </div>
                  <button 
                    onClick={handleSavePlan}
                    disabled={saving}
                    className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all flex items-center gap-2 disabled:opacity-70"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}
                    Salvar Alteração
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SECRETARIAS */}
          {activeTab === "depts" && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-4 font-semibold text-slate-600">Departamento</th>
                    <th className="p-4 font-semibold text-slate-600 text-right">Docs</th>
                    <th className="p-4 font-semibold text-slate-600 text-right">Páginas</th>
                    <th className="p-4 font-semibold text-slate-600 text-right">Uso (MB)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tenant.departments.map((d, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-4 font-medium text-slate-900">{d.name}</td>
                      <td className="p-4 text-right text-slate-600">{d.doc_count}</td>
                      <td className="p-4 text-right text-slate-600">{d.page_count}</td>
                      <td className="p-4 text-right font-mono text-blue-600 font-bold">{d.storage_mb.toFixed(1)} MB</td>
                    </tr>
                  ))}
                  {tenant.departments.length === 0 && (
                    <tr><td colSpan={4} className="p-8 text-center text-slate-400">Nenhum departamento com dados.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: USUÁRIOS */}
          {activeTab === "users" && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-4 font-semibold text-slate-600">Nome</th>
                    <th className="p-4 font-semibold text-slate-600">Email</th>
                    <th className="p-4 font-semibold text-slate-600">Cargo</th>
                    <th className="p-4 font-semibold text-slate-600">Secretaria</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tenant.users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="p-4 font-medium text-slate-900">{u.name}</td>
                      <td className="p-4 text-slate-500">{u.email}</td>
                      <td className="p-4"><span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold uppercase">{u.role}</span></td>
                      <td className="p-4 text-slate-700">{u.department}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}