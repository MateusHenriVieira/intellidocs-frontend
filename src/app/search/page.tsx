"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { DocumentModal } from "@/components/DocumentModal";
import { searchDocuments, SearchResult } from "@/lib/api";
import { Search, Loader2, FileText, Filter, Calendar, Building2, Tag, X, ChevronDown, ArrowRight } from "lucide-react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<SearchResult | null>(null);

  // Estados dos Filtros
  const [docType, setDocType] = useState("Todos");
  const [department, setDepartment] = useState("Todos");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setResults([]);

    try {
      const data = await searchDocuments(query, {
        docType: docType !== "Todos" ? docType : undefined,
        department: department !== "Todos" ? department : undefined,
        startDate: dateRange.start,
        endDate: dateRange.end
      });
      setResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // Componente de Select Customizado
  const FilterSelect = ({ icon: Icon, label, value, onChange, options }: any) => (
    <div className="relative group min-w-[200px] flex-1">
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
        <Icon className="w-3 h-3" /> {label}
      </label>
      <div className="relative">
        <select 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-2.5 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all text-sm font-medium shadow-sm hover:border-slate-300 cursor-pointer"
        >
          {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex bg-[#F8F9FC] min-h-screen font-sans text-slate-900">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8 lg:p-12">
        <div className="max-w-[1600px] mx-auto">
          
          <header className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Busca Corporativa</h1>
            <p className="text-slate-500">Localize documentos usando inteligência artificial e filtros avançados.</p>
          </header>

          {/* ÁREA DE BUSCA (Estilo Card Flutuante) */}
          <div className="bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-slate-200 p-6 mb-10">
            <form onSubmit={handleSearch} className="space-y-6">
              
              {/* Input Principal */}
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                <input
                  type="text"
                  className="w-full pl-14 pr-32 py-4 bg-slate-50 border border-slate-200 rounded-xl text-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 focus:border-slate-300 transition-all shadow-inner"
                  placeholder="Digite o que procura (ex: 'Pagamento de asfalto', 'CNPJ 123', 'Decreto de Março')..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-2 top-2 bottom-2 bg-[#0f172a] text-white px-8 rounded-lg font-bold text-sm hover:bg-black transition-all disabled:opacity-50 flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95"
                >
                  {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <>Pesquisar <ArrowRight className="w-4 h-4"/></>}
                </button>
              </div>

              {/* Linha de Filtros */}
              <div className="pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-6">
                
                <FilterSelect 
                  icon={Building2} 
                  label="Secretaria / Depto" 
                  value={department} 
                  onChange={setDepartment} 
                  options={["Todos", "Geral", "Saúde", "Educação", "Obras", "Finanças", "RH", "Jurídico"]} 
                />

                <FilterSelect 
                  icon={Tag} 
                  label="Tipo Documental" 
                  value={docType} 
                  onChange={setDocType} 
                  options={["Todos", "Nota Fiscal", "Boleto", "Decreto", "Contrato", "Memorando", "Ofício", "Extrato Bancário"]} 
                />

                {/* Filtro de Data Duplo */}
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" /> Período de Ingestão
                  </label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="date" 
                      className="flex-1 bg-white border border-slate-200 text-slate-700 py-2.5 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-sm font-medium shadow-sm"
                      value={dateRange.start}
                      onChange={e => setDateRange({...dateRange, start: e.target.value})}
                    />
                    <span className="text-slate-300 font-medium">até</span>
                    <input 
                      type="date" 
                      className="flex-1 bg-white border border-slate-200 text-slate-700 py-2.5 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-sm font-medium shadow-sm"
                      value={dateRange.end}
                      onChange={e => setDateRange({...dateRange, end: e.target.value})}
                    />
                  </div>
                </div>

              </div>
            </form>
          </div>

          {/* RESULTADOS */}
          
          {/* Loading Skeleton */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white h-72 rounded-2xl border border-slate-200">
                  <div className="h-40 bg-slate-100 rounded-t-2xl border-b border-slate-100"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && hasSearched && results.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed shadow-sm">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <FileText className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700">Nenhum documento encontrado</h3>
              <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
                Não encontramos correspondências para "{query}" com os filtros selecionados. Tente termos mais genéricos.
              </p>
              <button 
                onClick={() => { setQuery(""); setDocType("Todos"); setDepartment("Todos"); setDateRange({start:"", end:""}); }}
                className="mt-6 text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors border-b border-slate-300 hover:border-blue-600 pb-0.5"
              >
                Limpar todos os filtros
              </button>
            </div>
          )}

          {/* Grid de Cards Profissional */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map((item, index) => (
              <div
                key={index}
                onClick={() => setSelectedDoc(item)}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-slate-300 transition-all duration-300 flex flex-col h-full"
              >
                {/* Preview com Overlay */}
                <div className="h-48 bg-slate-100 relative overflow-hidden border-b border-slate-100">
                  <img
                    src={item.preview_url}
                    alt={item.document_title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out opacity-95 group-hover:opacity-100"
                  />
                  
                  {/* Badges Flutuantes */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-white/90 text-slate-700 shadow-sm border border-slate-200 backdrop-blur-sm uppercase tracking-wider">
                      {item.doc_type || "DOC"}
                    </span>
                  </div>
                  
                  {/* Score Badge */}
                  <div className={`absolute bottom-3 right-3 text-[10px] font-bold px-2 py-1 rounded-md text-white shadow-sm border border-white/10 backdrop-blur-md flex items-center gap-1 ${item.score === 100 ? 'bg-emerald-600' : 'bg-slate-900/90'}`}>
                    {item.score === 100 ? <><Tag className="w-3 h-3"/> EXATO</> : `${item.score.toFixed(0)}% RELEVANTE`}
                  </div>
                </div>

                {/* Info Body */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="mb-3">
                    <h3 className="font-bold text-slate-800 text-sm line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors mb-1" title={item.document_title}>
                      {item.document_title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span>Pág {item.page_number}</span>
                    </div>
                  </div>

                  {/* Snippet OCR */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mt-auto group-hover:bg-blue-50/30 group-hover:border-blue-100 transition-colors">
                    <p className="text-xs text-slate-500 line-clamp-3 italic font-medium leading-relaxed">
                      "{item.text_snippet}"
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* MODAL */}
      {selectedDoc && (
        <DocumentModal 
          document={selectedDoc} 
          onClose={() => setSelectedDoc(null)} 
        />
      )}
    </div>
  );
}