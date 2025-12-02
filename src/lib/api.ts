// src/lib/api.ts

// IP DA SUA VPS
const API_BASE_URL = "http://149.56.128.99:8000";

// --- Helper de Autenticação ---
function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { "Authorization": `Bearer ${token}` } : {};
}

// --- Interfaces de Tipagem (Models) ---

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
  department: string;
  pages_scanned_count: number;
}

export interface Tenant {
  id: number;
  name: string;
  cnpj: string;
  plan_type: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateTenantResponse {
  message: string;
  tenant_id: number;
  generated_login: string;
  generated_password: string;
}

export interface SearchResult {
  score: number;
  document_title: string;
  doc_type: string;
  page_number: number;
  preview_url: string;
  text_snippet: string;
  created_at: string;
}

export interface DashboardStats {
  total_documents: number;
  total_pages: number;
  documents_by_type: { type: string; count: number }[];
  recent_uploads: { title: string; date: string; type: string }[];
  weekly_activity: { name: string; value: number; fullDate: string }[];
}

export interface UploadResponse {
  message: string;
  document_id: number;
  status: string;
}

export interface BIResponse {
  summary: string;
  chart_type: "bar" | "line" | "pie" | "none";
  data: { name: string; value: number }[];
  kpi: { label: string; value: string };
}

// --- ROTAS DE AUTENTICAÇÃO E RECUPERAÇÃO ---

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

// --- ROTAS DE GESTÃO DE EQUIPE (USUÁRIOS) ---

export async function listCompanyUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE_URL}/users`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Erro ao listar usuários");
  return res.json();
}

export async function createCompanyUser(userData: any) {
  const res = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error("Erro ao criar usuário");
  return res.json();
}

export async function deleteCompanyUser(id: number) {
  const res = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error("Erro ao remover usuário");
  return res.json();
}

// --- ROTAS DO SUPER ADMIN (TENANTS) ---

export async function listTenants(): Promise<Tenant[]> {
  const res = await fetch(`${API_BASE_URL}/admin/tenants`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error("Erro ao listar prefeituras");
  return res.json();
}

export async function createTenant(name: string, cnpj: string, plan: string): Promise<CreateTenantResponse> {
  const res = await fetch(`${API_BASE_URL}/admin/tenants`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ name, cnpj, plan_type: plan }),
  });
  if (!res.ok) throw new Error("Erro ao criar prefeitura");
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

export async function deleteTenant(id: number) {
  const res = await fetch(`${API_BASE_URL}/admin/tenants/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Erro ao excluir prefeitura");
  return res.json();
}

// --- ROTAS OPERACIONAIS (DOCS & BI) ---

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

export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE_URL}/reports/stats`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error("Falha ao carregar dashboard");
  return res.json();
}

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

export async function searchDocuments(query: string, filters?: any): Promise<SearchResult[]> {
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

export async function generateBIReport(query: string, docType?: string): Promise<BIResponse> {
  const res = await fetch(`${API_BASE_URL}/reports/bi-analysis`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ query: query, doc_type: docType })
  });

  if (!res.ok) throw new Error("Falha ao gerar relatório de inteligência");
  return res.json();
}