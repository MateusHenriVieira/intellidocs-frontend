"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { DocumentModal } from "@/components/DocumentModal";
import { searchDocuments, SearchResult, deleteDocument, getDocumentTypes } from "@/lib/api";
import { FileText, Loader2, Trash2, Eye, Calendar, Tag, Filter, Building2 } from "lucide-react";

export default function DocumentsPage() {
  const [docs, setDocs] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<SearchResult | null>(null);
  
  // Filtros Locais
  const [filterType, setFilterType] = useState("Todos");
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    setUserRole(localStorage.getItem("user_role"));
    initData();
  }, []);

  async function initData() {
    setLoading(true);
    try {
      const [docsData, typesData] = await Promise.all([
        searchDocuments(""),
        getDocumentTypes()
      ]);
      
      setDocs(docsData);
      setAvailableTypes(typesData);
      
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(docId: number, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Tem certeza que deseja excluir este documento permanentemente? Todas as páginas serão removidas.")) return;

    try {
      await deleteDocument(docId);
      // Remove da lista visualmente (filtra tudo que tem aquele ID)
      setDocs(prev => prev.filter(d => d.doc_id !== docId));
    } catch (err: any) {
      alert("Erro ao excluir: " + err.message);
    }
  }

  const canDelete = ["admin", "super_admin", "gestor"].includes(userRole || "");

  const filteredDocs = docs.filter(d => filterType === "Todos" || d.doc_type === filterType);

  return (
    <div className="flex bg-[#F8F9FC] min-h-screen font-sans text-slate-900">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8 lg:p-12">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-1">Arquivo Digital</h1>
              <p className="text-slate-500">Gerencie os documentos da sua unidade.</p>
            </div>
            
            <div className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
              <div className="px-3 py-2 text-slate-400">
                <Filter className="w-4 h-4" />
              </div>
              <select 
                className="bg-transparent text-sm font-medium text-slate-700 outline-none pr-4 py-2 cursor-pointer min-w-[180px]"
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
              >
                <option value="Todos">Todos os Tipos</option>
                {availableTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="p-20 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-900 mb-4"/>
                <p className="text-slate-500">Carregando arquivo...</p>
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="p-20 text-center text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-20"/>
                <p>Nenhum documento encontrado.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider pl-6">Documento</th>
                    <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Página</th> {/* Nova Coluna */}
                    <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo</th>
                    <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Data</th>
                    <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right pr-6">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDocs.map((doc) => (
                    <tr 
                      // --- CORREÇÃO AQUI: Chave Única composta ---
                      key={`${doc.doc_id}-${doc.page_number}`} 
                      // ------------------------------------------
                      onClick={() => setSelectedDoc(doc)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      <td className="p-5 pl-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 font-bold text-xs group-hover:bg-white group-hover:shadow-sm transition-all">
                            PDF
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm truncate max-w-[300px]">{doc.document_title}</p>
                            {["admin", "super_admin"].includes(userRole || "") && (
                                <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                                    <Building2 className="w-3 h-3"/> {(doc as any).department || "Geral"}
                                </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-5 text-sm text-slate-500">
                         Pág {doc.page_number}
                      </td>
                      
                      <td className="p-5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wide">
                          <Tag className="w-3 h-3" /> {doc.doc_type || "Geral"}
                        </span>
                      </td>
                      
                      <td className="p-5 text-sm text-slate-500 font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {new Date(doc.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      
                      <td className="p-5 text-right pr-6">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Visualizar"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {canDelete && (
                            <button 
                              onClick={(e) => handleDelete(doc.doc_id, e)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Excluir Documento Inteiro"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="mt-4 text-right text-xs text-slate-400">
            Mostrando {filteredDocs.length} páginas encontradas
          </div>

        </div>
      </main>

      {/* Modal de Visualização */}
      {selectedDoc && (
        <DocumentModal 
          document={selectedDoc} 
          onClose={() => setSelectedDoc(null)} 
          onDeleteSuccess={() => {
             // Remove todas as páginas desse documento da lista
             setDocs(prev => prev.filter(d => d.doc_id !== selectedDoc.doc_id));
             setSelectedDoc(null);
          }}
        />
      )}
    </div>
  );
}