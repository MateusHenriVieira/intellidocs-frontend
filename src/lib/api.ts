// src/lib/api.ts

const API_BASE_URL = "http://149.56.128.99:8000";

function getAuthHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { "Authorization": `Bearer ${token}` } : {};
}

// --- Interfaces ---
export interface Tenant {
  id: number;
  name: string;
  cnpj: string;
  plan_type: string;
  is_active: boolean;
  created_at: string;
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

// --- Funções de Auth e Gestão ---

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

// --- Funções de Super Admin (Tenants) ---

export async function listTenants(): Promise<Tenant[]> {
  const res = await fetch(`${API_BASE_URL}/admin/tenants`, {
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) throw new Error("Erro ao listar prefeituras (Acesso Negado)");
  return res.json();
}

export async function createTenant(name: string, cnpj: string, plan: string) {
  const res = await fetch(`${API_BASE_URL}/admin/tenants`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ name, cnpj, plan_type: plan }),
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

// --- Funções de Usuário (Docs, Dashboard, BI) ---

export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE_URL}/reports/stats`, {
    headers: { ...getAuthHeaders() }
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
    headers: { ...getAuthHeaders() },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Erro no upload");
  }
  return res.json();
}

export async function searchDocuments(query: string): Promise<SearchResult[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/documents/search?query=${encodeURIComponent(query)}`, {
      headers: { ...getAuthHeaders() }
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
    headers: { 
      "Content-Type": "application/json",
      ...getAuthHeaders()
    },
    body: JSON.stringify({ query: query, doc_type: docType })
  });

  if (!res.ok) throw new Error("Falha ao gerar relatório de inteligência");
  return res.json();
}