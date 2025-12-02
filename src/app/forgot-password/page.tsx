"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, KeyRound, Lock, ArrowRight, CheckCircle2, Loader2, ChevronLeft } from "lucide-react";
import { requestPasswordReset, verifyResetCode, confirmPasswordReset } from "@/lib/api";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Dados do formulário
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");

  // PASSO 1: Enviar Email
  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await requestPasswordReset(email);
      setStep(2);
    } catch (err) {
      setError("Erro ao enviar código. Verifique o email.");
    } finally {
      setLoading(false);
    }
  }

  // PASSO 2: Verificar Código
  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await verifyResetCode(email, code);
      setResetToken(data.reset_token); // Guarda o token temporário
      setStep(3);
    } catch (err) {
      setError("Código incorreto ou expirado.");
    } finally {
      setLoading(false);
    }
  }

  // PASSO 3: Nova Senha
  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await confirmPasswordReset(resetToken, newPassword);
      alert("Senha redefinida com sucesso!");
      router.push("/login");
    } catch (err) {
      setError("Erro ao redefinir senha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        
        <div className="bg-slate-900 p-6 text-white flex items-center gap-4">
          {step > 1 && (
            <button onClick={() => setStep((s) => Math.max(1, s - 1) as any)} className="hover:bg-white/20 p-1 rounded transition">
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold">Recuperação de Senha</h1>
            <p className="text-slate-400 text-xs mt-1">Passo {step} de 3</p>
          </div>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"/> {error}
            </div>
          )}

          {/* PASSO 1: EMAIL */}
          {step === 1 && (
            <form onSubmit={handleRequestCode} className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6" />
                </div>
                <p className="text-slate-600 text-sm">Digite seu email corporativo para receber o código de verificação.</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email</label>
                <input 
                  type="email" required 
                  className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-900/10 transition-all"
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@empresa.com"
                />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-black transition-all flex justify-center items-center gap-2">
                {loading ? <Loader2 className="animate-spin w-4 h-4"/> : <>Enviar Código <ArrowRight className="w-4 h-4"/></>}
              </button>
              <div className="text-center">
                <Link href="/login" className="text-sm text-slate-400 hover:text-slate-600">Voltar para Login</Link>
              </div>
            </form>
          )}

          {/* PASSO 2: CÓDIGO */}
          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <KeyRound className="w-6 h-6" />
                </div>
                <p className="text-slate-600 text-sm">Digite o código de 6 dígitos enviado para <strong>{email}</strong></p>
                <p className="text-xs text-amber-600 mt-2 font-medium bg-amber-50 inline-block px-2 py-1 rounded">(Verifique o log do terminal da VPS)</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Código de Verificação</label>
                <input 
                  type="text" required maxLength={6}
                  className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-900/10 transition-all text-center text-2xl tracking-widest font-mono"
                  value={code} onChange={e => setCode(e.target.value)}
                  placeholder="000000"
                />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-black transition-all flex justify-center items-center gap-2">
                {loading ? <Loader2 className="animate-spin w-4 h-4"/> : "Verificar"}
              </button>
            </form>
          )}

          {/* PASSO 3: NOVA SENHA */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-slate-600 text-sm">Código validado. Crie sua nova senha segura.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Nova Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="password" required minLength={6}
                      className="w-full pl-10 p-3 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-900/10 transition-all"
                      value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Confirmar Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="password" required minLength={6}
                      className="w-full pl-10 p-3 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-900/10 transition-all"
                      value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-black transition-all flex justify-center items-center gap-2">
                {loading ? <Loader2 className="animate-spin w-4 h-4"/> : "Redefinir Senha"}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}