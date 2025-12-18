## 📌 Sumário

* [Visão Geral](#visão-geral-do-projeto)
* [Arquitetura & Stack](#stack-tecnológica)
* [Backend & IA](#módulos-do-backend)
* [Frontend & UI](#interface-do-usuário-frontend)
* [Segurança & RBAC](#segurança--permissões-rbac)
* [Instalação](#como-rodar)

---

## Visão Geral do Projeto

O **IntelliDocs** é uma plataforma SaaS (Software as a Service) B2B Enterprise criada para gestão documental inteligente de prefeituras e órgãos públicos.
O sistema utiliza Inteligência Artificial para automatizar ingestão, classificação, busca e análise de documentos.

O diferencial é transformar documentos não estruturados (PDFs, scans) em dados estruturados, permitindo auditorias e BI em tempo real.

---

## Stack Tecnológica

### 🔧 Backend — **Python (FastAPI)**

API assíncrona em Docker. Gerencia filas, autenticação e orquestração de IA.

### 🎨 Frontend — **Next.js 15**

Interface moderna com React, Tailwind e Recharts. UX inspirada em sistemas Enterprise/Fintech.

### 🗄️ Banco — **PostgreSQL + pgvector**

Armazenamento híbrido com suporte a embeddings para busca semântica.

### ⚙️ Assíncrono — **Celery + Redis**

Tarefas pesadas: OCR, compressão, vetorização.

### 🤖 IA Core — **Groq + Hugging Face**

* LLMs (Llama 3.1) para classificação e BI
* SentenceTransformers para busca semântica

---

## Módulos do Backend

### 1️⃣ Pipeline de Ingestão (Worker)

Pipeline automatizado processa cada upload:

* **OCR Híbrido:** extração nativa ou Tesseract para scans.
* **Otimização:** compressão agressiva de PDF (redução de até 70%).
* **Vetorização:** geração de embeddings (384 dimensões).
* **Classificação:** IA identifica automaticamente tipo do documento.

---

### 2️⃣ Motor de Busca Híbrido

Combina busca exata (SQL `ILIKE`) + busca semântica (distância de cosseno).

```sql
SELECT ... (dp.embedding <=> query_vector) AS distance
ORDER BY exact_match DESC, distance ASC;
```

---

### 3️⃣ Business Intelligence (BI)

Endpoint que processa múltiplos documentos e retorna JSON estruturado para dashboards.

* Análise de tendências financeiras
* KPIs automáticos
* Geração de gráficos: barras, linhas, pizza

---

## Interface do Usuário (Frontend)

### 📊 Dashboard Enterprise

Métricas em tempo real, gráficos de produtividade, logs e auditorias.

### 🧩 Gestão Completa

**Gestão de Clientes (Tenants)**

* Super Admin cria prefeituras
* Login automático via CNPJ
* Definição de planos e bloqueio por inadimplência

**Gestão de Equipe**

* Criação de secretarias
* Usuários com permissões granulares

---

### 📄 Visualizador de Documentos

Inclui:

* Visualização em alta resolução
* **Chat com o Documento (RAG)**
* Download seguro
* Impressão
* Link público temporário via JWT

---

## Segurança & Permissões (RBAC)

### 🎚️ Níveis de Acesso

* **Super Admin:** controle global, pagamentos e tenants
* **Admin:** gestão total da prefeitura
* **Gestor:** acesso total apenas à sua secretaria
* **Alimentador:** apenas upload
* **Consultor:** leitura apenas

---

### 🔒 Features de Segurança

* **Isolamento total de tenants**
* **Isolamento entre secretarias**
* **Bloqueio automático por inadimplência**
* **Recuperação de senha via Redis**
* **Troca obrigatória de senha no primeiro login**

---

## Como Rodar

O projeto é totalmente containerizado.

```bash
# 1. Clonar repositório
git clone https://github.com/seu-repo/intellidocs.git

# 2. Configurar .env
cp .env.example .env

# 3. Subir Containers (Build inicial)
docker compose up --build -d

# 4. Acessar
Frontend: http://localhost:3000
Backend Docs: http://localhost:8000/docs
```

---

© 2025 IntelliDocs — Documentação gerada automaticamente.

---

