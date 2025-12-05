"use client";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { getDashboardStats, DashboardStats } from "@/lib/api";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from "recharts";
import { Search, Calendar as CalendarIcon, ArrowUpRight, FileText, Layers, HardDrive, Loader2, MoreHorizontal, CheckCircle2 } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell"; // Componente do Sino
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDateOnly } from "@/lib/utils"; // Utilitário de data BR

const COLORS = ['#0f172a', '#334155', '#94a3b8', '#e2e8f0'];

// Formata MB para GB/TB
function formatStorage(mb: number) {
  if (!mb || mb === 0) return { value: "0", unit: "KB" };
  if (mb < 1) return { value: (mb * 1024).toFixed(0), unit: "KB" };
  else if (mb < 1024) return { value: mb.toFixed(1), unit: "MB" };
  else if (mb < 1024 * 1024) return { value: (mb / 1024).toFixed(2), unit: "GB" };
  else return { value: (mb / (1024 * 1024)).toFixed(2), unit: "TB" };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [storageDisplay, setStorageDisplay] = useState({ value: "0", unit: "MB" });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    
    getDashboardStats()
      .then((data) => {
        setStats(data);
        setStorageDisplay(formatStorage(data.storage_used_mb));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC]"><Loader2 className="w-8 h-8 animate-spin text-slate-900" /></div>;

  return (
    <div className="flex bg-[#F8F9FC] min-h-screen font-sans text-slate-900">
      <Sidebar />
      
      <main className="flex-1 ml-64">
        {/* TOP HEADER */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
          
          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Pesquisar documentos..." 
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-slate-900/10 focus:bg-white transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-6 pl-8">
            <div className="flex items-center gap-2 text-sm text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
              <CalendarIcon className="w-4 h-4" />
              <span>Hoje</span>
            </div>
            
            {/* Sino de Notificações Funcional */}
            <NotificationBell />
            
          </div>
        </header>

        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
          
          {/* Título e Ações */}
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Painel de Controle</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-xs font-bold rounded uppercase tracking-wide">
                  {stats?.department_view || "Carregando..."}
                </span>
                <p className="text-slate-500">Monitoramento em tempo real.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/reports" className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 shadow-sm flex items-center gap-2">
                <FileText className="w-4 h-4"/> Relatórios
              </Link>
              <Link href="/upload" className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 shadow-lg shadow-slate-900/20 flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4"/> Novo Documento
              </Link>
            </div>
          </div>

          {/* KPIs (Indicadores) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-32">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Documentos</span>
                <div className="p-2 rounded-lg text-blue-600 bg-blue-50">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 tracking-tight">{stats?.total_documents || 0}</div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-32">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Páginas Lidas</span>
                <div className="p-2 rounded-lg text-purple-600 bg-purple-50">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 tracking-tight">{stats?.total_pages || 0}</div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-32">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Espaço Utilizado</span>
                <div className="p-2 rounded-lg text-orange-600 bg-orange-50">
                  <HardDrive className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-slate-900 tracking-tight">{storageDisplay.value}</div>
                <span className="text-sm font-medium text-slate-500">{storageDisplay.unit}</span>
              </div>
            </div>
          </div>

          {/* Gráficos e Listas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Gráfico de Área (Produção Semanal) */}
            <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] border border-slate-100">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Produtividade Semanal</p>
                  <div className="flex items-baseline gap-3">
                    <h3 className="text-3xl font-bold text-slate-900">
                      {stats?.weekly_activity?.reduce((acc, curr) => acc + curr.value, 0) || 0} Páginas
                    </h3>
                    <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                      <ArrowUpRight className="w-3 h-3 mr-1" /> Recente
                    </span>
                  </div>
                </div>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.weekly_activity || []}>
                    <defs>
                      <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{borderRadius: '12px', border:'none', boxShadow:'0 10px 40px -10px rgba(0,0,0,0.1)'}} 
                      formatter={(value: number) => [`${value} Páginas`, "Produção"]} 
                      labelStyle={{color: '#64748b', marginBottom: '0.5rem'}} 
                    />
                    <Area type="monotone" dataKey="value" stroke="#0f172a" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" animationDuration={1500} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico de Pizza (Categorias) */}
            <div className="bg-white p-8 rounded-3xl shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] border border-slate-100 flex flex-col">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900">Categorias</h3>
                <p className="text-sm text-slate-500">Distribuição real</p>
              </div>
              <div className="flex-1 min-h-[200px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={stats?.documents_by_type || [{name: 'Sem dados', value: 1}]} 
                      innerRadius={60} 
                      outerRadius={80} 
                      paddingAngle={5} 
                      dataKey="count"
                    >
                      {(stats?.documents_by_type || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                  <span className="text-3xl font-bold text-slate-900">{stats?.total_documents}</span>
                  <span className="text-xs text-slate-400 font-medium uppercase">Docs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lista Recente */}
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-slate-900">Entradas Recentes</h3>
              <button className="text-slate-400 hover:text-slate-600 transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-slate-100">
                    <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider pl-2">Documento</th>
                    <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Data</th>
                    <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {stats?.recent_uploads.map((doc, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors group cursor-default">
                      <td className="py-4 pl-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 font-bold text-xs group-hover:bg-white group-hover:shadow-sm transition-all">PDF</div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm truncate max-w-[200px]">{doc.title}</p>
                            <p className="text-xs text-slate-500">{doc.type || "Geral"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-sm text-slate-500 font-medium text-right">
                        {/* Correção de Data aplicada aqui */}
                        {formatDateOnly(doc.date)}
                      </td>
                      <td className="py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide">
                          <CheckCircle2 className="w-3 h-3" /> Processado
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!stats?.recent_uploads || stats.recent_uploads.length === 0) && (
                <div className="text-center py-10 text-slate-400 text-sm">
                  Nenhuma atividade recente encontrada.
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}