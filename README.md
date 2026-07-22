# Modern Enterprise IT Service Management (ITSM) Platform

An original, cloud-native enterprise IT Service Management platform inspired by ServiceNow, built from the ground up for high scalability, multi-tenancy, dynamic form design, visual workflow automation, and ITIL process management.

---

## Tech Stack Overview

- **Frontend Framework**: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend API**: NestJS (Node.js & TypeScript), REST & Swagger OpenAPI 3.0 documentation.
- **Database & ORM**: PostgreSQL normalized database layer powered by Prisma ORM.
- **Infrastructure Services**: Docker Compose, Kubernetes manifests, Redis, RabbitMQ, MinIO S3 object storage.

---

## Key Platform Features & Modules

1. **Authentication & Multi-Tenancy**:
   - Organization tenant onboarding (`/api/v1/auth/register-tenant`).
   - JWT authentication & Role-Based Access Control (RBAC).

2. **Incident Management**:
   - Impact x Urgency ITIL Priority matrix calculation engine.
   - Activity notes, assignment groups, and SLA target timers.

3. **CMDB & Infrastructure Topology**:
   - Configuration Items (CIs) for Cloud Clusters, Databases, Routers, and Gateways.
   - Visual dependency mapping (`Depends On`, `Runs On`, `Hosted On`).

4. **Dynamic Form Designer Studio**:
   - Drag-and-drop form canvas for creating custom IT request schemas.
   - UI policies for dynamic field visibility, read-only constraints, and mandatory rules.

5. **Visual Workflow Designer Canvas**:
   - Node-based DAG execution graph (Multi-level approvals, REST Webhooks, Timers, Conditionals).

6. **Service Catalog Storefront**:
   - Enterprise hardware and software catalog ordering with approval workflows.

7. **Knowledge Base & KEDB**:
   - Article publishing, view counters, ratings, and Known Error Database workarounds.

---

## Quickstart Guide

### 1. Launch Core Infrastructure Services
```bash
docker-compose up -d
```

### 2. Install Monorepo Dependencies
```bash
npm install
```

### 3. Generate Prisma Database Schema
```bash
npm run db:generate
```

### 4. Start Local Development Servers
```bash
# Terminal 1: NestJS Backend API (Port 4000)
npm run dev:backend

# Terminal 2: Next.js Admin Workspace (Port 3000)
npm run dev:frontend
```

---

## OpenAPI Swagger Documentation
When the NestJS backend is running, access interactive API documentation at:
[http://localhost:4000/api/docs](http://localhost:4000/api/docs)
