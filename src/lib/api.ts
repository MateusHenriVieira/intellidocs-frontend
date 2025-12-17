// src/lib/api.ts

// IP DA SUA VPS
const API_BASE_URL = "http://149.56.128.99:8000";

// --- Helper de Autenticação ---
function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { "Authorization": `Bearer ${token}` } : {};
}

// --- INTERFACES DE DADOS (MODELS) ---

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
  department: string;
  pages_scanned_count: number;
}

export interface UserProfile {
  id: number;
  full_name: string;
  email: string;
  role: string;
  department: string;
  tenant_name: string;
  stats: {
    documents_uploaded: number;
    pages_scanned: number;
  };
}

export interface Tenant {
  id: number;
  name: string;
  cnpj: string;
  plan_type: string;
  plan_value: number;
  next_billing_date: string;
  payment_status: string;
  is_active: boolean;
  created_at: string;
}

export interface Department {
  id: number;
  name: string;
}

// Detalhes completos da Prefeitura (Raio-X)
export interface TenantDetails extends Tenant {
  total_docs: number;
  total_pages: number;
  total_storage_gb: number;
  departments: DeptStat[];
  users: UserStat[];
}

export interface DeptStat {
  name: string;
  doc_count: number;
  page_count: number;
  storage_mb: number;
}

export interface UserStat {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
}

export interface DepartmentDetails {
  id: number;
  name: string;
  manager_name: string;
  manager_email: string;
  user_count: number;
  doc_count: number;
  page_count: number;
  storage_estimate_mb: number;
}

export interface CreateTenantResponse {
  message: string;
  tenant_id: number;
  generated_login: string;
  generated_password: string;
}

export interface SearchResult {
  doc_id: number;
  score: number;
  document_title: string;
  doc_type: string;
  page_number: number;
  preview_url: string;
  text_snippet: string;
  created_at: string;
}

export interface SearchFilters {
  docType?: string;
  department?: string;
  startDate?: string;
  endDate?: string;
}

export interface DashboardStats {
  department_view: string;
  total_documents: number;
  total_pages: number;
  storage_used_mb: number;
  documents_by_type: { type: string; count: number }[];
  recent_uploads: { title: string; date: string; type: string }[];
  weekly_activity: { name: string; value: number; fullDate: string }[];
}

export interface UploadResponse {
  message: string;
  document_id: number;
  status: string;
}

export interface AuditFilters {
  userId?: number | string;
  action?: string;
  startDate?: string;
  endDate?: string;
}

//Interface de marca texto

export interface OCRWord {
  t: string;        // Texto
  b: [number, number, number, number]; // Box [x0, y0, x1, y1]
}

export interface BIResponse {
  report_title: string;
  executive_summary: string;
  kpis: {
    label: string;
    value: string;
    trend?: string;
    status: "positive" | "negative" | "neutral";
  }[];
  chart_config: {
    value1_label: string;
    value2_label: string;
  };
  main_chart: any[];
  distribution_chart: { name: string; value: number }[];
  insights: string[];
  raw_data: {
    document: string;
    date: string;
    value: string;
    status: string;
  }[];
}

export interface AuditLog {
  id: number;
  user_email: string;
  action: string;
  resource_type: string;
  details: string;
  ip_address: string;
  created_at: string;
}

export interface ChatResponse {
  reply: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  is_read: boolean;
  created_at: string;
}

export interface PublicDocument {
  title: string;
  type: string;
  created_at: string;
  total_pages: number;
  pages: {
    page_number: number;
    image_url: string;
    text: string;
  }[];
}

// --- ROTAS DE AUTENTICAÇÃO ---

export async function loginUser(username: string, password: string): Promise<any> {
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData,
  });

  if (!res.ok) throw new Error("Credenciais inválidas ou acesso bloqueado.");
  return res.json();
}

export async function changePassword(newPassword: string) {
  const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ new_password: newPassword }),
  });
  if (!res.ok) throw new Error("Erro ao trocar senha");
  return res.json();
}

export async function requestPasswordReset(email: string) {
  const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("Erro ao solicitar código.");
  return res.json();
}

export async function verifyResetCode(email: string, code: string) {
  const res = await fetch(`${API_BASE_URL}/auth/verify-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  if (!res.ok) throw new Error("Código inválido.");
  return res.json();
}

export async function confirmPasswordReset(resetToken: string, newPassword: string) {
  const res = await fetch(`${API_BASE_URL}/auth/reset-password-confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reset_token: resetToken, new_password: newPassword }),
  });
  if (!res.ok) throw new Error("Erro ao redefinir senha.");
  return res.json();
}

export async function getUserProfile(): Promise<UserProfile> {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error("Erro ao carregar perfil");
  return res.json();
}

// --- ROTAS DE GESTÃO DE PREFEITURAS (SUPER ADMIN) ---

export async function listTenants(): Promise<Tenant[]> {
  const res = await fetch(`${API_BASE_URL}/admin/tenants`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error("Erro ao listar prefeituras");
  return res.json();
}

export async function getTenantDetails(id: number): Promise<TenantDetails> {
  const res = await fetch(`${API_BASE_URL}/admin/tenants/${id}/details`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error("Erro ao carregar detalhes da prefeitura");
  return res.json();
}

export async function createTenant(data: any): Promise<CreateTenantResponse> {
  const res = await fetch(`${API_BASE_URL}/admin/tenants`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Erro ao criar prefeitura");
  }
  return res.json();
}

export async function updateTenantStatus(id: number, isActive: boolean) {
  const res = await fetch(`${API_BASE_URL}/admin/tenants/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ is_active: isActive }),
  });
  if (!res.ok) throw new Error("Erro ao atualizar status");
  return res.json();
}

export async function renewTenant(id: number) {
  const res = await fetch(`${API_BASE_URL}/admin/tenants/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ renew_subscription: true }),
  });
  if (!res.ok) throw new Error("Erro ao renovar");
  return res.json();
}

//função para puxar dados marca texto
export async function getDocumentPageMetadata(docId: number, pageNum: number): Promise<OCRWord[]> {
  const res = await fetch(`${API_BASE_URL}/documents/${docId}/pages/${pageNum}/metadata`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) return [];
  return res.json();
}

//Função para rodar ciclo de cobrança manualmente

export async function runBillingCycle() {
  const res = await fetch(`${API_BASE_URL}/admin/billing/run`, {
    method: "POST",
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error("Erro ao rodar ciclo de cobrança");
  return res.json();
}

//função para deletar prefeitura

export async function deleteTenant(id: number) {
  const res = await fetch(`${API_BASE_URL}/admin/tenants/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Erro ao excluir prefeitura");
  return res.json();
}

// --- ROTAS DE GESTÃO DE SECRETARIAS (DEPARTAMENTOS) ---
//lista as secretarias da prefeitura logada
export async function listDepartments(): Promise<Department[]> {
  const res = await fetch(`${API_BASE_URL}/departments`, { headers: getAuthHeaders() });
  if (!res.ok) return [];
  return res.json();
}

// Detalhes completos da Secretaria
export async function getDepartmentDetails(id: number): Promise<DepartmentDetails> {
  const res = await fetch(`${API_BASE_URL}/departments/${id}/details`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error("Erro ao carregar detalhes");
  return res.json();
}
//cria secretaria
export async function createDepartment(data: { name: string, responsible_name: string, email: string, password: string }) {
  const res = await fetch(`${API_BASE_URL}/departments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Erro ao criar secretaria");
  }
  return res.json();
}

//deleta secretaria
export async function deleteDepartment(id: number) {
  const res = await fetch(`${API_BASE_URL}/departments/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error("Erro ao apagar");
  return res.json();
}

// --- ROTAS DE GESTÃO DE EQUIPE (USUÁRIOS) ---

//lista os usuários da prefeitura logada
export async function listCompanyUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE_URL}/users`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Erro ao listar usuários");
  return res.json();
}

//cria usuário na prefeitura logada
export async function createCompanyUser(userData: any) {
  const res = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Erro ao criar usuário");
  }
  return res.json();
}

//deleta usuário da prefeitura logada
export async function deleteCompanyUser(id: number) {
  const res = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error("Erro ao remover usuário");
  return res.json();
}

// --- ROTAS OPERACIONAIS (DOCS & BI) ---

// Gera URL de download a partir da URL de preview
export function getDownloadUrl(previewUrl: string): string | null {
  try {
    const match = previewUrl.match(/static\/(\d+)\/(\d+)\/page_(\d+)/);
    if (match) {
      const [_, tenantId, docId, pageNum] = match;
      return `${API_BASE_URL}/documents/download/${tenantId}/${docId}/${pageNum}`;
    }
    return null;
  } catch (e) { return null; }
}

// Puxa estatísticas para o dashboard
export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE_URL}/reports/stats`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const errorBody = await res.text();
    console.error("ERRO DASHBOARD:", res.status, errorBody);
    throw new Error("Falha ao carregar dashboard");
  }
  return res.json();
}

// Puxa tipos de documentos disponíveis
export async function getDocumentTypes(): Promise<string[]> {
  const res = await fetch(`${API_BASE_URL}/documents/types`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) return [];
  return res.json();
}

// Faz upload de documento
export async function uploadDocument(file: File, title: string): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);

  const res = await fetch(`${API_BASE_URL}/documents/upload`, {
    method: "POST",
    headers: getAuthHeaders(), 
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Erro no upload");
  }
  return res.json();
}


// Função de busca de documentos com filtros opcionais
export async function searchDocuments(query: string, filters?: SearchFilters): Promise<SearchResult[]> {
  try {
    const params = new URLSearchParams();
    params.append("query", query);
    
    if (filters?.docType && filters.docType !== "Todos") params.append("doc_type", filters.docType);
    if (filters?.department && filters.department !== "Todos") params.append("department", filters.department);
    if (filters?.startDate) params.append("start_date", filters.startDate);
    if (filters?.endDate) params.append("end_date", filters.endDate);

    const res = await fetch(`${API_BASE_URL}/documents/search?${params.toString()}`, {
      headers: getAuthHeaders()
    });
    
    if (!res.ok) throw new Error("Erro na busca");
    
    const data = await res.json();
    return data.map((doc: any) => ({
      ...doc,
      preview_url: `${API_BASE_URL}${doc.preview_url}`
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

//deleta documento
export async function deleteDocument(docId: number) {
  const res = await fetch(`${API_BASE_URL}/documents/${docId}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error("Erro ao excluir documento");
  return res.json();
}

// Gera relatório de BI
export async function generateBIReport(query: string, docType?: string): Promise<BIResponse> {
  const res = await fetch(`${API_BASE_URL}/reports/bi-analysis`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ query: query, doc_type: docType })
  });

  if (!res.ok) throw new Error("Falha ao gerar relatório de inteligência");
  return res.json();
}

// Envia mensagem para o chat de documentos
export async function sendDocumentChatMessage(docId: number, message: string): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE_URL}/documents/${docId}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) throw new Error("Falha na comunicação com o chat");
  return res.json();
}

// --- NOTIFICAÇÕES E COMPARTILHAMENTO ---

// Puxa notificações do usuário logado
export async function getNotifications(): Promise<Notification[]> {
  const res = await fetch(`${API_BASE_URL}/notifications`, { headers: getAuthHeaders() });
  if (!res.ok) return [];
  return res.json();
}

// Marca notificação como lida
export async function markNotificationRead(id: number) {
  await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
    method: "PATCH", headers: getAuthHeaders()
  });
}

// Marca todas como lidas
export async function markAllRead() {
  await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
    method: "POST", headers: getAuthHeaders()
  });
}

// Envia notificação do sistema
export async function sendSystemNotification(data: { title: string, message: string, type: string, target_tenant_id?: number | null }) {
  const res = await fetch(`${API_BASE_URL}/notifications/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erro ao enviar notificação");
  return res.json();
}

// Gera link público de compartilhamento
export async function createShareLink(docId: number, hours: number = 24) {
  const res = await fetch(`${API_BASE_URL}/public/share/${docId}?hours=${hours}`, {
    method: "POST",
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error("Erro ao gerar link");
  return res.json(); 
}

// Puxa logs de auditoria com filtros opcionais
export async function getAuditLogs(filters?: AuditFilters): Promise<AuditLog[]> {
  const params = new URLSearchParams();
  
  if (filters?.userId && filters.userId !== "all") params.append("user_id", filters.userId.toString());
  if (filters?.action && filters.action !== "Todos") params.append("action", filters.action);
  if (filters?.startDate) params.append("start_date", filters.startDate);
  if (filters?.endDate) params.append("end_date", filters.endDate);
  
  // Aumentei o limite padrão para 100
  params.append("limit", "100");

  const res = await fetch(`${API_BASE_URL}/audit?${params.toString()}`, { 
    headers: getAuthHeaders() 
  });
  
  if (!res.ok) return [];
  return res.json();
}

// Puxa documento público via token
export async function getPublicDocument(token: string): Promise<PublicDocument> {
  const res = await fetch(`${API_BASE_URL}/public/view/${token}`);
  
  if (res.status === 401) throw new Error("Este link expirou.");
  if (!res.ok) throw new Error("Documento não encontrado.");
  
  const data = await res.json();
  data.pages = data.pages.map((p: any) => ({
    ...p,
    image_url: `${API_BASE_URL}${p.image_url}`
  }));
  
  return data;
}

// Puxa links públicos associados a um documento
export async function getDocumentLinks(docId: number) {
  // ATENÇÃO: Verifique se API_BASE_URL está correto (sem barra no final geralmente)
  const res = await fetch(`${API_BASE_URL}/documents/${docId}/links`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) return [];
  return res.json();
}