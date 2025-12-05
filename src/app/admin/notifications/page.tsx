"use client";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { listTenants, sendSystemNotification, Tenant } from "@/lib/api";
import { Send, Bell, Users, Building2, Info, CheckCircle2, AlertTriangle, XCircle, Loader2 } from "lucide-react";

export default function AdminNotificationsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [target, setTarget] = useState<string>("all"); // 'all' ou ID da prefeitura

  useEffect(() => {
    // Carrega prefeituras para o dropdown
    listTenants().then(setTenants).finally(() => setInitLoading(false));
  }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm("Tem certeza que deseja enviar esta notificação?")) return;

    setLoading(true);
    try {
      const tenantId = target === "all" ? null : parseInt(target);
      
      await sendSystemNotification({
        title,
        message,
        type,
        target_tenant_id: tenantId
      });

      alert("Notificação enviada com sucesso!");
      // Limpa form
      setTitle(""); setMessage(""); setType("info"); setTarget("all");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex bg-[#F8F9FC] min-h-screen font-sans text-slate-900">
      <Sidebar />
      <main className="flex-1 ml-64 p-12">
        
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
              <Bell className="w-8 h-8 text-blue-600" /> Central de Comunicação
            </h1>
            <p className="text-slate-500 text-lg">Envie avisos globais ou direcionados para as prefeituras.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-lg">Nova Mensagem</h3>
            </div>
            
            <div className="p-8">
              <form onSubmit={handleSend} className="space-y-6">
                
                {/* Destinatário */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Destinatário</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Opção TODOS */}
                    <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${target === 'all' ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}>
                      <input type="radio" name="target" value="all" checked={target === 'all'} onChange={e => setTarget(e.target.value)} className="hidden" />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${target === 'all' ? 'border-blue-600' : 'border-slate-300'}`}>
                        {target === 'all' && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-slate-600" />
                        <span className="font-bold text-slate-700">Todos os Usuários</span>
                      </div>
                    </label>

                    {/* Opção ESPECÍFICO */}
                    <div className={`relative p-1 rounded-xl border-2 transition-all ${target !== 'all' ? 'border-blue-600 bg-blue-50' : 'border-slate-100'}`}>
                       <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${target !== 'all' ? 'border-blue-600' : 'border-slate-300'}`}>
                            {target !== 'all' && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>}
                          </div>
                          <Building2 className="w-5 h-5 text-slate-600" />
                       </div>
                       <select 
                        className="w-full h-full p-3 pl-12 bg-transparent outline-none font-bold text-slate-700 cursor-pointer appearance-none"
                        value={target}
                        onChange={e => setTarget(e.target.value)}
                       >
                         <option value="all" disabled>Selecionar Prefeitura...</option>
                         {tenants.map(t => (
                           <option key={t.id} value={t.id}>{t.name}</option>
                         ))}
                       </select>
                    </div>
                  </div>
                </div>

                {/* Tipo de Mensagem */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tipo de Alerta</label>
                  <div className="flex gap-3">
                    {[
                      { id: 'info', label: 'Informativo', icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
                      { id: 'success', label: 'Sucesso', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
                      { id: 'warning', label: 'Atenção', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
                      { id: 'error', label: 'Urgente', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setType(t.id)}
                        className={`flex-1 py-3 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${type === t.id ? `${t.bg} ${t.border} ring-2 ring-offset-2 ring-${t.id === 'info' ? 'blue' : t.id}` : 'border-slate-100 hover:border-slate-200'}`}
                      >
                        <t.icon className={`w-6 h-6 ${t.color}`} />
                        <span className={`text-xs font-bold ${type === t.id ? 'text-slate-800' : 'text-slate-400'}`}>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conteúdo */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Título</label>
                  <input 
                    required
                    className="w-full p-4 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-800" 
                    placeholder="Ex: Manutenção Programada"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mensagem</label>
                  <textarea 
                    required
                    rows={4}
                    className="w-full p-4 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-600 resize-none"
                    placeholder="Digite os detalhes do aviso..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                  />
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin"/> : <><Send className="w-5 h-5" /> Enviar Notificação</>}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}