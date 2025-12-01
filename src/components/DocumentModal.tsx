"use client";

import { X, Calendar, FileText, Tag, Download, Eye } from "lucide-react";
import { SearchResult } from "@/lib/api";

interface DocumentModalProps {
  document: SearchResult;
  onClose: () => void;
}

export function DocumentModal({ document, onClose }: DocumentModalProps) {
  // Fecha ao clicar no fundo escuro
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div 
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-white w-full max-w-6xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-200">
        
        {/* LADO ESQUERDO: Visualização */}
        <div className="w-full md:w-2/3 bg-slate-100 relative flex items-center justify-center p-6 border-r border-slate-200">
          <img 
            src={document.preview_url} 
            alt="Visualização do Documento" 
            className="max-h-full max-w-full object-contain shadow-lg rounded-md border border-slate-200"
          />
          <div className="absolute bottom-6 left-6 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md">
            Página {document.page_number}
          </div>
        </div>

        {/* LADO DIREITO: Informações */}
        <div className="w-full md:w-1/3 flex flex-col bg-white">
          
          {/* Cabeçalho */}
          <div className="p-6 border-b border-slate-100 flex justify-between items-start">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 mb-2 uppercase tracking-wide">
                <Tag className="w-3 h-3" />
                {document.doc_type || "Documento"}
              </span>
              <h2 className="text-xl font-bold text-slate-800 leading-tight">
                {document.document_title}
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-500 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Conteúdo Rolável */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Cards de Métricas */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-400 font-semibold uppercase mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Data
                </p>
                <p className="text-sm font-semibold text-slate-700">
                  {new Date(document.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-400 font-semibold uppercase mb-1 flex items-center gap-1">
                  <Eye className="w-3 h-3" /> Relevância
                </p>
                <p className="text-sm font-bold text-green-600">
                  {document.score.toFixed(0)}% Match
                </p>
              </div>
            </div>

            {/* Texto Extraído (OCR) */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                Trecho Encontrado
              </h3>
              <div className="bg-yellow-50/50 p-4 rounded-xl border border-yellow-100 text-sm text-slate-700 leading-relaxed font-mono whitespace-pre-wrap max-h-60 overflow-y-auto">
                {document.text_snippet || "Nenhum texto extraído desta página."}
              </div>
            </div>
          </div>

          {/* Rodapé de Ações */}
          <div className="p-4 border-t border-slate-100 bg-slate-50">
            <button className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
              <Download className="w-4 h-4" />
              Baixar Original
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}