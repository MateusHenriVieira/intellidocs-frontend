"use client";
import { useState, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { uploadDocument } from "@/lib/api";
import { UploadCloud, FileText, Check, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "application/pdf") {
      setFile(droppedFile);
      if (!title) setTitle(droppedFile.name.replace(".pdf", ""));
    }
  }, [title]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !title) return;
    setStatus("uploading");
    try {
      await uploadDocument(file, title);
      setStatus("success");
    } catch (error: any) {
      setErrorMessage(error.message);
      setStatus("error");
    }
  }

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-900">
      <Sidebar />
      <main className="flex-1 ml-64 p-10 flex flex-col">
        <header className="mb-10 pb-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold">Nova Digitalização</h1>
          <p className="text-slate-500 mt-1">Adicione documentos à base de conhecimento.</p>
        </header>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-2xl">
            {status === "success" ? (
              <div className="bg-white p-12 rounded-xl border border-slate-200 text-center shadow-sm">
                <div className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Processamento Iniciado</h2>
                <p className="text-slate-500 mb-8">O documento foi enviado para a fila de OCR e Inteligência Artificial.</p>
                <div className="flex justify-center gap-4">
                  <button onClick={() => { setStatus("idle"); setFile(null); setTitle(""); }} className="px-6 py-2.5 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">Novo Upload</button>
                  <button onClick={() => router.push("/search")} className="px-6 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-black transition-colors">Ir para Busca</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                {status === "error" && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 flex gap-2"><AlertCircle className="w-5 h-5"/> {errorMessage}</div>
                )}
                
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer ${file ? 'border-slate-400 bg-slate-50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'}`}
                >
                  <input type="file" accept=".pdf" onChange={(e) => { if(e.target.files?.[0]) { setFile(e.target.files[0]); if(!title) setTitle(e.target.files[0].name.replace(".pdf","")); }}} className="hidden" id="file-upload" />
                  <label htmlFor="file-upload" className="cursor-pointer block">
                    {file ? (
                      <div className="text-slate-800">
                        <FileText className="w-10 h-10 mx-auto mb-3 text-slate-900"/>
                        <p className="font-semibold">{file.name}</p>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-10 h-10 mx-auto mb-3 text-slate-400"/>
                        <p className="text-slate-600 font-medium">Arraste seu PDF aqui</p>
                        <p className="text-xs text-slate-400 mt-1">ou clique para selecionar</p>
                      </>
                    )}
                  </label>
                </div>

                <div className="mt-6 mb-8">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Título do Documento</label>
                  <input required type="text" className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all text-sm" placeholder="Ex: Decreto Municipal 123/2024" value={title} onChange={e => setTitle(e.target.value)} />
                </div>

                <button type="submit" disabled={!file || status === "uploading"} className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-black transition-all disabled:opacity-50 flex justify-center gap-2">
                  {status === "uploading" ? <><Loader2 className="animate-spin w-5 h-5"/> Enviando...</> : "Iniciar Processamento"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}