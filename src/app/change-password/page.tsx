"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2, CheckCircle } from "lucide-react";
import { changePassword } from "@/lib/api";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      alert("As senhas não coincidem!");
      return;
    }
    
    setLoading(true);
    try {
      await changePassword(password);
      // Limpa token para forçar re-login com nova senha (opcional, mas seguro)
      localStorage.clear();
      alert("Senha definida com sucesso! Por favor, entre novamente.");
      router.push("/login");
    } catch (err) {
      console.error(err);
      alert("Erro ao trocar senha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl animate-in zoom-in duration-300">
        <div className="text-center mb-8">
          <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-600">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Definir Senha Pessoal</h1>
          <p className="text-slate-500 text-sm mt-2">
            Por segurança, você deve alterar a senha padrão (CNPJ) para uma senha pessoal no primeiro acesso.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nova Senha</label>
            <input 
              type="password" required minLength={6}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="Mínimo 6 caracteres"
              value={password} onChange={e => setPassword(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Senha</label>
            <input 
              type="password" required minLength={6}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
              value={confirm} onChange={e => setConfirm(e.target.value)} 
            />
          </div>
          <button 
            type="submit" disabled={loading} 
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all flex justify-center"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Salvar Senha"}
          </button>
        </form>
      </div>
    </div>
  );
}