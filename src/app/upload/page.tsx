"use client";

import { useState, useCallback, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { uploadDocument } from "@/lib/api";
import { UploadCloud, FileText, CheckCircle2, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();
  
  // --- BLOQUEIO DE SEGURANÇA (CONSULTOR) ---
  useEffect(() => {
    const role = localStorage.getItem("user_role");
    // Se não estiver logado vai pro login, se for consultor vai pra home
    if (!role) {
      router.push("/login");
    } else if (role === "consultor") {
      router.push("/"); 
      alert("Acesso Negado: Consultores não podem enviar documentos.");
    }
  }, [router]);
  // -----------------------------------------

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [docId, setDocId] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "application/pdf") {
      setFile(droppedFile);
      if (!title) setTitle(droppedFile.name.replace(".pdf", ""));
    } else { alert("Apenas PDF."); }
  }, [title]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!title) setTitle(selectedFile.name.replace(".pdf", ""));
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !title) return;
    setStatus("uploading");
    setErrorMessage("");
    try {
      const response = await uploadDocument(file, title);
      setDocId(response.document_id);
      setStatus("success");
    } catch (error: any) {
      setErrorMessage(error.message || "Falha ao enviar documento.");
      setStatus("error");
    }
  }

  const handleReset = () => { setFile(null); setTitle(""); setStatus("idle"); setDocId(null); };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 flex flex-col">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Novo Documento</h1>
          <p className="text-slate-500">Digitalize decretos, notas e contratos para a base de IA.</p>
        </header>

        <div className="flex-1 flex items-center justify-center pb-20">
          <div className="w-full max-w-2xl">
            {status === "success" ? (
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-12 text-center animate-in zoom-in duration-300">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Upload Realizado!</h2>
                <p className="text-slate-500 text-lg mb-8 max-w-md mx-auto">
                  O documento <strong>#{docId}</strong> foi enviado e a IA já está processando.
                </p>
                <div className="flex gap-4 justify-center">
                  <button onClick={handleReset} className="px-6 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-bold border border-slate-200 transition-colors">Enviar Outro</button>
                  <button onClick={() => router.push("/search")} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2">Ver na Busca <ArrowRight className="w-5 h-5" /></button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm text-blue-600"><UploadCloud className="w-6 h-6" /></div>
                  <h3 className="font-bold text-slate-700">Formulário de Ingestão</h3>
                </div>
                <div className="p-8 space-y-8">
                  {status === "error" && <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 border border-red-100 animate-in shake"><AlertCircle className="w-5 h-5 flex-shrink-0" /><p className="text-sm font-medium">{errorMessage}</p></div>}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ease-in-out cursor-pointer group ${isDragging ? "border-blue-500 bg-blue-50/50 scale-[1.02]" : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"} ${file ? "bg-blue-50/30 border-blue-200" : ""}`}>
                      <input type="file" accept=".pdf" onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      {file ? (
                        <div className="animate-in fade-in zoom-in duration-300">
                          <div className="w-16 h-16 bg-white shadow-md rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600"><FileText className="w-8 h-8" /></div>
                          <p className="font-bold text-slate-800 text-lg mb-1">{file.name}</p>
                          <p className="text-slate-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          <button type="button" onClick={(e) => {e.preventDefault(); setFile(null);}} className="mt-4 text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors z-20 relative">Remover arquivo</button>
                        </div>
                      ) : (
                        <div className="pointer-events-none">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 group-hover:text-blue-500 group-hover:bg-white group-hover:shadow-md transition-all"><UploadCloud className="w-8 h-8" /></div>
                          <p className="text-lg font-semibold text-slate-700 mb-1">Arraste e solte o PDF aqui</p>
                          <p className="text-slate-400 text-sm">ou clique para navegar nos arquivos</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Título do Documento <span className="text-red-500">*</span></label>
                        <input type="text" required placeholder="Ex: Extrato Banco do Brasil - Dezembro 2024" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-700" value={title} onChange={(e) => setTitle(e.target.value)} />
                      </div>
                    </div>
                    <button type="submit" disabled={status === "uploading" || !file || !title} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-slate-200 hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0">
                      {status === "uploading" ? <><Loader2 className="w-6 h-6 animate-spin"/> Processando com IA...</> : <><UploadCloud className="w-6 h-6" /> Iniciar Processamento</>}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}