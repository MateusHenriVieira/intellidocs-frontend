"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { 
  Search, Loader2, Download, TrendingUp, DollarSign, 
  FileText, AlertCircle, PieChart as PieIcon, Filter
} from "lucide-react";
import { generateBIReport, BIResponse } from "@/lib/api";

export default function AnalyticsPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<BIResponse | null>(null);

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      // Chama a nova rota inteligente que lê o JSON do backend
      const data = await generateBIReport(query);
      setReport(data);
    } catch (err) {
      alert("Erro ao gerar análise. Tente refazer a pergunta.");
    } finally {
      setLoading(false);
    }
  }

  // Cores para os gráficos (Paleta Enterprise)
  const COLORS = ['#0f172a', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="flex bg-[#F8F9FC] min-h-screen font-sans text-slate-900">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* HEADER E BUSCA */}
          <header className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Analytics & BI</h1>
              <p className="text-slate-500 mt-1">Inteligência artificial aplicada ao acervo documental.</p>
            </div>

            <form onSubmit={handleAnalyze} className="relative shadow-xl rounded-2xl group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <Search className={`h-6 w-6 ${loading ? 'text-blue-500 animate-pulse' : 'text-slate-400'}`} />
              </div>
              <input
                type="text"
                className="block w-full pl-16 pr-32 py-6 text-lg rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 bg-white placeholder:text-slate-300 transition-all shadow-sm group-hover:shadow-md"
                placeholder="Ex: Qual o valor total gasto com a empresa Novatec em 2024?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={loading}
              />
              <button 
                type="submit" 
                disabled={loading || !query.trim()}
                className="absolute right-3 top-3 bottom-3 bg-slate-900 text-white px-8 rounded-xl font-bold hover:bg-black transition-all disabled:opacity-70 flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Analisar"}
              </button>
            </form>
          </header>

          {/* ESTADO VAZIO (Placeholder) */}
          {!report && !loading && (
            <div className="text-center py-20 opacity-50 border-2 border-dashed border-slate-200 rounded-3xl">
              <PieIcon className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-400">Nenhuma análise gerada</h3>
              <p className="text-slate-400">Faça uma pergunta sobre seus documentos acima.</p>
            </div>
          )}

          {/* LOADING STATE (Esqueleto bonito) */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
              <div className="h-32 bg-slate-200 rounded-2xl"></div>
              <div className="h-32 bg-slate-200 rounded-2xl"></div>
              <div className="h-32 bg-slate-200 rounded-2xl"></div>
              <div className="md:col-span-2 h-80 bg-slate-200 rounded-2xl"></div>
              <div className="h-80 bg-slate-200 rounded-2xl"></div>
            </div>
          )}

          {/* O RELATÓRIO ENTERPRISE */}
          {report && !loading && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              
              {/* 1. CABEÇALHO DO RELATÓRIO */}
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{report.report_title}</h2>
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mt-3 max-w-3xl">
                    <p className="text-blue-800 text-sm leading-relaxed">
                      <strong>🤖 Resumo Executivo:</strong> {report.executive_summary}
                    </p>
                  </div>
                </div>
                <button className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-sm bg-white border border-slate-200 px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow">
                  <Download className="w-4 h-4" /> Exportar PDF
                </button>
              </div>

              {/* 2. CARDS DE KPI (Indicadores) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {report.kpis.map((kpi, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-32">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{kpi.label}</span>
                      {kpi.status === 'positive' ? <TrendingUp className="w-5 h-5 text-emerald-500"/> : 
                       kpi.status === 'negative' ? <AlertCircle className="w-5 h-5 text-red-500"/> : 
                       <DollarSign className="w-5 h-5 text-blue-500"/>}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">{kpi.value}</h3>
                      {kpi.trend && <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{kpi.trend}</span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* 3. GRÁFICOS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Gráfico Principal (Barras ou Área) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600"/> Evolução Temporal
                  </h3>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={report.main_chart}>
                        <defs>
                          <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fill: '#94a3b8', fontSize: 12}} 
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fill: '#94a3b8', fontSize: 12}}
                          tickFormatter={(value) => `R$ ${value/1000}k`} 
                        />
                        <Tooltip 
                          contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                          formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, report.chart_config.value2_label]}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#3b82f6" 
                          strokeWidth={3} 
                          fillOpacity={1} 
                          fill="url(#colorVal)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Gráfico de Distribuição (Pizza) */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <PieIcon className="w-4 h-4 text-purple-600"/> Distribuição
                  </h3>
                  <div className="h-72 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={report.distribution_chart}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {report.distribution_chart.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Legenda Customizada */}
                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                        {report.distribution_chart.map((entry, index) => (
                            <div key={index} className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                                <span className="text-[10px] text-slate-500 font-medium">{entry.name}</span>
                            </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. INSIGHTS E RECOMENDAÇÕES */}
              {report.insights.length > 0 && (
                <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 opacity-10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                  <h3 className="text-sm font-bold text-blue-200 mb-4 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span> IA Insights
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                    {report.insights.map((insight, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="bg-white/10 p-1.5 rounded-lg mt-0.5">
                          <AlertCircle className="w-4 h-4 text-blue-300" />
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. TABELA DE DADOS BRUTOS */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-500"/> Fontes de Dados
                  </h3>
                  <button className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    <Filter className="w-3 h-3"/> Filtrar
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                      <tr>
                        <th className="px-6 py-3">Documento</th>
                        <th className="px-6 py-3">Data Ref.</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Valor / Dado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {report.raw_data.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-700">{row.document}</td>
                          <td className="px-6 py-4 text-slate-500 font-mono text-xs">{row.date}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${
                                row.status === 'OK' || row.status === 'PAGO' ? 'bg-green-50 text-green-600 border-green-100' : 
                                'bg-slate-100 text-slate-500 border-slate-200'
                            }`}>
                                {row.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-slate-900">{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {report.raw_data.length === 0 && (
                    <div className="p-8 text-center text-slate-400 text-sm">Nenhum dado tabular encontrado.</div>
                )}
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}