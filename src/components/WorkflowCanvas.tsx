'use client';

import React, { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Connection,
  Controls,
  Edge,
  EdgeChange,
  Node,
  NodeChange,

  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import '../styles/animated-edges.css';
import { FileText, Image, Brain, Zap, Monitor, Settings, Sun, Moon } from 'lucide-react';

import TextInputNode from './nodes/TextInputNode';
import ImageInputNode from './nodes/ImageInputNode';
import AIPromptNode from './nodes/AIPromptNode';
import TextProcessorNode from './nodes/TextProcessorNode';
import OutputNode from './nodes/OutputNode';
import ImageGenerationNode from './nodes/ImageGenerationNode';
import AnimatedEdge, { EdgeMarkers } from './AnimatedEdge';

const nodeTypes = {
  textInput: TextInputNode,
  imageInput: ImageInputNode,
  aiPrompt: AIPromptNode,
  textProcessor: TextProcessorNode,
  imageGeneration: ImageGenerationNode,
  output: OutputNode,
};

const edgeTypes = {
  animated: AnimatedEdge,
};

const initialNodes: Node[] = [
  {
    id: 'welcome',
    type: 'textInput',
    position: { x: 100, y: 100 },
    data: { 
      label: 'Welcome Text',
      value: 'Welcome to Daisy AI Workflow Editor! Drag nodes from the sidebar to get started.',
    },
  },
];

const initialEdges: Edge[] = [];

let id = 0;
const getId = () => `dnd_${id++}`;

// Context Menu Component
interface ContextMenuProps {
  x: number;
  y: number;
  onNodeCreate: (nodeType: string) => void;
  onClose: () => void;
}

function ContextMenu({ x, y, onNodeCreate, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Element)) {
        onClose();
      }
    };

    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case 't': onNodeCreate('textInput'); break;
        case 'i': onNodeCreate('imageInput'); break;
        case 'a': onNodeCreate('aiPrompt'); break;
        case 'g': onNodeCreate('imageGeneration'); break;
        case 'o': onNodeCreate('output'); break;
        case 'p': onNodeCreate('textProcessor'); break;
        case 'escape': onClose(); break;
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [onNodeCreate, onClose]);

  const menuItems = [
    { type: 'textInput', label: 'Text', icon: FileText, shortcut: 'T' },
    { type: 'imageInput', label: 'Image', icon: Image, shortcut: 'I' },
    { type: 'aiPrompt', label: 'AI Prompt', icon: Brain, shortcut: 'A' },
    { type: 'imageGeneration', label: 'Generate', icon: Zap, shortcut: 'G' },
    { type: 'textProcessor', label: 'Process', icon: Settings, shortcut: 'P' },
    { type: 'output', label: 'Output', icon: Monitor, shortcut: 'O' },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl p-2 min-w-[200px]"
      style={{ left: x, top: y }}
    >
      <div className="text-xs text-gray-400 px-2 py-1 mb-1 border-b border-gray-700">
        Add Block
      </div>
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.type}
            onClick={() => onNodeCreate(item.type)}
            className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-700 rounded text-white text-sm transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
                <Icon className="w-4 h-4" />
              </div>
              <span>{item.label}</span>
            </div>
            <span className="text-xs text-gray-400 font-mono">{item.shortcut}</span>
          </button>
        );
      })}
      <div className="text-xs text-gray-500 px-2 py-1 mt-2 border-t border-gray-700">
        Press ESC to close • Use shortcuts
      </div>
    </div>
  );
}

function WorkflowCanvasInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [lastClickTime, setLastClickTime] = useState<number>(0);
  const [lastClickPosition, setLastClickPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const [activeEdges, setActiveEdges] = useState<Set<string>>(new Set());
  const [isDraggingNode, setIsDraggingNode] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // Load theme preference from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('daisy-canvas-theme');
      return saved === 'dark';
    }
    return false;
  });

  // Toggle theme function
  const toggleTheme = useCallback(() => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('daisy-canvas-theme', newTheme ? 'dark' : 'light');
    }
  }, [isDarkMode]);

  // Theme configuration
  const themeConfig = {
    light: {
      canvasBackground: 'bg-gray-50',
      gridColor: '#d9d9d9',
      controlsClass: 'bg-white border-gray-300 shadow-lg',
      toggleButtonClass: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    },
    dark: {
      canvasBackground: 'bg-gray-900',
      gridColor: '#374151',
      controlsClass: 'bg-gray-800 border-gray-700',
      toggleButtonClass: 'bg-gray-700 hover:bg-gray-600 text-gray-200',
    }
  };

  const currentTheme = themeConfig[isDarkMode ? 'dark' : 'light'];

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // Detect if any node is being dragged
      const isDragging = changes.some(change => 
        change.type === 'position' && change.dragging
      );
      
      setIsDraggingNode(isDragging);
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge = {
        ...connection,
        id: `edge-${connection.source}-${connection.target}`,
        type: 'animated',
        animated: true,
        data: {
          isActive: false,
        },
      };
      
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    
    // Check if dragging from node library or files from desktop
    const reactFlowNodeType = event.dataTransfer.getData('application/reactflow');
    const hasFiles = event.dataTransfer.files && event.dataTransfer.files.length > 0;
    const hasItems = event.dataTransfer.items && event.dataTransfer.items.length > 0;
    
    if (reactFlowNodeType) {
      // Node from library
      event.dataTransfer.dropEffect = 'move';
      setIsDraggingFile(false);
    } else if (hasFiles || hasItems) {
      // Files from desktop
      event.dataTransfer.dropEffect = 'copy';
      setIsDraggingFile(true);
    } else {
      event.dataTransfer.dropEffect = 'move';
      setIsDraggingFile(false);
    }
  }, []);

  // Helper function to convert file to data URL
  const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Helper function to read text file
  const fileToText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const onDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();
      setIsDraggingFile(false);

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!reactFlowBounds || !reactFlowInstance) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // Handle node library drops
      const nodeType = event.dataTransfer.getData('application/reactflow');
      if (nodeType) {
        const newNodeData = {
          textInput: { 
            label: 'Text Input',
            value: 'Enter your text here...',
            placeholder: 'Type something...'
          },
          imageInput: { 
            label: 'Image Input',
            imageUrl: '',
            description: 'Upload or paste image URL'
          },
          aiPrompt: { 
            label: 'AI Prompt',
            prompt: 'Create a detailed description of:',
            model: 'gpt-4o',
            temperature: 0.7,
            maxTokens: 1000
          },
          textProcessor: { 
            label: 'Text Processor',
            operation: 'uppercase',
            customOperation: ''
          },
          imageGeneration: { 
            label: 'Image Generation',
            prompt: 'A beautiful landscape painting...',
            size: '1024x1024',
            quality: 'standard',
            style: 'vivid'
          },
          output: { 
            label: 'Output',
            value: '',
            format: 'text'
          },
        };

        const newNode: Node = {
          id: getId(),
          type: nodeType,
          position,
          data: newNodeData[nodeType as keyof typeof newNodeData] || { label: `${nodeType} node` },
        };

        setNodes((nds) => nds.concat(newNode));
        return;
      }

      // Handle file drops from desktop
      const files = Array.from(event.dataTransfer.files);
      if (files.length === 0) return;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePosition = {
          x: position.x + (i * 20), // Offset multiple files
          y: position.y + (i * 20)
        };

        try {
          if (file.type.startsWith('image/')) {
            // Handle image files
            const dataURL = await fileToDataURL(file);
            const newNode: Node = {
              id: getId(),
              type: 'imageInput',
              position: filePosition,
              data: {
                label: `Image: ${file.name}`,
                imageUrl: dataURL,
                description: `Uploaded: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
                fileName: file.name,
                fileSize: file.size
              },
            };
            setNodes((nds) => nds.concat(newNode));
          } else if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
            // Handle text files
            const textContent = await fileToText(file);
            const newNode: Node = {
              id: getId(),
              type: 'textInput',
              position: filePosition,
              data: {
                label: `Text: ${file.name}`,
                value: textContent,
                placeholder: `Content from ${file.name}`,
                fileName: file.name,
                fileSize: file.size
              },
            };
            setNodes((nds) => nds.concat(newNode));
          } else {
            // Handle other file types as text input with file info
            const newNode: Node = {
              id: getId(),
              type: 'textInput',
              position: filePosition,
              data: {
                label: `File: ${file.name}`,
                value: `File uploaded: ${file.name}\nType: ${file.type || 'unknown'}\nSize: ${(file.size / 1024).toFixed(1)} KB`,
                placeholder: 'File information',
                fileName: file.name,
                fileSize: file.size
              },
            };
            setNodes((nds) => nds.concat(newNode));
          }
        } catch (error) {
          console.error('Error processing file:', file.name, error);
          // Create an error node if file processing fails
          const errorNode: Node = {
            id: getId(),
            type: 'textInput',
            position: filePosition,
            data: {
              label: `Error: ${file.name}`,
              value: `Failed to process file: ${file.name}\nError: ${error}`,
              placeholder: 'File processing error'
            },
          };
          setNodes((nds) => nds.concat(errorNode));
        }
      }
    },
    [reactFlowInstance]
  );

  // Handle click on canvas to detect double-clicks
  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      const currentTime = Date.now();
      const x = event.clientX;
      const y = event.clientY;
      
      // Check if this is a double-click (within 300ms and close position)
      const timeDiff = currentTime - lastClickTime;
      const positionDiff = lastClickPosition ? 
        Math.sqrt(Math.pow(x - lastClickPosition.x, 2) + Math.pow(y - lastClickPosition.y, 2)) : 100;
      
      if (timeDiff < 300 && positionDiff < 10) {
        // Double click detected
        event.preventDefault();
        setContextMenu({ x, y });
        // Reset to prevent triple-click issues
        setLastClickTime(0);
        setLastClickPosition(null);
      } else {
        // Single click - store time and position for next click
        setLastClickTime(currentTime);
        setLastClickPosition({ x, y });
        // Close context menu if it's open
        if (contextMenu) {
          setContextMenu(null);
        }
      }
    },
    [lastClickTime, lastClickPosition, contextMenu]
  );

  // Create node at the position where context menu was opened
  const createNodeAtPosition = useCallback(
    (nodeType: string) => {
      if (!contextMenu || !reactFlowInstance) return;

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!reactFlowBounds) return;

      // Convert screen coordinates to canvas coordinates
      const position = reactFlowInstance.project({
        x: contextMenu.x - reactFlowBounds.left,
        y: contextMenu.y - reactFlowBounds.top,
      });

      const newNodeData = {
        textInput: { 
          label: 'Text Input',
          value: 'Enter your text here...',
          placeholder: 'Type something...'
        },
        imageInput: { 
          label: 'Image Input',
          imageUrl: '',
          description: 'Upload or paste image URL'
        },
        aiPrompt: { 
          label: 'AI Prompt',
          prompt: 'Create a detailed description of:',
          model: 'gpt-4o',
          temperature: 0.7,
          maxTokens: 1000
        },
        textProcessor: { 
          label: 'Text Processor',
          operation: 'uppercase',
          customOperation: ''
        },
        imageGeneration: { 
          label: 'Image Generation',
          prompt: 'A beautiful landscape painting...',
          size: '1024x1024',
          quality: 'standard',
          style: 'vivid'
        },
        output: { 
          label: 'Output',
          value: '',
          format: 'text'
        },
      };

      const newNode: Node = {
        id: getId(),
        type: nodeType,
        position,
        data: newNodeData[nodeType as keyof typeof newNodeData] || { label: `${nodeType} node` },
      };

      setNodes((nds) => nds.concat(newNode));
      setContextMenu(null); // Close menu after creating node
    },
    [contextMenu, reactFlowInstance]
  );

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  // Test animation function - activates ALL edges
  const testAnimation = useCallback(() => {
    console.log('Testing animation - activating all edges');
    console.log('Current edges:', edges);
    const allEdgeIds = edges.map(edge => edge.id);
    console.log('All edge IDs:', allEdgeIds);
    setActiveEdges(new Set(allEdgeIds));
    
    // Force re-render of edges to apply new styles
    setEdges(currentEdges => [...currentEdges]);
    
    // Deactivate after 5 seconds
    setTimeout(() => {
      setActiveEdges(new Set());
      console.log('Test animation ended');
    }, 5000);
  }, [edges, setEdges]);

  // Handle drag leave to reset dragging state
  const onDragLeave = useCallback((event: React.DragEvent) => {
    // Only reset if actually leaving the canvas area
    const rect = reactFlowWrapper.current?.getBoundingClientRect();
    if (rect) {
      const isOutside = event.clientX < rect.left || event.clientX > rect.right ||
                       event.clientY < rect.top || event.clientY > rect.bottom;
      if (isOutside) {
        setIsDraggingFile(false);
      }
    }
  }, []);

  const onNodeDataChange = useCallback((nodeId: string, data: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...data } };
        }
        return node;
      })
    );
  }, []);

  // Function to get connected input nodes for a given node
  const getConnectedInputs = useCallback((nodeId: string) => {
    const connectedInputs: Array<{ nodeId: string; data: any; type: string }> = [];
    
    // Find all edges that connect TO this node (inputs)
    const incomingEdges = edges.filter(edge => edge.target === nodeId);
    
    incomingEdges.forEach(edge => {
      const sourceNode = nodes.find(node => node.id === edge.source);
      if (sourceNode) {
        connectedInputs.push({
          nodeId: sourceNode.id,
          data: sourceNode.data,
          type: sourceNode.type || 'unknown'
        });
      }
    });
    
    return connectedInputs;
  }, [nodes, edges]);

  // Function to execute a workflow starting from a specific node
  const executeWorkflow = useCallback(async (nodeId: string, context: any = {}) => {
    const connectedInputs = getConnectedInputs(nodeId);
    
    console.log('executeWorkflow called for node:', nodeId);
    console.log('Connected inputs:', connectedInputs);
    
    // Prepare context from connected inputs
    let combinedContext = '';
    let imageContext = '';
    
    connectedInputs.forEach(input => {
      console.log('Processing input:', input.type, input.data);
      
      switch (input.type) {
        case 'textInput':
          if (input.data.value) {
            combinedContext += `Text Input: ${input.data.value}\n`;
          }
          break;
        case 'imageInput':
          if (input.data.imageUrl) {
            imageContext = input.data.imageUrl;
            combinedContext += `Image: [Image provided]\n`;
            console.log('Found image input:', input.data.imageUrl.substring(0, 50) + '...');
          }
          break;
        case 'textProcessor':
          if (input.data.outputText) {
            combinedContext += `Processed Text: ${input.data.outputText}\n`;
          }
          break;
        case 'aiPrompt':
          if (input.data.response) {
            combinedContext += `AI Response: ${input.data.response}\n`;
          }
          break;
        case 'imageGeneration':
          if (input.data.imageUrl) {
            imageContext = input.data.imageUrl;
            combinedContext += `Generated Image: [Image generated from DALL-E]\n`;
            if (input.data.revisedPrompt) {
              combinedContext += `Original Prompt: ${input.data.revisedPrompt}\n`;
            }
          }
          break;
      }
    });
    
    console.log('Final context - text:', combinedContext);
    console.log('Final context - image:', imageContext ? 'Image present' : 'No image');
    
    return {
      textContext: combinedContext.trim(),
      imageContext: imageContext,
      connectedInputs: connectedInputs
    };
  }, [getConnectedInputs]);

  // Function to activate edges when data is flowing
  const activateEdgeFlow = useCallback((nodeId: string, duration: number = 3000) => {
    // Find all edges connected TO this node
    const incomingEdgeIds = edges
      .filter(edge => edge.target === nodeId)
      .map(edge => edge.id);
    
    // Activate the edges
    setActiveEdges(prev => {
      const newSet = new Set(prev);
      incomingEdgeIds.forEach(id => newSet.add(id));
      return newSet;
    });
    
    // Deactivate after duration
    setTimeout(() => {
      setActiveEdges(prev => {
        const newSet = new Set(prev);
        incomingEdgeIds.forEach(id => newSet.delete(id));
        return newSet;
      });
    }, duration);
  }, [edges]);

      // Enhanced edges with activity state and drag optimization
  const enhancedEdges = edges.map(edge => ({
    ...edge,
    data: {
      ...edge.data,
      isActive: activeEdges.has(edge.id) && !isDraggingNode,
      isDragging: isDraggingNode,
    },
    // Simplify edge type during dragging for performance
    type: isDraggingNode ? 'default' : 'animated',
    animated: !isDraggingNode,
    style: {
      strokeWidth: 2,
      transition: isDraggingNode ? 'none' : 'all 0.2s ease',
    },
  }));

  // Create enhanced nodes with workflow execution capabilities
  const enhancedNodes = nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      nodeId: node.id,
      executeWorkflow,
      onDataChange: (data: any) => onNodeDataChange(node.id, data),
      activateEdgeFlow: () => activateEdgeFlow(node.id),
    }
  }));

  return (
    <div className="w-full h-full" ref={reactFlowWrapper}>
      {/* Test Animation Button */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={testAnimation}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded shadow-lg transition-colors flex items-center space-x-2"
        >
          <span>⚡</span>
          <span>Test Animation (v2)</span>
        </button>
      </div>

      {/* File drop overlay */}
      {isDraggingFile && (
        <div className="absolute inset-0 z-40 bg-blue-500/20 border-4 border-dashed border-blue-400 flex items-center justify-center pointer-events-none">
          <div className="bg-gray-800/90 px-6 py-4 rounded-lg border border-gray-600">
            <div className="text-center">
              <div className="text-4xl mb-2">📁</div>
              <div className="text-white font-medium mb-1">Drop files here</div>
              <div className="text-gray-300 text-sm">Images, text files, and more...</div>
            </div>
          </div>
        </div>
      )}
      
      <ReactFlow
        nodes={enhancedNodes}
        edges={enhancedEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStart={() => setIsDraggingNode(true)}
        onNodeDragStop={() => setIsDraggingNode(false)}
        defaultEdgeOptions={{
          type: 'animated',
          animated: !isDraggingNode,
        }}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        zoomOnDoubleClick={false}
        panOnScroll={true}
        panOnScrollMode="free"
        panOnScrollSpeed={0.8}
        panOnDrag={true}
        defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
        minZoom={0.1}
        maxZoom={2}
        translateExtent={[[-5000, -5000], [5000, 5000]]}
        nodeExtent={[[-5000, -5000], [5000, 5000]]}
        className={`${currentTheme.canvasBackground} ${isDraggingNode ? 'dragging' : ''}`}
        proOptions={{ hideAttribution: true }}
      >
        <Controls className={currentTheme.controlsClass} />
        <Background color={currentTheme.gridColor} gap={50} size={3} />
        <EdgeMarkers />
      </ReactFlow>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className={`fixed top-4 right-4 p-3 rounded-full border-2 shadow-lg transition-all duration-200 z-50 ${currentTheme.toggleButtonClass}`}
        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDarkMode ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </button>
      
      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onNodeCreate={createNodeAtPosition}
          onClose={closeContextMenu}
        />
      )}
    </div>
  );
}

export default function WorkflowCanvas() {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner />
    </ReactFlowProvider>
  );
}
