"use client";

import { useState, useRef, useEffect } from "react";
import { 
  X, Calendar, Download, Eye, Printer, 
  Loader2, Share2, Trash2, MessageSquare, Info, Send, User, Bot,
  AlertTriangle, CheckCircle2, Search, XCircle, Globe, Link as LinkIcon, ExternalLink
} from "lucide-react";
import { 
  SearchResult, 
  getDownloadUrl, 
  createShareLink, 
  deleteDocument, 
  sendDocumentChatMessage,
  getDocumentPageMetadata,
  getDocumentLinks, // <--- NOVO IMPORT
  OCRWord
} from "@/lib/api";
import { formatDateOnly } from "@/lib/utils";

// Defina a URL base aqui ou importe de um config
const API_BASE_URL = "http://149.56.128.99:8000";

interface DocumentModalProps {
  document: SearchResult;
  onClose: () => void;
  onDeleteSuccess?: () => void;
  initialSearchTerm?: string;
}

interface ChatMessage {
  role: "user" | "ai";
  content: string;
}

export function DocumentModal({ document, onClose, onDeleteSuccess, initialSearchTerm = "" }: DocumentModalProps) {
  // Estados de UI
  const [activeTab, setActiveTab] = useState<"details" | "chat">("details");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  // Estados de Highlight
  const [metadata, setMetadata] = useState<OCRWord[]>([]);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm); 
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

  // Estados de Auto-Vínculo (NOVO)
  const [links, setLinks] = useState<any[]>([]);

  // Estados do Chat
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Permissões
  const [userRole, setUserRole] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setUserRole(localStorage.getItem("user_role"));
    setToken(localStorage.getItem("token"));
    
    // Carrega metadados e links ao abrir
    loadMetadata();
  }, []);

  async function loadMetadata() {
    try {
      // 1. Carrega Highlight
      const data = await getDocumentPageMetadata(document.doc_id, document.page_number);
      setMetadata(data);
      
      // 2. Carrega Auto-Links (NOVO)
      const linksData = await getDocumentLinks(document.doc_id);
      setLinks(linksData);
    } catch (e) { console.error("Erro ao carregar dados", e); }
  }

  const canDelete = ["admin", "super_admin", "gestor"].includes(userRole || "");

  // --- LÓGICA DE HIGHLIGHT (Responsivo) ---
  const handleImageLoad = (e: any) => {
    setImageDimensions({
      width: e.target.clientWidth,
      height: e.target.clientHeight,
      naturalWidth: e.target.naturalWidth,
      naturalHeight: e.target.naturalHeight
    });
  };

  useEffect(() => {
    const handleResize = () => {
      if (imageRef.current) {
        setImageDimensions({
          width: imageRef.current.clientWidth,
          height: imageRef.current.clientHeight,
          naturalWidth: imageRef.current.naturalWidth,
          naturalHeight: imageRef.current.naturalHeight
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- AÇÕES ---

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleDownload = () => {
    setIsDownloading(true);
    try {
      const downloadUrl = getDownloadUrl(document.preview_url);
      if (downloadUrl) window.location.href = downloadUrl;
      else alert("URL inválida.");
    } catch (error) { alert("Erro download."); } 
    finally { setTimeout(() => setIsDownloading(false), 1500); }
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
    } catch (error) { alert("Erro ao gerar link."); } 
    finally { setIsSharing(false); }
  };

  const handleDelete = async () => {
    if (!confirm("ATENÇÃO: Excluir este documento apagará todas as páginas permanentemente.")) return;
    setIsDeleting(true);
    try {
      await deleteDocument(document.doc_id);
      alert("Documento excluído.");
      onClose();
      if (onDeleteSuccess) onDeleteSuccess();
    } catch (err: any) { alert(err.message || "Erro ao excluir."); } 
    finally { setIsDeleting(false); }
  };

  const handlePublish = async () => {
    if (!confirm(
      "CONFIRMAR PUBLICAÇÃO (LGPD)?\n\n" +
      "O sistema irá:\n" +
      "1. Buscar CPFs e Emails automaticamente.\n" +
      "2. Aplicar tarja preta (censura) definitiva nas cópias públicas.\n" +
      "3. Enviar para o Portal da Transparência.\n\n" +
      "Essa ação gera um link público permanente."
    )) return;
    
    setIsPublishing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/public/publish/${document.doc_id}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert(`SUCESSO!\n\nDocumento publicado no Portal.\nProteção LGPD aplicada em ${data.redacted_pages} páginas.`);
        if (data.public_url) navigator.clipboard.writeText(`${window.location.origin}${data.public_url}`);
        onClose(); 
      } else {
        alert("Erro: " + (data.detail || "Falha ao publicar"));
      }
    } catch (e) {
      alert("Erro de conexão ao publicar.");
    } finally {
      setIsPublishing(false);
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
    } catch (err) { setMessages(p => [...p, { role: "ai", content: "Erro conexão." }]); } 
    finally { setChatLoading(false); }
  };

  // Função para abrir link citado
  const handleOpenLink = (targetId: number) => {
     // Abre em nova aba para não perder o contexto atual
     window.open(`/documents?id=${targetId}`, '_blank');
  };

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  const getValidityStatus = (dateStr: string | undefined) => {
    if (!dateStr) return null;
    const today = new Date();
    const expDate = new Date(dateStr);
    const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: "Vencido", color: "bg-red-50 text-red-700 border-red-100", icon: AlertTriangle };
    if (diffDays < 30) return { label: `Vence em ${diffDays} dias`, color: "bg-amber-50 text-amber-700 border-amber-100", icon: AlertTriangle };
    return { label: "Vigente", color: "bg-green-50 text-green-700 border-green-100", icon: CheckCircle2 };
  };

  return (
    <div onClick={handleBackdropClick} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row animate-in zoom-in-95 duration-200 border border-slate-200">
        
        {/* --- VISUALIZAÇÃO COM HIGHLIGHT --- */}
        <div className="w-full lg:w-2/3 bg-slate-100 relative flex items-center justify-center p-6 border-r border-slate-200 group overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]"></div>
          
          <div className="relative max-h-full max-w-full shadow-lg rounded border border-slate-200 bg-white">
            <img 
              ref={imageRef}
              src={document.preview_url} 
              alt="Documento" 
              className="max-h-[85vh] max-w-full object-contain"
              onLoad={handleImageLoad}
            />

            {/* HIGHLIGHT */}
            {metadata.length > 0 && searchTerm.length > 2 && (
              <div className="absolute inset-0 pointer-events-none">
                {metadata.map((word, i) => {
                  if (word.t.toLowerCase().includes(searchTerm.toLowerCase())) {
                    const scaleX = imageDimensions.width / imageDimensions.naturalWidth;
                    const scaleY = imageDimensions.height / imageDimensions.naturalHeight;
                    if (!scaleX || !scaleY) return null;

                    return (
                      <div
                        key={i}
                        className="absolute bg-yellow-400/40 border-b-2 border-yellow-600 mix-blend-multiply"
                        style={{
                          left: word.b[0] * scaleX,
                          top: word.b[1] * scaleY,
                          width: (word.b[2] - word.b[0]) * scaleX,
                          height: (word.b[3] - word.b[1]) * scaleY,
                        }}
                      />
                    );
                  }
                  return null;
                })}
              </div>
            )}
          </div>

          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex gap-2 w-full max-w-sm px-4">
             <div className="relative flex-1 group/search">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/search:text-blue-500 transition-colors"/>
                <input 
                  className="w-full pl-10 pr-10 py-2.5 rounded-full border border-slate-200 bg-white/90 backdrop-blur shadow-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
                  placeholder="Localizar na página (Highlight)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><XCircle className="w-4 h-4" /></button>
                )}
             </div>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm border border-slate-200 flex items-center gap-2 z-10">
            <Eye className="w-3 h-3 text-slate-400" /> Pág {document.page_number}
          </div>

          {canDelete && (
            <button onClick={handleDelete} disabled={isDeleting} className="absolute bottom-6 right-6 p-3 bg-white/90 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl shadow-sm border border-slate-200 transition-all z-20" title="Excluir">
              {isDeleting ? <Loader2 className="w-5 h-5 animate-spin"/> : <Trash2 className="w-5 h-5"/>}
            </button>
          )}
        </div>

        {/* --- PAINEL DIREITO --- */}
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
              <button onClick={handleShare} className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors relative">
                {isSharing ? <Loader2 className="w-5 h-5 animate-spin"/> : <Share2 className="w-5 h-5"/>}
                {shareUrl && <span className="absolute top-10 right-0 bg-green-600 text-white text-[10px] px-2 py-1 rounded shadow-lg animate-in fade-in zoom-in">Copiado!</span>}
              </button>
              <button onClick={onClose} className="p-2 hover:bg-slate-200 text-slate-400 hover:text-slate-900 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="flex border-b border-slate-100">
            <button onClick={() => setActiveTab("details")} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === "details" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"}`}><Info className="w-4 h-4"/> Detalhes</button>
            <button onClick={() => setActiveTab("chat")} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === "chat" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}><MessageSquare className="w-4 h-4"/> Chat IA</button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col relative">
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
                    
                    {(document as any).expiration_date && (() => {
                        const status = getValidityStatus((document as any).expiration_date);
                        if (!status) return null;
                        return (
                            <div className={`flex justify-between items-center p-3 rounded-lg border ${status.color.replace("bg-", "border-")}`}>
                                <span className="text-xs font-bold uppercase tracking-wider opacity-80">Validade</span>
                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold ${status.color}`}>
                                    <status.icon className="w-3 h-3" /> {new Date((document as any).expiration_date).toLocaleDateString('pt-BR')} ({status.label})
                                </span>
                            </div>
                        );
                    })()}
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mt-4">
                    <h4 className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-2"><Bot className="w-4 h-4"/> IA Insights</h4>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      Este documento foi indexado com {metadata.length > 0 ? metadata.length : '...'} palavras reconhecidas. Use a busca acima para realçar termos.
                    </p>
                  </div>

                  {/* SEÇÃO AUTO-VÍNCULO (NOVA) */}
                  {links.length > 0 && (
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 mt-4">
                        <h4 className="text-xs font-bold text-purple-800 mb-3 flex items-center gap-2">
                            <LinkIcon className="w-4 h-4"/> Documentos Citados (Auto-Link)
                        </h4>
                        <div className="space-y-2">
                            {links.map((link, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg border border-purple-100 shadow-sm hover:border-purple-300 transition-all cursor-pointer group" onClick={() => handleOpenLink(link.target_id)}>
                                    <div>
                                        <p className="text-xs font-bold text-slate-700 group-hover:text-purple-700 flex items-center gap-1">
                                            {link.target_title}
                                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"/>
                                        </p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">
                                            Citado na pág. {link.page}: "{link.mention}"
                                        </p>
                                    </div>
                                    <span className="text-[10px] px-2 py-1 bg-slate-100 rounded text-slate-600 font-bold uppercase">{link.target_type || "Doc"}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {activeTab === "chat" && (
              <div className="flex-1 flex flex-col overflow-hidden animate-in slide-in-from-right-4 fade-in duration-300">
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/30">
                  {messages.length === 0 && <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-xs text-blue-800 leading-relaxed"><strong>💡 Assistente IA:</strong> Pergunte sobre valores, datas e nomes.</div>}
                  {messages.map((m, i) => (
                    <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-blue-600'}`}>{m.role === 'user' ? <User className="w-4 h-4"/> : <Bot className="w-4 h-4"/>}</div>
                      <div className={`p-3 rounded-2xl text-sm max-w-[85%] ${m.role === 'user' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white border border-slate-200 shadow-sm text-slate-700 rounded-tl-none'}`}>{m.content}</div>
                    </div>
                  ))}
                  {chatLoading && <div className="flex gap-3"><Loader2 className="w-8 h-8 animate-spin text-blue-600"/></div>}
                </div>
                <div className="p-4 border-t border-slate-100 bg-white">
                  <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                    <input type="text" placeholder="Pergunte algo..." className="flex-1 pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" value={chatInput} onChange={e => setChatInput(e.target.value)}/>
                    <button type="submit" disabled={chatLoading || !chatInput.trim()} className="p-3 bg-slate-900 text-white rounded-xl hover:bg-black disabled:opacity-50"><Send className="w-4 h-4" /></button>
                  </form>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-100 bg-white flex gap-3">
            {canDelete && (
                <button 
                    onClick={handlePublish} 
                    disabled={isPublishing}
                    className="flex-[2] flex items-center justify-center gap-2 bg-emerald-600 text-white py-2.5 rounded-lg font-bold hover:bg-emerald-700 transition-all shadow-md text-xs disabled:opacity-70"
                    title="Publicar com Tarja Preta (LGPD)"
                >
                    {isPublishing ? <Loader2 className="w-4 h-4 animate-spin"/> : <Globe className="w-4 h-4" />}
                    {isPublishing ? "Sanitizando..." : "Publicar no Portal"}
                </button>
            )}

            <button onClick={handlePrint} className="flex-1 flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 py-2.5 rounded-lg font-bold hover:bg-slate-50 text-xs"><Printer className="w-4 h-4" /></button>
            <button onClick={handleDownload} disabled={isDownloading} className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 rounded-lg font-bold hover:bg-black transition-all shadow-md text-xs disabled:opacity-70">{isDownloading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4" />}</button>
          </div>
        </div>
      </div>
    </div>
  );
}