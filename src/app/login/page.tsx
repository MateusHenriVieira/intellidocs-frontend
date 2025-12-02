"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, ArrowRight, ShieldCheck, Globe } from "lucide-react";
import { loginUser } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await loginUser(email, password);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user_role", data.role);
      localStorage.setItem("user_name", data.user_name);

      if (data.must_change_password) { router.push("/change-password"); return; }
      if (data.role === "super_admin") { router.push("/admin/tenants"); return; }
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Credenciais inválidas.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex w-full bg-white">
      
      {/* LADO ESQUERDO - BRANDING INSTITUCIONAL */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative flex-col justify-between p-12 text-white overflow-hidden">
        {/* Background Abstract Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-white/10 backdrop-blur rounded flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-xl font-bold tracking-tight">IntelliDocs A4</span>
          </div>
          <p className="text-slate-400 text-sm">Plataforma Unificada de Gestão Documental</p>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="text-4xl font-bold leading-tight mb-6">Digitalização segura e inteligência de dados para o setor público.</h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            "A tecnologia de OCR e IA do IntelliDocs reduziu em 80% o tempo de auditoria de contas públicas."
          </p>
          <div className="mt-6 flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1,2,3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-xs font-medium">
                  U{i}
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-400">Usado por +50 prefeituras</p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6 text-xs text-slate-500 font-medium uppercase tracking-wider">
          <span>© 2025 IntelliDocs Inc.</span>
          <span>Privacidade</span>
          <span>Termos</span>
        </div>
      </div>

      {/* LADO DIREITO - FORMULÁRIO */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-[420px] bg-white p-10 rounded-2xl shadow-[0_2px_40px_-10px_rgba(0,0,0,0.08)] border border-slate-200">
          
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Acesso ao Painel</h1>
            <p className="text-slate-500 text-sm">Insira suas credenciais corporativas para continuar.</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <ShieldCheck className="w-4 h-4" /> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">ID Corporativo ou Email</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-3 text-slate-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
                <input 
                  type="text" required
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium"
                  placeholder="ex: 00.000.000/0001-91"
                  value={email} onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Senha</label>
                
                <a href="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline">Esqueceu?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-3 text-slate-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
                <input 
                  type="password" required
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium"
                  placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-lg font-bold text-sm tracking-wide transition-all shadow-lg shadow-slate-900/10 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>ACESSAR SISTEMA <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <div className="inline-flex items-center gap-2 text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
              <Globe className="w-3 h-3" />
              Ambiente Seguro | SSL 256-bit
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}