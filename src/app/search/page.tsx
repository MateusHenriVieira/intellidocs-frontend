"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { DocumentModal } from "@/components/DocumentModal";
import { searchDocuments, SearchResult } from "@/lib/api";
import { Search, Loader2, FileText, AlertCircle } from "lucide-react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<SearchResult | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setResults([]);

    try {
      const data = await searchDocuments(query);
      setResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Cabeçalho da Busca */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Busca Inteligente</h1>
            <p className="text-slate-500">Encontre qualquer informação dentro dos documentos digitalizados.</p>
          </div>

          {/* Barra de Pesquisa */}
          <form onSubmit={handleSearch} className="mb-10 sticky top-4 z-10">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-lg transition-all"
                placeholder="Ex: Pagamento 155 reais, Decreto de Março..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white px-6 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Pesquisar"}
              </button>
            </div>
          </form>

          {/* Estados de Loading e Vazio */}
          {loading && (
            <div className="text-center py-20">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-slate-500 font-medium">A IA está analisando o contexto...</p>
            </div>
          )}

          {!loading && hasSearched && results.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center border-dashed">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-1">Nenhum resultado encontrado</h3>
              <p className="text-slate-500">Tente usar palavras-chave diferentes ou verifique a ortografia.</p>
            </div>
          )}

          {/* Grid de Resultados */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map((item, index) => (
              <div
                key={index}
                onClick={() => setSelectedDoc(item)}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 group"
              >
                {/* Imagem Preview */}
                <div className="h-48 bg-slate-100 relative overflow-hidden border-b border-slate-100">
                  <img
                    src={item.preview_url}
                    alt={item.document_title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded backdrop-blur-md text-white border border-white/20 ${item.score === 100 ? 'bg-green-500/90' : 'bg-black/60'}`}>
                    {item.score === 100 ? 'EXATO' : `${item.score.toFixed(0)}%`}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                      {item.doc_type || "Geral"}
                    </span>
                    <span className="text-xs text-slate-400">Pág {item.page_number}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                    {item.document_title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 bg-slate-50 p-2 rounded-lg italic">
                    "{item.text_snippet}"
                  </p>
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