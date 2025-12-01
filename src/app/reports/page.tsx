"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { generateBIReport, BIResponse } from "@/lib/api";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from "recharts";
import { Loader2, TrendingUp, Filter, FileText, DollarSign, Lightbulb } from "lucide-react";

// Paleta de cores para os gráficos
const COLORS = ['#2563eb', '#16a34a', '#db2777', '#ea580c', '#7c3aed'];

export default function ReportsPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<BIResponse | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setReportData(null); // Limpa anterior

    try {
      const data = await generateBIReport(query);
      setReportData(data);
    } catch (err) {
      console.error(err);
      alert("Erro ao gerar relatório. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  // Renderiza o gráfico correto baseado na decisão da IA
  const renderChart = () => {
    if (!reportData?.data || reportData.data.length === 0) return null;

    if (reportData.chart_type === "line") {
      return (
        <LineChart data={reportData.data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$ ${value}`} />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
            cursor={{ stroke: '#94a3b8', strokeWidth: 1 }}
          />
          <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={4} dot={{ r: 6, fill: "#2563eb", strokeWidth: 2, stroke: "#fff" }} />
        </LineChart>
      );
    }

    if (reportData.chart_type === "pie") {
      return (
        <PieChart>
          <Pie
            data={reportData.data}
            innerRadius={80}
            outerRadius={120}
            paddingAngle={5}
            dataKey="value"
          >
            {reportData.data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: '12px' }} />
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      );
    }

    // Padrão: Barras
    return (
      <BarChart data={reportData.data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
        <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={50} />
      </BarChart>
    );
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Inteligência de Dados (BI)</h1>
            <p className="text-slate-500 text-lg">
              Transforme documentos em decisões. Pergunte para a IA e visualize os dados.
            </p>
          </div>

          {/* Área de Input (Prompt) */}
          <div className="bg-white p-1 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200 mb-10">
            <form onSubmit={handleGenerate} className="flex flex-col md:flex-row gap-2 p-2">
              <div className="flex-1 relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <input 
                  type="text" 
                  placeholder="Ex: Qual o total gasto por fornecedor neste mês? Ou: Evolução dos pagamentos."
                  className="w-full pl-14 pr-4 py-4 rounded-xl outline-none text-lg text-slate-700 placeholder:text-slate-400"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-70 flex items-center justify-center gap-2 min-w-[180px] shadow-md hover:shadow-lg active:scale-95"
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                <span>Gerar Análise</span>
              </button>
            </form>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-20 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-64 bg-slate-200 rounded-2xl w-full mx-auto"></div>
              <p className="mt-4 text-slate-500 font-medium">A IA está lendo seus documentos e calculando...</p>
            </div>
          )}

          {/* Resultado do Relatório */}
          {reportData && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
              
              {/* KPIs (Indicadores) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Valor KPI */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-3 text-slate-500 mb-2">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><DollarSign className="w-5 h-5"/></div>
                    <span className="text-xs font-bold uppercase tracking-widest">{reportData.kpi?.label || "Total Calculado"}</span>
                  </div>
                  <div className="text-3xl font-black text-slate-900 tracking-tight">{reportData.kpi?.value || "0"}</div>
                </div>

                {/* Card 2: Volume de Dados */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-purple-300 transition-colors">
                  <div className="flex items-center gap-3 text-slate-500 mb-2">
                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><FileText className="w-5 h-5"/></div>
                    <span className="text-xs font-bold uppercase tracking-widest">Registros</span>
                  </div>
                  <div className="text-3xl font-black text-slate-900 tracking-tight">{reportData.data?.length || 0} Itens</div>
                </div>

                {/* Card 3: Resumo IA */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl shadow-lg text-white col-span-1 md:col-span-1 flex flex-col justify-center">
                  <div className="text-blue-200 text-xs font-bold mb-2 uppercase tracking-widest flex items-center gap-2">
                    <Lightbulb className="w-3 h-3" /> Insight Automático
                  </div>
                  <p className="text-base font-medium leading-relaxed opacity-90">
                    "{reportData.summary}"
                  </p>
                </div>
              </div>

              {/* Gráfico Principal */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 h-[500px]">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold text-slate-800">Visualização de Dados</h3>
                  <div className="flex gap-2">
                    <button className="text-xs font-medium text-slate-500 hover:text-blue-600 px-3 py-1 rounded-full border border-slate-200 hover:border-blue-200 transition-colors">Exportar PNG</button>
                  </div>
                </div>
                
                <ResponsiveContainer width="100%" height="85%">
                  {renderChart() || (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                      <TrendingUp className="w-12 h-12 mb-2 opacity-20" />
                      <p>Não há dados suficientes para gerar gráfico.</p>
                    </div>
                  )}
                </ResponsiveContainer>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}