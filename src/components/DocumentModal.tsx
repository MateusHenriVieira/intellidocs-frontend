"use client";

import { X, Calendar, FileText, Tag, Download, Eye, Copy, Check, Printer, Loader2 } from "lucide-react";
import { SearchResult, getDownloadUrl } from "@/lib/api"; // <--- Importe getDownloadUrl
import { useState } from "react";

interface DocumentModalProps {
  document: SearchResult;
  onClose: () => void;
}

export function DocumentModal({ document, onClose }: DocumentModalProps) {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleCopyText = () => {
    if (document.text_snippet) {
      navigator.clipboard.writeText(document.text_snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // --- DOWNLOAD CORRIGIDO ---
  const handleDownload = () => {
    setIsDownloading(true);
    
    try {
      // 1. Gera a URL direta do backend
      const downloadUrl = getDownloadUrl(document.preview_url);
      
      if (downloadUrl) {
        // 2. Redireciona o navegador (Download nativo)
        // Isso evita erros de CORS e fetch
        window.location.href = downloadUrl;
      } else {
        alert("URL de download inválida.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao iniciar download.");
    } finally {
      setTimeout(() => setIsDownloading(false), 1500);
    }
  };
  // --------------------------

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Imprimir - ${document.document_title}</title>
            <style>
              body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
              img { max-width: 100%; max-height: 100%; object-fit: contain; }
              @media print { @page { margin: 0; } body { margin: 0; } }
            </style>
          </head>
          <body>
            <img src="${document.preview_url}" onload="window.print(); window.close();" />
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div 
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row animate-in zoom-in-95 duration-200 border border-slate-200">
        
        {/* ESQUERDA: IMAGEM */}
        <div className="w-full lg:w-2/3 bg-slate-50 relative flex items-center justify-center p-8 overflow-hidden group">
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]"></div>
          <img 
            src={document.preview_url} 
            alt="Visualização" 
            className="max-h-full max-w-full object-contain shadow-lg rounded border border-slate-200 transition-transform duration-300 group-hover:scale-[1.01]"
          />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md text-slate-700 px-4 py-1.5 rounded-full text-xs font-semibold border border-slate-200 shadow-sm flex items-center gap-2">
            <Eye className="w-3 h-3 text-slate-400" />
            Página {document.page_number}
          </div>
        </div>

        {/* DIREITA: INFO */}
        <div className="w-full lg:w-1/3 flex flex-col bg-white border-l border-slate-200">
          <div className="p-6 border-b border-slate-100 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 uppercase tracking-wide border border-slate-200">
                  <Tag className="w-3 h-3" />
                  {document.doc_type || "Geral"}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 uppercase tracking-wide border border-emerald-100">
                  {document.score.toFixed(0)}% Relevância
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 leading-snug line-clamp-2" title={document.document_title}>
                {document.document_title}
              </h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-900 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Detalhes</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Data</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(document.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">ID</p>
                  <div className="flex items-center gap-2 text-sm font-mono text-slate-900">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">REF-00{document.page_number}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 flex-1 flex flex-col">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Conteúdo (OCR)</h3>
                <button onClick={handleCopyText} className="text-xs flex items-center gap-1 text-slate-400 hover:text-blue-600 transition-colors">
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copiado" : "Copiar Texto"}
                </button>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-600 leading-relaxed font-mono whitespace-pre-wrap overflow-y-auto max-h-[300px] shadow-inner">
                {document.text_snippet || "Nenhum texto extraído."}
              </div>
            </div>
          </div>

          {/* RODAPÉ */}
          <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
            <button onClick={handlePrint} className="flex-1 flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 py-3 rounded-lg font-bold hover:bg-slate-50 hover:border-slate-300 transition-all text-sm">
              <Printer className="w-4 h-4" /> Imprimir
            </button>
            <button onClick={handleDownload} disabled={isDownloading} className="flex-[2] flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-black transition-all shadow-md active:translate-y-0.5 text-sm disabled:opacity-70">
              {isDownloading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4" />}
              {isDownloading ? "Baixando..." : "Baixar Imagem"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}