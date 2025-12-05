"use client";

import { useState, useRef, useEffect } from "react";
import { 
  X, Calendar, Tag, Download, Eye, Copy, Check, Printer, 
  Loader2, Share2, Trash2, MessageSquare, Info, Send, User, Bot 
} from "lucide-react";
import { 
  SearchResult, 
  getDownloadUrl, 
  createShareLink, 
  deleteDocument, 
  sendDocumentChatMessage 
} from "@/lib/api";
import { formatDateOnly } from "@/lib/utils"; // Importe o utilitário

interface DocumentModalProps {
  document: SearchResult;
  onClose: () => void;
  onDeleteSuccess?: () => void;
}

interface ChatMessage {
  role: "user" | "ai";
  content: string;
}

export function DocumentModal({ document, onClose, onDeleteSuccess }: DocumentModalProps) {
  const [activeTab, setActiveTab] = useState<"details" | "chat">("details");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  // Chat
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Permissões
  const [userRole, setUserRole] = useState<string | null>(null);
  useEffect(() => {
    setUserRole(localStorage.getItem("user_role"));
  }, []);
  const canDelete = ["admin", "super_admin", "gestor"].includes(userRole || "");

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  // DOWNLOAD CORRIGIDO: Redireciona navegador
  const handleDownload = () => {
    setIsDownloading(true);
    try {
      const downloadUrl = getDownloadUrl(document.preview_url);
      if (downloadUrl) {
        window.location.href = downloadUrl;
      } else {
        alert("URL de download inválida.");
      }
    } catch (error) {
      alert("Erro ao iniciar download.");
    } finally {
      setTimeout(() => setIsDownloading(false), 1500);
    }
  };

  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(`<html><head><title>${document.document_title}</title></head><body style="margin:0;display:flex;justify-content:center;align-items:center;height:100vh;"><img src="${document.preview_url}" style="max-width:100%;max-height:100%;" onload="window.print();window.close();"/></body></html>`);
      w.document.close();
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const data = await createShareLink(document.doc_id, 48);
      const fullUrl = `${window.location.origin}${data.url_path}`;
      setShareUrl(fullUrl);
      navigator.clipboard.writeText(fullUrl);
    } catch (error) {
      alert("Erro ao gerar link.");
    } finally {
      setIsSharing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("ATENÇÃO: Excluir este documento apagará todas as páginas permanentemente.")) return;
    setIsDeleting(true);
    try {
      await deleteDocument(document.doc_id);
      alert("Documento excluído.");
      onClose();
      if (onDeleteSuccess) onDeleteSuccess();
    } catch (err: any) {
      alert(err.message || "Erro ao excluir.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const msg = chatInput;
    setChatInput("");
    setMessages(p => [...p, { role: "user", content: msg }]);
    setChatLoading(true);

    try {
      const res = await sendDocumentChatMessage(document.doc_id, msg);
      setMessages(p => [...p, { role: "ai", content: res.reply }]);
    } catch (err) {
      setMessages(p => [...p, { role: "ai", content: "Erro de conexão." }]);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  return (
    <div onClick={handleBackdropClick} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row animate-in zoom-in-95 duration-200 border border-slate-200">
        
        {/* VISUALIZAÇÃO */}
        <div className="w-full lg:w-2/3 bg-slate-100 relative flex items-center justify-center p-6 border-r border-slate-200 group">
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]"></div>
          <img src={document.preview_url} alt="Visualização" className="max-h-full max-w-full object-contain shadow-lg rounded border border-slate-200 transition-transform duration-300 group-hover:scale-[1.01]" />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm border border-slate-200 flex items-center gap-2 z-10">
            <Eye className="w-3 h-3 text-slate-400" /> Visualizando Página {document.page_number}
          </div>
          {canDelete && (
            <button onClick={handleDelete} disabled={isDeleting} className="absolute top-4 left-4 p-3 bg-white/90 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl shadow-sm border border-slate-200 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50 z-20" title="Excluir Documento">
              {isDeleting ? <Loader2 className="w-5 h-5 animate-spin"/> : <Trash2 className="w-5 h-5"/>}
            </button>
          )}
        </div>

        {/* PAINEL DIREITO */}
        <div className="w-full lg:w-1/3 flex flex-col bg-white">
          
          <div className="p-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
            <div className="overflow-hidden pr-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-600 uppercase tracking-wider">{document.doc_type || "Geral"}</span>
                <span className="text-[10px] text-slate-400 font-mono">{formatDateOnly(document.created_at)}</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 truncate" title={document.document_title}>{document.document_title}</h2>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={handleShare} className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors relative" title="Compartilhar">
                {isSharing ? <Loader2 className="w-5 h-5 animate-spin"/> : <Share2 className="w-5 h-5"/>}
                {shareUrl && <span className="absolute top-10 right-0 bg-green-600 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap animate-in fade-in zoom-in">Link Copiado!</span>}
              </button>
              <button onClick={onClose} className="p-2 hover:bg-slate-200 text-slate-400 hover:text-slate-900 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="flex border-b border-slate-100">
            <button onClick={() => setActiveTab("details")} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === "details" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
              <Info className="w-4 h-4"/> Detalhes
            </button>
            <button onClick={() => setActiveTab("chat")} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === "chat" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
              <MessageSquare className="w-4 h-4"/> Chat IA
            </button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col relative">
            
            {/* ABA DETALHES (SEM OCR) */}
            {activeTab === "details" && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Metadados</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-xs text-slate-500">Data Ingestão</span>
                      <span className="text-sm font-medium text-slate-900 flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {formatDateOnly(document.created_at)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-xs text-slate-500">Score Relevância</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">{document.score.toFixed(0)}% Match</span>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mt-4">
                    <h4 className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-2"><Bot className="w-4 h-4"/> Análise Inteligente</h4>
                    <p className="text-xs text-blue-700 leading-relaxed">Use a aba "Chat IA" para fazer perguntas sobre este documento.</p>
                  </div>
                </div>
              </div>
            )}

            {/* ABA CHAT */}
            {activeTab === "chat" && (
              <div className="flex-1 flex flex-col overflow-hidden animate-in slide-in-from-right-4 fade-in duration-300">
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/30">
                  {messages.length === 0 && (
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-xs text-blue-800 leading-relaxed">
                      <strong>💡 Assistente IA:</strong> Olá! Li este documento. Pode me perguntar sobre valores, datas ou nomes.
                    </div>
                  )}
                  {messages.map((m, i) => (
                    <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-blue-600'}`}>
                        {m.role === 'user' ? <User className="w-4 h-4"/> : <Bot className="w-4 h-4"/>}
                      </div>
                      <div className={`p-3 rounded-2xl text-sm max-w-[85%] ${m.role === 'user' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white border border-slate-200 shadow-sm text-slate-700 rounded-tl-none'}`}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {chatLoading && <div className="flex gap-3"><div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center"><Loader2 className="w-4 h-4 animate-spin text-blue-600"/></div></div>}
                </div>
                <div className="p-4 border-t border-slate-100 bg-white">
                  <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                    <input type="text" placeholder="Pergunte algo..." className="flex-1 pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" value={chatInput} onChange={e => setChatInput(e.target.value)}/>
                    <button type="submit" disabled={chatLoading || !chatInput.trim()} className="p-3 bg-slate-900 text-white rounded-xl hover:bg-black disabled:opacity-50 transition-colors shadow-md"><Send className="w-4 h-4" /></button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* RODAPÉ */}
          <div className="p-4 border-t border-slate-100 bg-white flex gap-3">
            <button onClick={handlePrint} className="flex-1 flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 py-2.5 rounded-lg font-bold hover:bg-slate-50 hover:border-slate-300 transition-all text-xs"><Printer className="w-4 h-4" /> Imprimir</button>
            <button onClick={handleDownload} disabled={isDownloading} className="flex-[1.5] flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 rounded-lg font-bold hover:bg-black transition-all shadow-md active:translate-y-0.5 text-xs disabled:opacity-70">
              {isDownloading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4" />} {isDownloading ? "Baixando..." : "Baixar"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}