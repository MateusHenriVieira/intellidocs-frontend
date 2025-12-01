"use client";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { getDashboardStats, DashboardStats } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { FileText, Layers, TrendingUp, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    getDashboardStats()
      .then(setStats)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Visão Geral</h1>
          <p className="text-slate-500">Métricas da Prefeitura Demo</p>
        </header>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><FileText className="w-6 h-6" /></div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Documentos</p>
                <h3 className="text-2xl font-bold text-slate-900">{stats?.total_documents || 0}</h3>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-xl"><Layers className="w-6 h-6" /></div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Páginas Processadas</p>
                <h3 className="text-2xl font-bold text-slate-900">{stats?.total_pages || 0}</h3>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><TrendingUp className="w-6 h-6" /></div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Eficiência IA</p>
                <h3 className="text-2xl font-bold text-slate-900">100%</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico e Lista Recente */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Gráfico */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Documentos por Tipo</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.documents_by_type || []}>
                  <XAxis dataKey="type" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border:'none'}} />
                  <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]}>
                    {(stats?.documents_by_type || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#2563eb', '#16a34a', '#db2777'][index % 3] || '#2563eb'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Uploads Recentes */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Recentes</h3>
            <div className="space-y-4">
              {stats?.recent_uploads.map((doc, i) => (
                <div key={i} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-bold text-xs">PDF</div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-slate-800 truncate">{doc.title}</p>
                    <p className="text-xs text-slate-400">{new Date(doc.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {(!stats?.recent_uploads || stats.recent_uploads.length === 0) && (
                <p className="text-sm text-slate-400 text-center py-4">Nenhum upload recente.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}