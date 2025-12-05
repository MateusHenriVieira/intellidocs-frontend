"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { generateBIReport, BIResponse } from "@/lib/api";
import { 
  ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from "recharts";
import { Loader2, Search, FileText, TrendingUp, TrendingDown, Minus, Lightbulb, Table, Download } from "lucide-react";

const COLORS = ['#ec7000', '#1e40af', '#64748b', '#94a3b8', '#cbd5e1'];

export default function ReportsPage() {
  const router = useRouter();
  
  useEffect(() => {
    const role = localStorage.getItem("user_role");
    if (!role) router.push("/login");
    else if (role === "alimentador") router.push("/");
  }, [router]);

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<BIResponse | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setReport(null);
    try {
      const data = await generateBIReport(query);
      setReport(data);
    } catch (err) {
      console.error(err);
      alert("Erro ao gerar inteligência. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const KPICard = ({ kpi }: { kpi: any }) => {
    const isPos = kpi.status === "positive";
    const isNeg = kpi.status === "negative";
    
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{kpi.label}</p>
        <div className="flex items-end justify-between">
          <h3 className="text-2xl font-bold text-slate-900">{kpi.value}</h3>
          {kpi.trend && (
            <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${isPos ? 'bg-green-50 text-green-700' : isNeg ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-600'}`}>
              {isPos ? <TrendingUp className="w-3 h-3 mr-1"/> : isNeg ? <TrendingDown className="w-3 h-3 mr-1"/> : <Minus className="w-3 h-3 mr-1"/>}
              {kpi.trend}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex bg-[#F4F7FA] min-h-screen font-sans text-slate-900">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8 lg:p-12">
        <div className="max-w-[1800px] mx-auto space-y-8">
          
          {/* Header de Busca */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Analytics Studio</h1>
            <p className="text-slate-500 text-sm mb-6">Faça perguntas complexas para sua base de documentos.</p>
            
            <form onSubmit={handleGenerate} className="relative max-w-3xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-blue-600" />
              </div>
              <input
                type="text"
                className="block w-full pl-12 pr-32 py-4 bg-slate-50 border border-slate-200 rounded-xl text-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all shadow-inner"
                placeholder="Ex: Qual a variação mensal dos gastos com combustível em 2024?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-2 bottom-2 bg-[#0f172a] hover:bg-blue-900 text-white px-6 rounded-lg font-bold text-sm transition-all disabled:opacity-70 flex items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Analisar"}
              </button>
            </form>
          </div>

          {loading && (
            <div className="py-20 text-center animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/4 mx-auto mb-6"></div>
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="h-32 bg-slate-200 rounded-xl"></div>
                <div className="h-32 bg-slate-200 rounded-xl"></div>
                <div className="h-32 bg-slate-200 rounded-xl"></div>
              </div>
              <div className="h-96 bg-slate-200 rounded-xl"></div>
            </div>
          )}

          {report && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 space-y-6">
              
              {/* Cabeçalho do Relatório */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{report.report_title}</h2>
                  <p className="text-slate-500 text-sm max-w-2xl mt-1 leading-relaxed">{report.executive_summary}</p>
                </div>
                <button className="flex items-center gap-2 text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors">
                  <Download className="w-4 h-4"/> Exportar PDF
                </button>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {report.kpis.map((kpi, i) => (
                  <KPICard key={i} kpi={kpi} />
                ))}
              </div>

              {/* Área Principal: Gráfico e Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Gráfico Principal (Composto) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Tendência e Volume</h3>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={report.main_chart}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1e40af" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#1e40af" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="label" scale="point" padding={{ left: 20, right: 20 }} tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} />
                        <YAxis tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} />
                        <RechartsTooltip 
                          contentStyle={{backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'}}
                          itemStyle={{color: '#0f172a', fontWeight: 600}}
                        />
                        <Legend />
                        
                        {/* SÉRIES DINÂMICAS BASEADAS NO CHART_CONFIG */}
                        <Area 
                          type="monotone" 
                          dataKey="value1" 
                          name={report.chart_config?.value1_label || "Valor"} 
                          fill="url(#colorValue)" 
                          stroke="#1e40af" 
                          strokeWidth={2} 
                        />
                        <Bar 
                          dataKey="value2" 
                          name={report.chart_config?.value2_label || "Volume"} 
                          barSize={20} 
                          fill="#cbd5e1" 
                          radius={[4, 4, 0, 0]} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value1" 
                          stroke="#ec7000" 
                          strokeWidth={3} 
                          dot={{r: 4, fill: '#ec7000'}} 
                          legendType="none" // Esconde linha duplicada na legenda
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Coluna Lateral: Distribuição e Insights */}
                <div className="space-y-6">
                  
                  {/* Gráfico de Rosca */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-[250px] flex flex-col">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Distribuição</h3>
                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={report.distribution_chart}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {report.distribution_chart.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Lista de Insights (IA) */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl shadow-lg text-white">
                    <div className="flex items-center gap-2 mb-4">
                      <Lightbulb className="w-5 h-5 text-yellow-400" />
                      <h3 className="font-bold text-sm uppercase tracking-widest">Insights da IA</h3>
                    </div>
                    <ul className="space-y-3">
                      {report.insights.map((insight, i) => (
                        <li key={i} className="text-sm leading-relaxed opacity-90 flex gap-2">
                          <span className="text-blue-400">•</span> {insight}
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </div>

              {/* Tabela de Dados Detalhada */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                  <Table className="w-4 h-4 text-slate-500" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Dados Brutos da Análise</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-semibold">
                      <tr>
                        <th className="px-6 py-3">Documento Fonte</th>
                        <th className="px-6 py-3">Data Ref.</th>
                        <th className="px-6 py-3">Categoria</th>
                        <th className="px-6 py-3 text-right">Valor / Dado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {report.raw_data.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-3 font-medium text-slate-900">{row.document}</td>
                          <td className="px-6 py-3 text-slate-500">{row.date}</td>
                          <td className="px-6 py-3">
                            <span className="inline-flex px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-bold uppercase">{row.status}</span>
                          </td>
                          <td className="px-6 py-3 text-right font-mono text-blue-700 font-bold">{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}