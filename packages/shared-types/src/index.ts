export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'date'
  | 'reference'
  | 'attachment'
  | 'richtext';

export interface FormField {
  id: string;
  name: string;
  label: string;
  fieldType: FieldType;
  placeholder?: string;
  defaultValue?: any;
  required: boolean;
  readOnly?: boolean;
  hidden?: boolean;
  options?: Array<{ label: string; value: string }>;
  referenceTable?: string;
}

export interface FormSection {
  id: string;
  title: string;
  fields: FormField[];
}

export interface FormSchema {
  id: string;
  title: string;
  sections: FormSection[];
  uiPolicies?: UiPolicy[];
}

export interface UiPolicy {
  id: string;
  name: string;
  conditions: Array<{
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: any;
  }>;
  actions: Array<{
    targetField: string;
    visible?: boolean;
    mandatory?: boolean;
    readOnly?: boolean;
  }>;
}

export type WorkflowNodeType =
  | 'start'
  | 'end'
  | 'approval'
  | 'condition'
  | 'timer'
  | 'rest_call'
  | 'email'
  | 'script';

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  label: string;
  config: Record<string, any>;
  position: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}
