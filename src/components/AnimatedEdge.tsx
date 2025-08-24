import React from 'react';
import { BaseEdge, EdgeProps, getStraightPath } from 'reactflow';

const AnimatedEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}) => {
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <BaseEdge
      path={edgePath}
      markerEnd={markerEnd}
      style={style}
      className="animated"
    />
  );
};

// Export EdgeMarkers component for compatibility
export const EdgeMarkers: React.FC = () => (
  <defs>
    <marker
      id="animated-arrowhead"
      markerWidth="12.5"
      markerHeight="12.5"
      viewBox="-10 -10 20 20"
      markerUnits="strokeWidth"
      orient="auto"
      refX="0"
      refY="0"
    >
      <polyline
        stroke="#6b7280"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        fill="none"
        points="-5,-4 0,0 -5,4"
      />
    </marker>
  </defs>
);

export default AnimatedEdge;
