"use client";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { getAuditLogs, listCompanyUsers, AuditLog, User } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { 
  Shield, Search, FileText, Trash2, LogIn, Download, Bot, 
  Loader2, Calendar, Filter, User as UserIcon, RefreshCw 
} from "lucide-react";

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados dos Filtros
  const [selectedUser, setSelectedUser] = useState("all");
  const [selectedAction, setSelectedAction] = useState("Todos");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Busca local (filtra o que já foi baixado)
  const [search, setSearch] = useState("");

  useEffect(() => {
    initData();
  }, []);

  // Recarrega quando os filtros "pesados" mudam
  useEffect(() => {
    fetchLogs();
  }, [selectedUser, selectedAction, startDate, endDate]);

  async function initData() {
    try {
      const [logsData, usersData] = await Promise.all([
        getAuditLogs(),
        listCompanyUsers()
      ]);
      setLogs(logsData);
      setUsers(usersData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchLogs() {
    setLoading(true);
    try {
      const data = await getAuditLogs({
        userId: selectedUser,
        action: selectedAction,
        startDate,
        endDate
      });
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const getIcon = (action: string) => {
    if (action.includes("LOGIN")) return <LogIn className="w-4 h-4 text-green-600" />;
    if (action.includes("DELETE")) return <Trash2 className="w-4 h-4 text-red-600" />;
    if (action.includes("DOWNLOAD") || action.includes("VIEW")) return <Download className="w-4 h-4 text-blue-600" />;
    if (action.includes("AI")) return <Bot className="w-4 h-4 text-purple-600" />;
    return <FileText className="w-4 h-4 text-slate-500" />;
  };

  // Filtro de texto local (sobre os resultados retornados)
  const filteredLogs = logs.filter(l => 
    l.user_email.toLowerCase().includes(search.toLowerCase()) || 
    l.details?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex bg-[#F8F9FC] min-h-screen font-sans text-slate-900">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 lg:p-12">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
              <Shield className="w-8 h-8 text-slate-900" /> Trilha de Auditoria
            </h1>
            <p className="text-slate-500">
              Histórico de segurança e conformidade (Compliance).
            </p>
          </div>
          <button 
            onClick={fetchLogs}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Atualizar lista"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* BARRA DE FILTROS */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            
            {/* Filtro de Usuário */}
            <div className="flex-1 w-full">
              <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Usuário</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                <select 
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10 appearance-none cursor-pointer"
                  value={selectedUser}
                  onChange={e => setSelectedUser(e.target.value)}
                >
                  <option value="all">Todos os Usuários</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filtro de Data Início */}
            <div className="w-full md:w-48">
              <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">De</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                <input 
                  type="date"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-600"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
              </div>
            </div>

            {/* Filtro de Data Fim */}
            <div className="w-full md:w-48">
              <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Até</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                <input 
                  type="date"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-600"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Filtro de Ação */}
            <div className="w-full md:w-48">
              <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Ação</label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                <select 
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10 appearance-none cursor-pointer"
                  value={selectedAction}
                  onChange={e => setSelectedAction(e.target.value)}
                >
                  <option value="Todos">Todas Ações</option>
                  <option value="LOGIN">Login</option>
                  <option value="UPLOAD">Upload</option>
                  <option value="DELETE">Exclusão</option>
                  <option value="VIEW_FILE">Visualização</option>
                  <option value="AI_CHAT">Consulta IA</option>
                </select>
              </div>
            </div>

          </div>
        </div>

        {/* TABELA */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Busca Textual Local */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
             <div className="relative max-w-sm w-full">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                 className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900/10 transition-all placeholder:text-slate-400"
                 placeholder="Buscar nos detalhes..."
                 value={search}
                 onChange={e => setSearch(e.target.value)}
               />
             </div>
             <div className="text-xs text-slate-400 font-mono">
               {filteredLogs.length} eventos encontrados
             </div>
          </div>

          {loading ? (
            <div className="p-20 text-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2"/>
              <p className="text-xs">Carregando auditoria...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-20 text-center text-slate-400">
              <Shield className="w-12 h-12 mx-auto mb-3 opacity-20"/>
              <p>Nenhum registro encontrado com estes filtros.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-6 py-4">Data / Hora</th>
                    <th className="px-6 py-4">Usuário</th>
                    <th className="px-6 py-4">Ação</th>
                    <th className="px-6 py-4">Detalhes do Evento</th>
                    <th className="px-6 py-4 text-right">IP Origem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors font-medium">
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap tabular-nums">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-6 py-4 text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center text-[10px] font-bold">
                            {log.user_email.charAt(0).toUpperCase()}
                          </div>
                          <span className="truncate max-w-[150px]" title={log.user_email}>{log.user_email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wide">
                          {getIcon(log.action)} {log.action.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 max-w-md">
                        <p className="truncate" title={log.details || ""}>{log.details || "-"}</p>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-400 font-mono text-[10px]">
                        {log.ip_address}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}