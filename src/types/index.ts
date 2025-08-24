// Core types for the AI Workflow Editor

export interface WorkflowNode {
  id: string;
  type: 'textInput' | 'imageInput' | 'aiPrompt' | 'textProcessor' | 'imageGeneration' | 'output';
  position: { x: number; y: number };
  data: {
    label: string;
    value?: string;
    imageUrl?: string;
    prompt?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    [key: string]: any;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  animated?: boolean;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
      url: string;
      detail?: 'low' | 'high' | 'auto';
    };
  }>;
}

export interface OpenAIRequest {
  prompt?: string;
  messages?: AIMessage[];
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface NodeData {
  nodeId: string;
  executeWorkflow?: (nodeId: string) => Promise<{ textContext: string; imageContext: string[] }>;
  onDataChange?: (nodeId: string, data: any) => void;
  activateEdgeFlow?: (sourceNodeId: string) => void;
  [key: string]: any;
}

