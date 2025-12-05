"use client";
import { useEffect, useState, use } from "react";
import { getPublicDocument, PublicDocument } from "@/lib/api";
import { Loader2, FileText, AlertTriangle, Eye } from "lucide-react";

// Tipagem atualizada para Next.js 15+
export default function PublicViewPage({ params }: { params: Promise<{ token: string }> }) {
  
  // Desembrulha a Promise dos parâmetros
  const { token } = use(params);

  const [doc, setDoc] = useState<PublicDocument | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      loadDoc(token);
    }
  }, [token]);

  async function loadDoc(tokenVal: string) {
    try {
      const data = await getPublicDocument(tokenVal);
      setDoc(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-10 h-10 animate-spin text-slate-900"/></div>;

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md border border-red-100">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Acesso Indisponível</h1>
        <p className="text-slate-500">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      
      {/* Header Público */}
      <header className="bg-slate-900 text-white p-4 shadow-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg"><FileText className="w-5 h-5"/></div>
            <div>
              <h1 className="font-bold text-sm md:text-base truncate max-w-[200px] md:max-w-md">{doc?.title}</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Visualização Pública Segura</p>
            </div>
          </div>
          <div className="text-xs bg-white/10 px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
            <Eye className="w-3 h-3" /> Modo Leitura
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
        {doc?.pages.map((page) => (
          <div key={page.page_number} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            
            {/* Cabeçalho da Página */}
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Página {page.page_number} de {doc.total_pages}</span>
            </div>

            {/* Área da Imagem (Limpa) */}
            <div className="p-6 flex justify-center bg-slate-50/30 group">
              <img 
                src={page.image_url} 
                alt={`Página ${page.page_number}`} 
                className="max-w-full shadow-lg rounded border border-slate-200 transition-transform duration-300 group-hover:scale-[1.01]"
              />
            </div>

            {/* REMOVIDO: Área de Texto Extraído (OCR) */}
            
          </div>
        ))}
      </main>

      <footer className="p-8 text-center text-slate-400 text-xs">
        Documento disponibilizado via IntelliDocs Gov. O link expira em breve.
      </footer>
    </div>
  );
}