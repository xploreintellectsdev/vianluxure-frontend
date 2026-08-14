import * as LucideIcons from 'lucide-react';
import React from 'react';

// Common icons used across dynamic sections
const fallbackIcon = LucideIcons['Shirt'];

export function getIconComponent(iconName) {
  if (!iconName) return fallbackIcon;
  const Icon = LucideIcons[iconName];
  return Icon || fallbackIcon;
}
