"use client";

import { useState, useEffect } from "react";

export function useTreeStructure(posts) {
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);

  useEffect(() => {
    if (!posts || posts.length === 0) return;

    const newNodes = [];
    const newLinks = [];
    const spacingX = 300;
    const spacingY = 150;

    // Process nodes recursively to build the tree coordinates
    const processNodes = (parentId, startX, startY) => {
      const children = posts.filter(p => p.parentId === parentId);
      
      children.forEach((child, index) => {
        const x = startX + spacingX;
        // Spread children vertically around the parent's Y coordinate
        const y = startY + (index - (children.length - 1) / 2) * spacingY;
        
        newNodes.push({ 
          id: child.id, 
          x, 
          y, 
          text: child.text, 
          author: child.authorName 
        });
        
        if (parentId) {
          const parentNode = newNodes.find(n => n.id === parentId) || newNodes.find(n => n.id === parentId);
          if (parentNode) {
            newLinks.push({ 
              id: `${parentId}-${child.id}`,
              from: { x: parentNode.x, y: parentNode.y }, 
              to: { x, y } 
            });
          }
        }
        
        processNodes(child.id, x, y);
      });
    };

    // Roots are placed on the left side
    const roots = posts.filter(p => p.parentId === null);
    roots.forEach((root, index) => {
      const x = 150;
      const y = (index + 1) * (spacingY * 2.5);
      newNodes.push({ id: root.id, x, y, text: root.text, author: root.authorName });
      processNodes(root.id, x, y);
    });

    setNodes(newNodes);
    setLinks(newLinks);
  }, [posts]);

  return { nodes, links };
}
