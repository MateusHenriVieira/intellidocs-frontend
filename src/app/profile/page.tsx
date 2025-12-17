"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { getUserProfile, UserProfile } from "@/lib/api";
import { 
  User, Mail, Briefcase, Building2, Shield, 
  FileText, Layers, Loader2, Lock, LogOut, 
  Key, Plus, Trash2, Copy, Check, AlertTriangle, X
} from "lucide-react";
import { useRouter } from "next/navigation";

// --- Configuração API Local ---
const API_BASE_URL = "http://149.56.128.99:8000";

const getAuthHeaders = (): Record<string, string> => {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  if (token) {
    return { "Authorization": `Bearer ${token}` };
  }
  return {};
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados para Integração (Chaves)
  const [keys, setKeys] = useState<any[]>([]);
  const [newKeyLabel, setNewKeyLabel] = useState("");
  const [loadingKeys, setLoadingKeys] = useState(false);

  // Estado para o Modal de Chave Gerada
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [keyCopied, setKeyCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await getUserProfile();
      setProfile(data);

      // Carrega as chaves de integração
      const keysRes = await fetch(`${API_BASE_URL}/integrations/keys`, { headers: getAuthHeaders() });
      if (keysRes.ok) setKeys(await keysRes.json());

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, { method: "POST", headers: getAuthHeaders() });
    } catch (e) {}
    localStorage.clear();
    router.push("/login");
  };

  const formatRole = (role: string) => {
    const map: Record<string, string> = {
      super_admin: "Super Administrador",
      admin: "Administrador TI",
      gestor: "Secretário / Gestor",
      consultor: "Consultor",
      alimentador: "Operador de Scanner"
    };
    return map[role] || role;
  };

  const getRoleColor = (role: string) => {
    if (role === 'super_admin' || role === 'admin') return 'bg-purple-100 text-purple-700 border-purple-200';
    if (role === 'gestor') return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  // --- FUNÇÕES DE INTEGRAÇÃO ---
  async function createKey(e: React.FormEvent) {
    e.preventDefault();
    if (!newKeyLabel.trim()) return;

    setLoadingKeys(true);
    const formData = new FormData();
    formData.append("label", newKeyLabel);

    try {
      const res = await fetch(`${API_BASE_URL}/integrations/keys`, {
        method: "POST", headers: getAuthHeaders(), body: formData
      });

      if (res.ok) {
        const data = await res.json();
        
        // AQUI ESTÁ A MUDANÇA: Em vez de alert(), salvamos no estado para abrir o modal
        setGeneratedKey(data.key);
        setKeyCopied(false);
        
        // Recarrega lista
        const keysRes = await fetch(`${API_BASE_URL}/integrations/keys`, { headers: getAuthHeaders() });
        if (keysRes.ok) setKeys(await keysRes.json());
        
        setNewKeyLabel("");
      }
    } catch (e) {
      alert("Erro ao criar chave.");
    } finally {
      setLoadingKeys(false);
    }
  }

  async function deleteKey(id: number) {
    if (!confirm("Revogar este acesso? O computador conectado parará de enviar arquivos.")) return;
    
    await fetch(`${API_BASE_URL}/integrations/keys/${id}`, { method: "DELETE", headers: getAuthHeaders() });
    
    const keysRes = await fetch(`${API_BASE_URL}/integrations/keys`, { headers: getAuthHeaders() });
    if (keysRes.ok) setKeys(await keysRes.json());
  }

  // Função para copiar a chave no modal
  const copyToClipboard = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      setKeyCopied(true);
      setTimeout(() => setKeyCopied(false), 3000);
    }
  };

  return (
    <div className="flex bg-[#F8F9FC] min-h-screen font-sans text-slate-900">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8 lg:p-12">
        <div className="max-w-5xl mx-auto">
          
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Meu Perfil</h1>
            <p className="text-slate-500">Gerencie suas informações, segurança e integrações.</p>
          </header>

          {loading ? (
            <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin mx-auto text-slate-900"/></div>
          ) : profile ? (
            <div className="space-y-8">
              
              {/* 1. CARTÃO DE IDENTIFICAÇÃO */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="w-32 h-32 rounded-full bg-slate-900 text-white flex items-center justify-center text-4xl font-bold border-4 border-slate-100 shadow-xl">
                  {profile.full_name.charAt(0).toUpperCase()}
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2 justify-center md:justify-start">
                    <h2 className="text-2xl font-bold text-slate-900">{profile.full_name}</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getRoleColor(profile.role)}`}>
                      {formatRole(profile.role)}
                    </span>
                  </div>
                  
                  <p className="text-slate-500 flex items-center justify-center md:justify-start gap-2 mb-6">
                    <Building2 className="w-4 h-4" /> {profile.tenant_name}
                  </p>

                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <button 
                      onClick={() => router.push("/change-password")}
                      className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-sm"
                    >
                      <Lock className="w-4 h-4" /> Alterar Senha
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="px-4 py-2 bg-red-50 border border-red-100 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Sair
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. GRID DE DETALHES E KPI */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Detalhes */}
                <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" /> Detalhes da Conta
                    </h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Email Corporativo</label>
                        <div className="flex items-center gap-2 text-slate-700 font-medium p-3 bg-slate-50 rounded-lg border border-slate-100 truncate">
                          <Mail className="w-4 h-4 text-slate-400" /> {profile.email}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Departamento</label>
                        <div className="flex items-center gap-2 text-slate-700 font-medium p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <Briefcase className="w-4 h-4 text-slate-400" /> {profile.department}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">ID Interno</label>
                        <div className="flex items-center gap-2 text-slate-700 font-mono text-sm p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <Shield className="w-4 h-4 text-slate-400" /> USER-{profile.id.toString().padStart(4, '0')}
                        </div>
                      </div>
                  </div>
                </div>

                {/* KPIs */}
                <div className="md:col-span-1 space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileText className="w-5 h-5" /></div>
                      <span className="text-xs font-bold text-slate-400 uppercase">Total</span>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900">{profile.stats.documents_uploaded}</h3>
                    <p className="text-sm text-slate-500 mt-1">Documentos enviados</p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Layers className="w-5 h-5" /></div>
                      <span className="text-xs font-bold text-slate-400 uppercase">Volume</span>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900">{profile.stats.pages_scanned}</h3>
                    <p className="text-sm text-slate-500 mt-1">Páginas processadas</p>
                  </div>
                </div>
              </div>

              {/* 3. INTEGRAÇÃO DE PASTA (SYNC) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Key className="w-4 h-4 text-blue-600" /> Integração de Pastas (Sync)
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">Conecte scanners ou computadores locais para upload automático.</p>
                    </div>
                </div>
                
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Formulário */}
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                            <h4 className="text-sm font-bold text-slate-700 mb-4">Nova Conexão</h4>
                            <form onSubmit={createKey} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Nome do Dispositivo</label>
                                    <input 
                                        required
                                        placeholder="Ex: Scanner Recepção, PC Financeiro..." 
                                        className="w-full p-3 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={newKeyLabel}
                                        onChange={e => setNewKeyLabel(e.target.value)}
                                    />
                                </div>
                                <button 
                                  disabled={loadingKeys} 
                                  className="w-full bg-slate-900 text-white px-4 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50"
                                >
                                    {loadingKeys ? <Loader2 className="w-4 h-4 animate-spin"/> : <Plus className="w-4 h-4"/>} 
                                    Gerar Chave de Acesso
                                </button>
                            </form>
                        </div>

                        {/* Lista */}
                        <div>
                            <h4 className="text-sm font-bold text-slate-700 mb-4">Conexões Ativas</h4>
                            <div className="space-y-3">
                                {keys.length === 0 ? (
                                    <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                      <Key className="w-8 h-8 mx-auto text-slate-300 mb-2"/>
                                      <p className="text-sm text-slate-400">Nenhuma integração configurada.</p>
                                    </div>
                                ) : (
                                    keys.map(k => (
                                        <div key={k.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{k.label}</p>
                                                <p className="text-xs font-mono text-slate-400 mt-1">
                                                    ************{k.key.slice(-6)}
                                                </p>
                                            </div>
                                            <button 
                                                onClick={() => deleteKey(k.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Revogar Acesso"
                                            >
                                                <Trash2 className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center text-red-500">Erro ao carregar perfil.</div>
          )}
        </div>
      </main>

      {/* --- MODAL DE CHAVE GERADA (SUBSTITUI O ALERT) --- */}
      {generatedKey && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 border border-slate-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <Check className="w-6 h-6 text-green-500" /> Chave Gerada com Sucesso
              </h3>
              <button onClick={() => setGeneratedKey(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8">
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-6 flex gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                <p className="text-sm text-amber-800 leading-relaxed">
                  <strong>Atenção:</strong> Esta chave não será exibida novamente. Copie-a agora e cole no script de integração (<code>sync_intellidocs.py</code>) no computador de origem.
                </p>
              </div>

              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Chave de API (Sync Token)</label>
              <div className="relative group">
                <div className="w-full p-4 bg-slate-900 text-green-400 font-mono text-sm rounded-xl break-all border border-slate-800 shadow-inner">
                  {generatedKey}
                </div>
                <button 
                  onClick={copyToClipboard}
                  className="absolute top-2 right-2 p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {keyCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span className="text-xs font-bold">{keyCopied ? "Copiado!" : "Copiar"}</span>
                </button>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setGeneratedKey(null)}
                className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold text-sm transition-all"
              >
                Concluído
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}