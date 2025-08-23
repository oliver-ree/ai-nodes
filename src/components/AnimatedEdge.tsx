'use client';

import React, { useMemo } from 'react';
import { EdgeProps, getBezierPath, Position } from 'reactflow';

interface AnimatedEdgeData {
  sourceType?: string;
  isActive?: boolean;
  isDragging?: boolean;
}

export default function AnimatedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<AnimatedEdgeData>) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edgeStyles = useMemo(() => {
    const isActive = data?.isActive || false;
    const isDragging = data?.isDragging || false;

    // Simplified styles during dragging for performance
    if (isDragging) {
      return {
        stroke: '#6b7280',
        strokeWidth: 2,
        strokeDasharray: 'none',
        filter: 'none',
      };
    }

    // Static grey line when not active
    if (!isActive) {
      return {
        stroke: '#6b7280',
        strokeWidth: 2,
        strokeDasharray: 'none',
        filter: 'none',
      };
    }

    // White traveling section when active - handled by CSS animation
    // Don't set strokeDasharray here - let CSS handle it
    return {
      stroke: '#ffffff',
      strokeWidth: 3,
      filter: 'none',
    };
  }, [data?.isActive, data?.isDragging]);

  const animationClass = useMemo(() => {
    const isActive = data?.isActive || false;
    const isDragging = data?.isDragging || false;
    
    // No animation classes during dragging
    if (isDragging) return '';
    
    // Simple animated class when active
    if (isActive) return 'animated';
    return '';
  }, [data?.isActive, data?.isDragging]);

  // Skip expensive effects during dragging
  const isDragging = data?.isDragging || false;
  const isActive = data?.isActive || false;

  return (
    <>
      {/* Main animated path */}
      <path
        id={id}
        className={animationClass ? `react-flow__edge-path ${animationClass}` : 'react-flow__edge-path'}
        d={edgePath}
        style={{
          ...edgeStyles,
          // Disable will-change during dragging to improve performance
          willChange: isDragging ? 'auto' : 'transform',
        }}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        markerEnd={`url(#arrow-default)`}
      />
      
      
    </>
  );
}

// Simple marker definition
export function EdgeMarkers() {
  return (
    <defs>
      <marker
        id="arrow-default"
        markerWidth="8"
        markerHeight="8"
        refX="6"
        refY="4"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path
          d="M0,0 L0,8 L6,4 z"
          fill="#6b7280"
        />
      </marker>
    </defs>
  );
}