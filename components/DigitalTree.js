"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function DigitalTree({ nodes, links, activeNodeId }) {
  const router = useRouter();
  const [winSize, setWinSize] = useState({ w: 1000, h: 800 });

  useEffect(() => {
    setWinSize({ w: window.innerWidth, h: window.innerHeight });
  }, []);

  // Find active node position to center it
  const activeNode = nodes.find(n => n.id === activeNodeId);
  const translateX = activeNode ? -activeNode.x + winSize.w / 3 : 0;
  const translateY = activeNode ? -activeNode.y + winSize.h / 2 : 0;

  return (
    <div className="tree-canvas">
      <motion.svg
        width="5000"
        height="5000"
        animate={{ 
          x: translateX, 
          y: translateY 
        }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
        style={{ cursor: "grab" }}
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Render Links (Branches) */}
        {links.map((link) => (
          <g key={link.id}>
            {/* Digital Path (Right angles) */}
            <motion.path
              d={`M ${link.from.x} ${link.from.y} L ${link.from.x + (link.to.x - link.from.x)/2} ${link.from.y} L ${link.from.x + (link.to.x - link.from.x)/2} ${link.to.y} L ${link.to.x} ${link.to.y}`}
              className="tree-branch-line"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ duration: 1.5 }}
              stroke="#ff3333"
              strokeWidth="2"
              fill="none"
              filter="url(#glow)"
            />
            {/* Data Pulse */}
            <motion.circle
              r="3"
              fill="#fff"
              filter="url(#glow)"
              animate={{
                offsetDistance: ["0%", "100%"]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 2
              }}
              style={{
                offsetPath: `path("M ${link.from.x} ${link.from.y} L ${link.from.x + (link.to.x - link.from.x)/2} ${link.from.y} L ${link.from.x + (link.to.x - link.from.x)/2} ${link.to.y} L ${link.to.x} ${link.to.y}")`
              }}
            />
          </g>
        ))}

        {/* Render Nodes (Post markers) */}
        {nodes.map((node) => (
          <motion.g
            key={node.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.2 }}
            onClick={() => router.push(`/discussions/${node.id}`)}
            style={{ cursor: "pointer" }}
          >
            <circle
              cx={node.x}
              cy={node.y}
              r={node.id === activeNodeId ? 10 : 6}
              className="tree-node-point"
              fill={node.id === activeNodeId ? "#fff" : "#ff3333"}
            />
            
            {/* Label for the node */}
            <foreignObject x={node.x + 15} y={node.y - 20} width="200" height="40">
              <div style={{ 
                color: "#fff", 
                fontSize: "10px", 
                fontWeight: "bold",
                textShadow: "0 0 5px rgba(0,0,0,0.8)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                background: "rgba(0,0,0,0.5)",
                padding: "2px 6px",
                borderRadius: "4px",
                border: node.id === activeNodeId ? "1px solid #ff3333" : "1px solid transparent"
              }}>
                {node.author}: {node.text.substring(0, 20)}...
              </div>
            </foreignObject>
          </motion.g>
        ))}
      </motion.svg>
    </div>
  );
}
