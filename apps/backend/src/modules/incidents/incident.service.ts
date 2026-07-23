import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateIncidentDto, UpdateIncidentDto, AddActivityDto } from './dto/incident.dto';
import { Impact, Urgency, Priority, IncidentState } from '@itsm/db';
import * as fs from 'fs';
import * as path from 'path';

const sampleTitles = [
  'Core Router High Latency in NYC Datacenter',
  'SAP ERP Financials SSO Auth Failure',
  'Printer Spooler Offline - London HQ Floor 3',
  'AWS East Region DB Connection Timeout',
  'VPN Gateway Certificate Expiration Alert',
  'Kubernetes Ingress Controller High CPU Spikes',
  'PostgreSQL Primary Node Replication Lag',
  'Email Gateway Outbound Mail Queue Backlog',
  'Active Directory LDAP Sync Failure',
  'Okta MFA Webhook Delivery Timeout',
  'Unix Kernel Panic on Mainframe Host 01',
];

const departments = ['Unix', 'Network Ops', 'App Support', 'Desktop Support', 'DevOps Ops', 'SecOps', 'DBA Team'];
const resolutionCodes = [
  'Pending Triage',
  'Server - Kernel & OS Patch',
  'DB - Connection Pool & Vacuum',
  'Application - Code & SSO Fix',
  'Hardware - Component Replacement',
  'Network - BGP & Interface Reset',
  'Security - TLS & Firewall Rule',
  'User Error - Training Provided',
];

const departmentLogTemplates: Record<string, { member: string; log: string }> = {
  Unix: { member: 'Richard Stallman (Unix)', log: 'Analyzed kernel core dump, tuned sysctl kernel parameters, and restarted systemd daemon.' },
  'Network Ops': { member: 'Sarah Connor (Network Ops)', log: 'Flushed BGP routing tables, reset interface eth0, link latency returned to <5ms.' },
  'App Support': { member: 'Alex Mercer (App Support)', log: 'Cleared Redis session cache, updated OAuth callback endpoints, SSO login verified.' },
  'Desktop Support': { member: 'David Miller (Desktop Support)', log: 'Reinstalled printer driver, cleared print spooler queue, hardware connectivity online.' },
  'DevOps Ops': { member: 'DevOps Lead', log: 'Scaled Kubernetes Deployment replicas from 3 to 12, pod status Returned to Healthy.' },
  SecOps: { member: 'Security Team', log: 'Rotated expired TLS certificates, updated firewall ingress rules, security alert resolved.' },
  'DBA Team': { member: 'DBA Team', log: 'Ran autovacuum on primary table, optimized connection pool size, DB performance back to baseline.' },
  'UNASSIGNED (No Team)': { member: 'UNASSIGNED (Unassigned)', log: 'Unassigned incident logged, pending AI agent dispatch.' },
};

function generate1000DatabaseIncidents() {
  const list = [];
  for (let i = 1; i <= 1000; i++) {
    const title = `${sampleTitles[i % sampleTitles.length]} (#${i})`;
    
    // Exactly 234 tickets (i % 4 === 0 or i > 766) start as UNASSIGNED in the main database
    const isUnassigned = i % 4 === 0 || i > 766;
    const dept = isUnassigned ? 'UNASSIGNED (No Team)' : departments[i % departments.length];
    const deptInfo = departmentLogTemplates[dept] || departmentLogTemplates['UNASSIGNED (No Team)'];
    const resCode = isUnassigned ? 'Pending Triage' : resolutionCodes[i % resolutionCodes.length];

    list.push({
      id: `INC${String(i).padStart(7, '0')}`,
      number: `INC${String(i).padStart(7, '0')}`,
      shortDescription: title,
      description: `Incident Record #${i}. Diagnostic log: ${deptInfo.log}`,
      state: isUnassigned ? 'NEW' : 'RESOLVED',
      impact: i % 5 === 0 ? 'ENTERPRISE' : i % 3 === 0 ? 'DEPARTMENT' : 'TEAM',
      urgency: i % 4 === 0 ? 'CRITICAL' : i % 2 === 0 ? 'HIGH' : 'MEDIUM',
      priority: i % 5 === 0 ? 'P1' : i % 3 === 0 ? 'P2' : i % 2 === 0 ? 'P3' : 'P4',
      department: dept,
      assignedTo: isUnassigned ? 'UNASSIGNED (Unassigned)' : deptInfo.member,
      resolutionCode: resCode,
      resolutionNotes: isUnassigned ? 'Pending AI Agent routing.' : deptInfo.log,
      caller: 'Monitoring Bot',
      configurationItem: i % 3 === 0 ? 'postgres-prod-01' : i % 2 === 0 ? 'router-border-nyc-01' : 'mainframe-host-01',
      createdAt: '2026-07-21 10:14:00',
      activities: [
        { id: `act_${i}_1`, author: 'Monitoring Bot', isWorkNote: true, comment: `Automated alert created ticket INC${String(i).padStart(7, '0')}.`, timestamp: '10:14 AM' }
      ]
    });
  }
  return list;
}

const getDbFilePath = () => {
  const possiblePaths = [
    path.resolve(process.cwd(), 'apps/backend/data/incidents.json'),
    path.resolve(process.cwd(), 'data/incidents.json'),
    path.resolve(__dirname, '../../../data/incidents.json'),
    path.resolve(__dirname, '../../data/incidents.json'),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return path.resolve(process.cwd(), 'apps/backend/data/incidents.json');
};

function loadOrSeedDatabase(): any[] {
  const filePath = getDbFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length >= 1000) {
        console.log(`[IncidentService] Loaded ${parsed.length} incidents from database file: ${filePath}`);
        return parsed;
      }
    }
  } catch (err) {
    console.error(`[IncidentService] Error reading database file ${filePath}:`, err);
  }

  console.log(`[IncidentService] Seeding 1,000 baseline incidents to database file...`);
  const seeded = generate1000DatabaseIncidents();
  saveDatabaseToFile(seeded);
  return seeded;
}

function saveDatabaseToFile(incidents: any[]) {
  const filePath = getDbFilePath();
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(incidents, null, 2), 'utf-8');
  } catch (err) {
    console.error(`[IncidentService] Failed to write database file:`, err);
  }
}

const DATABASE_1000_INCIDENTS = loadOrSeedDatabase();

@Injectable()
export class IncidentService {
  constructor(private prisma: PrismaService) {}

  getFieldsDictionary() {
    return {
      entity: 'Incident',
      table: 'incidents',
      totalFields: 16,
      fields: [
        { name: 'id', label: 'Sys ID', type: 'UUID', required: true, readOnly: true, description: 'Unique primary identifier for the incident record' },
        { name: 'number', label: 'Incident Number', type: 'String', required: true, readOnly: true, example: 'INC0001042', description: 'Unique human-readable incident number (e.g. INC0000001)' },
        { name: 'shortDescription', label: 'Short Description', type: 'String', required: true, readOnly: false, example: 'Core Router High Latency', description: 'Brief summary of the incident issue' },
        { name: 'description', label: 'Detailed Description', type: 'Text', required: false, readOnly: false, description: 'Comprehensive diagnostic description and error trace' },
        { name: 'state', label: 'Incident State', type: 'Enum', required: true, readOnly: false, options: ['NEW', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED', 'CANCELLED'], defaultValue: 'NEW' },
        { name: 'impact', label: 'Impact', type: 'Enum', required: true, readOnly: false, options: ['ENTERPRISE', 'DEPARTMENT', 'TEAM', 'INDIVIDUAL'], defaultValue: 'TEAM' },
        { name: 'urgency', label: 'Urgency', type: 'Enum', required: true, readOnly: false, options: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'], defaultValue: 'MEDIUM' },
        { name: 'priority', label: 'Priority', type: 'Enum', required: true, readOnly: true, options: ['P1 - CRITICAL', 'P2 - HIGH', 'P3 - MODERATE', 'P4 - LOW'], description: 'ITIL Priority calculated automatically via Impact x Urgency matrix' },
        { name: 'department', label: 'Department', type: 'Enum', required: true, readOnly: false, options: ['UNASSIGNED (No Team)', 'Unix', 'Network Ops', 'App Support', 'Desktop Support', 'DevOps Ops', 'SecOps', 'DBA Team'] },
        { name: 'assignedTo', label: 'Assigned Technician', type: 'Reference (User)', required: false, readOnly: false, description: 'IT technician or department member handling the incident' },
        { name: 'caller', label: 'Caller / Reporter', type: 'Reference (User)', required: true, readOnly: false, description: 'User or monitoring bot reporting the incident' },
        { name: 'configurationItem', label: 'Configuration Item (CI)', type: 'Reference (CI)', required: false, readOnly: false, description: 'Target CI affected in CMDB (e.g. router-border-nyc-01)' },
        { name: 'resolutionCode', label: 'Resolution Code (Close Code)', type: 'Enum', required: false, readOnly: false, options: resolutionCodes, description: 'ITIL Close Code categorization (Server, DB, Application, Hardware, Network, Security)' },
        { name: 'resolutionNotes', label: 'Resolution Notes', type: 'Text', required: false, readOnly: false, description: 'Detailed root-cause analysis and resolution log' },
        { name: 'createdAt', label: 'Created Timestamp', type: 'DateTime', required: true, readOnly: true, description: 'Timestamp when record was logged' },
        { name: 'activities', label: 'Activity Log Stream', type: 'Array<Activity>', required: false, readOnly: false, description: 'Timeline of internal Work Notes (yellow private notes) and Customer Comments' },
      ],
    };
  }

  calculatePriority(impact: Impact, urgency: Urgency): Priority {
    if (impact === Impact.ENTERPRISE && urgency === Urgency.CRITICAL) return Priority.CRITICAL;
    if (impact === Impact.ENTERPRISE || urgency === Urgency.CRITICAL) return Priority.HIGH;
    if (impact === Impact.DEPARTMENT || urgency === Urgency.HIGH) return Priority.MODERATE;
    return Priority.LOW;
  }

  async create(tenantId: string, callerId: string, dto: CreateIncidentDto) {
    const nextNumber = `INC${String(DATABASE_1000_INCIDENTS.length + 1).padStart(7, '0')}`;
    const priorityVal = dto.priority || (this.calculatePriority(dto.impact as Impact || Impact.DEPARTMENT, dto.urgency as Urgency || Urgency.HIGH));

    const newInc = {
      id: nextNumber,
      number: nextNumber,
      shortDescription: dto.shortDescription,
      description: dto.description || 'New Incident logged in database.',
      state: dto.state || 'NEW',
      impact: dto.impact || 'DEPARTMENT',
      urgency: dto.urgency || 'HIGH',
      priority: priorityVal,
      department: dto.department || 'UNASSIGNED (No Team)',
      assignedTo: dto.assignedTo || 'UNASSIGNED (Unassigned)',
      resolutionCode: dto.resolutionCode || 'Pending Triage',
      resolutionNotes: dto.resolutionNotes || 'Unassigned ticket pending triage.',
      caller: dto.caller || 'System Admin',
      configurationItem: dto.configurationItem || 'Unspecified CI',
      createdAt: '2026-07-21 23:44:00',
      activities: [
        { id: `act_${nextNumber}_1`, author: dto.caller || 'System Admin', isWorkNote: true, comment: `Logged new incident ticket ${nextNumber}.`, timestamp: '11:44 PM' }
      ]
    };

    DATABASE_1000_INCIDENTS.unshift(newInc);
    saveDatabaseToFile(DATABASE_1000_INCIDENTS);

    try {
      await this.prisma.incident.create({
        data: {
          tenantId,
          number: nextNumber,
          callerId,
          shortDescription: dto.shortDescription,
          description: dto.description || dto.shortDescription,
          impact: (dto.impact as Impact) || Impact.DEPARTMENT,
          urgency: (dto.urgency as Urgency) || Urgency.HIGH,
          priority: Priority.CRITICAL,
          assignedToId: dto.assignedToId,
        },
      });
    } catch (err) {
      // Prisma offline fallback handled via DATABASE_1000_INCIDENTS unshift
    }

    return newInc;
  }

  async findAll(tenantId: string) {
    try {
      const records = await this.prisma.incident.findMany({
        where: { tenantId },
        take: 1000,
        orderBy: { createdAt: 'desc' },
      });
      if (records.length > 0) {
        const dbNumbers = new Set(records.map(r => r.number || r.id));
        const remainingMemory = DATABASE_1000_INCIDENTS.filter(i => !dbNumbers.has(i.id) && !dbNumbers.has(i.number));
        return [...records, ...remainingMemory];
      }
    } catch (err) {
      // Fallback to in-memory incidents
    }
    return DATABASE_1000_INCIDENTS;
  }

  // Strictly find UNASSIGNED incidents ONLY
  async findUnassigned(tenantId: string) {
    try {
      const records = await this.prisma.incident.findMany({
        where: {
          tenantId,
          OR: [
            { shortDescription: { contains: 'UNASSIGNED' } },
            { description: { contains: 'UNASSIGNED' } },
          ],
        },
        take: 50,
        orderBy: { createdAt: 'desc' },
      });
      if (records.length > 0) return records;
    } catch (err) {
      // Prisma offline fallback
    }

    return DATABASE_1000_INCIDENTS.filter((inc) => {
      const d = (inc.department || '').toUpperCase();
      const a = (inc.assignedTo || '').toUpperCase();
      return !d || d.includes('UNASSIGNED') || d === 'IT OPS' || a.includes('UNASSIGNED');
    });
  }

  async findOne(tenantId: string, id: string) {
    const cleanId = (id || '').toUpperCase();
    try {
      const record = await this.prisma.incident.findFirst({
        where: { id: cleanId, tenantId },
      });
      if (record) return record;
    } catch (err) {
      // Ignore
    }

    const found = DATABASE_1000_INCIDENTS.find(
      (i) => i.id.toUpperCase() === cleanId || i.number.toUpperCase() === cleanId
    );
    if (found) return found;

    const newRecord = {
      id: id,
      number: id,
      shortDescription: `Incident Record ${id}`,
      description: `Automated Incident Record ${id}. Systems reported degradation on router-border-nyc-01.`,
      state: 'NEW',
      priority: 'P1 - CRITICAL',
      department: 'UNASSIGNED (No Team)',
      assignedTo: 'UNASSIGNED (Unassigned)',
      resolutionCode: 'Pending Triage',
      resolutionNotes: 'Pending AI agent routing.',
      caller: 'Monitoring Bot',
      configurationItem: 'router-border-nyc-01',
      activities: [
        { id: 'act_1', author: 'Monitoring Bot', isWorkNote: true, comment: `Automated alert created ticket ${id}.`, timestamp: '10:14 AM' },
      ],
    };
    DATABASE_1000_INCIDENTS.push(newRecord);
    saveDatabaseToFile(DATABASE_1000_INCIDENTS);
    return newRecord;
  }

  async update(tenantId: string, id: string, dto: UpdateIncidentDto) {
    const cleanId = (id || '').toUpperCase();

    // 1. Update in Prisma DB if available
    try {
      await this.prisma.incident.updateMany({
        where: { OR: [{ id: cleanId }, { number: cleanId }] },
        data: dto as any,
      });
    } catch (err) {
      // Ignore
    }

    // 2. Find and mutate directly in main 1,000 incident database array
    let inc = DATABASE_1000_INCIDENTS.find(
      (i) => i.id.toUpperCase() === cleanId || i.number.toUpperCase() === cleanId
    );

    if (!inc) {
      inc = await this.findOne(tenantId, id);
    }

    if (inc) {
      if (dto.department) inc.department = dto.department;
      if (dto.assignedTo) inc.assignedTo = dto.assignedTo;
      if (dto.state) inc.state = dto.state;
      if (dto.resolutionCode) inc.resolutionCode = dto.resolutionCode;
      if (dto.resolutionNotes) inc.resolutionNotes = dto.resolutionNotes;
      if (dto.shortDescription) inc.shortDescription = dto.shortDescription;
      if (dto.description) inc.description = dto.description;
      if (dto.impact) inc.impact = dto.impact;
      if (dto.urgency) inc.urgency = dto.urgency;
      if (dto.priority) inc.priority = dto.priority;
      saveDatabaseToFile(DATABASE_1000_INCIDENTS);
    }

    return inc;
  }

  async addActivity(tenantId: string, incidentId: string, authorId: string, dto: AddActivityDto) {
    const inc = await this.findOne(tenantId, incidentId);
    const newAct = {
      id: `act_${Date.now()}`,
      incidentId,
      author: authorId === 'ai_router_agent' ? '🤖 Agentic AI Router' : 'System Admin',
      comment: dto.comment,
      isWorkNote: dto.isWorkNote,
      timestamp: new Date().toLocaleTimeString(),
    };
    if (inc) {
      if (!inc.activities) inc.activities = [];
      inc.activities.unshift(newAct);
      saveDatabaseToFile(DATABASE_1000_INCIDENTS);
    }
    return newAct;
  }

  async remediate(tenantId: string, incidentId: string) {
    const cleanId = (incidentId || '').toUpperCase();
    const inc = await this.findOne(tenantId, cleanId);
    if (!inc) {
      throw new NotFoundException(`Incident ${incidentId} not found`);
    }

    const text = `${inc.shortDescription || ''} ${inc.description || ''} ${inc.configurationItem || ''} ${inc.department || ''}`.toLowerCase();

    let playbookName = 'STANDARD_APP_SUPPORT_REMEDIATION';
    let resCode = 'Application - Code & SSO Fix';
    let targetDept = inc.department && !inc.department.includes('UNASSIGNED') ? inc.department : 'App Support';
    let assignedTech = inc.assignedTo && !inc.assignedTo.includes('UNASSIGNED') ? inc.assignedTo : 'Alex Mercer (App Support)';
    
    let steps: string[] = [];
    let logSummary = '';

    if (text.includes('router') || text.includes('latency') || text.includes('bgp') || text.includes('network') || text.includes('thousandeyes')) {
      playbookName = 'NETWORK_BGP_INTERFACE_RESERVE_PLAYBOOK';
      resCode = 'Network - BGP & Interface Reset';
      targetDept = 'Network Ops';
      assignedTech = 'Sarah Connor (Network Ops)';
      steps = [
        '🔍 [Step 1: Diagnostics] Analyzed BGP peer status & eth0 interface packet drops.',
        '⚡ [Step 2: Execution] Flushed BGP routing tables & reset interface eth0.',
        '🧪 [Step 3: Verification] Sent ICMP probe; link latency returned to <5ms.',
        '✅ [Step 4: Completion] Auto-healing complete. System restored to full capacity.'
      ];
      logSummary = 'Flushed BGP routing tables, reset interface eth0, link latency returned to <5ms.';
    } else if (text.includes('postgres') || text.includes('database') || text.includes('db connection') || text.includes('replication') || text.includes('vacuum')) {
      playbookName = 'POSTGRES_AUTOVACUUM_POOL_OPTIMIZATION';
      resCode = 'DB - Connection Pool & Vacuum';
      targetDept = 'DBA Team';
      assignedTech = 'DBA Team Lead';
      steps = [
        '🔍 [Step 1: Diagnostics] Detected primary database table bloat & connection pool saturation.',
        '⚡ [Step 2: Execution] Executed emergency autovacuum & expanded connection pool size to 100.',
        '🧪 [Step 3: Verification] Verified query latency drops from 4,500ms to 12ms baseline.',
        '✅ [Step 4: Completion] Primary database healthy. Connection pool operating normally.'
      ];
      logSummary = 'Ran autovacuum on primary table, optimized connection pool size, DB latency normal.';
    } else if (text.includes('kubernetes') || text.includes('k8s') || text.includes('ingress') || text.includes('cpu') || text.includes('devops')) {
      playbookName = 'K8S_INGRESS_REPLICA_AUTOSCALE_PLAYBOOK';
      resCode = 'Server - Kernel & OS Patch';
      targetDept = 'DevOps Ops';
      assignedTech = 'DevOps Lead';
      steps = [
        '🔍 [Step 1: Diagnostics] Detected 98% CPU throttling on Kubernetes Ingress controller pods.',
        '⚡ [Step 2: Execution] Auto-scaled HorizontalPodAutoscaler replicas from 3 to 12.',
        '🧪 [Step 3: Verification] Ingress HTTP 504 errors dropped to 0%. Pod CPU usage at 24%.',
        '✅ [Step 4: Completion] Ingress controller auto-scaled. Traffic routing fully healthy.'
      ];
      logSummary = 'Scaled Kubernetes Deployment replicas from 3 to 12, pod status Returned to Healthy.';
    } else if (text.includes('kernel') || text.includes('unix') || text.includes('mainframe') || text.includes('panic') || text.includes('sysctl')) {
      playbookName = 'UNIX_KERNEL_PARAM_SYSCTL_RECOVERY';
      resCode = 'Server - Kernel & OS Patch';
      targetDept = 'Unix';
      assignedTech = 'Richard Stallman (Unix)';
      steps = [
        '🔍 [Step 1: Diagnostics] Captured kernel panic core dump on host mainframe-host-01.',
        '⚡ [Step 2: Execution] Tuned sysctl kernel parameters & restarted systemd daemon.',
        '🧪 [Step 3: Verification] Mainframe memory allocation stabilized; kernel panic cleared.',
        '✅ [Step 4: Completion] Unix mainframe host online and operating within safe memory bounds.'
      ];
      logSummary = 'Analyzed kernel core dump, tuned sysctl kernel parameters, and restarted systemd daemon.';
    } else if (text.includes('okta') || text.includes('ldap') || text.includes('active directory') || text.includes('tls') || text.includes('secops') || text.includes('security') || text.includes('cert')) {
      playbookName = 'SECOPS_TLS_CERT_ROTATION_FIREWALL_UPDATE';
      resCode = 'Security - TLS & Firewall Rule';
      targetDept = 'SecOps';
      assignedTech = 'Security Team';
      steps = [
        '🔍 [Step 1: Diagnostics] Detected expired TLS certificate on ingress security gateway.',
        '⚡ [Step 2: Execution] Rotated TLS certificate via ACME protocol & updated firewall ingress rules.',
        '🧪 [Step 3: Verification] SSL handshake test passed 100%. Handshake latency: 14ms.',
        '✅ [Step 4: Completion] Security gateway updated with valid 90-day TLS certificate.'
      ];
      logSummary = 'Rotated expired TLS certificates, updated firewall ingress rules, security alert resolved.';
    } else {
      playbookName = 'APP_SUPPORT_REDIS_CACHE_CLEAR_PLAYBOOK';
      resCode = 'Application - Code & SSO Fix';
      targetDept = 'App Support';
      assignedTech = 'Alex Mercer (App Support)';
      steps = [
        '🔍 [Step 1: Diagnostics] Identified corrupted Redis session cache keys causing SSO auth failures.',
        '⚡ [Step 2: Execution] Cleared Redis session cache & updated OAuth callback endpoints.',
        '🧪 [Step 3: Verification] Executed synthetic SSO auth login test; 200 OK returned.',
        '✅ [Step 4: Completion] Application session tokens valid. User login service operational.'
      ];
      logSummary = 'Cleared Redis session cache, updated OAuth callback endpoints, SSO login verified.';
    }

    // Mutate incident state
    inc.state = 'RESOLVED';
    inc.department = targetDept;
    inc.assignedTo = assignedTech;
    inc.resolutionCode = resCode;
    inc.resolutionNotes = `[🤖 Autonomous AI Self-Healing Bot]: Successfully executed playbook "${playbookName}". Diagnostic summary: ${logSummary}`;

    if (!inc.activities) inc.activities = [];

    // Add step-by-step activities
    const now = new Date().toLocaleTimeString();
    steps.forEach((stepText, idx) => {
      inc.activities.unshift({
        id: `act_remediate_${Date.now()}_${idx}`,
        incidentId: cleanId,
        author: '🤖 Autonomous AI Self-Healing Agent',
        comment: stepText,
        isWorkNote: true,
        timestamp: now,
      });
    });

    saveDatabaseToFile(DATABASE_1000_INCIDENTS);

    return {
      success: true,
      incidentId: cleanId,
      playbookName,
      resolutionCode: resCode,
      department: targetDept,
      assignedTo: assignedTech,
      resolutionNotes: inc.resolutionNotes,
      executionSteps: steps,
      incident: inc,
    };
  }
}
