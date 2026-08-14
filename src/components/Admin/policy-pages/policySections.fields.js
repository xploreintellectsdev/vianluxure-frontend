import React from 'react';
import { PolicyIcon } from '@/components/Users/policy/PolicyIcon';

const renderIconLabel = (value, label) => (
  <div className="flex items-center gap-2">
    <PolicyIcon name={value} className="w-4 h-4 text-stone-500" />
    <span>{label}</span>
  </div>
);

export const policySectionsFields = [
  { 
    name: 'section_type', 
    label: 'Section Type', 
    type: 'select', 
    options: [
      { value: 'card', label: 'Policy Card' },
      { value: 'stat', label: 'Stat Block (Time to Deliver)' }
    ],
    required: true 
  },
  { 
    name: 'icon', 
    label: 'Icon Name', 
    placeholder: 'Select an icon...',
    type: 'select', 
    options: [
      { value: 'pin', label: renderIconLabel('pin', 'Pin') },
      { value: 'globe', label: renderIconLabel('globe', 'Globe') },
      { value: 'tag', label: renderIconLabel('tag', 'Tag') },
      { value: 'shield', label: renderIconLabel('shield', 'Shield') },
      { value: 'clock', label: renderIconLabel('clock', 'Clock') },
      { value: 'alert', label: renderIconLabel('alert', 'Alert') },
      { value: 'address', label: renderIconLabel('address', 'Address') },
      { value: 'box', label: renderIconLabel('box', 'Box') },
      { value: 'x', label: renderIconLabel('x', 'X (Cross)') },
      { value: 'mail', label: renderIconLabel('mail', 'Mail') },
      { value: 'crown', label: renderIconLabel('crown', 'Crown') },
      { value: 'document', label: renderIconLabel('document', 'Document') },
      { value: 'users', label: renderIconLabel('users', 'Users') },
      { value: 'copyright', label: renderIconLabel('copyright', 'Copyright') },
      { value: 'card', label: renderIconLabel('card', 'Credit Card') },
      { value: 'shieldOff', label: renderIconLabel('shieldOff', 'Shield Off') },
      { value: 'droplet', label: renderIconLabel('droplet', 'Droplet') },
      { value: 'eye', label: renderIconLabel('eye', 'Eye') },
      { value: 'xCircle', label: renderIconLabel('xCircle', 'X Circle') },
      { value: 'refresh', label: renderIconLabel('refresh', 'Refresh') },
      { value: 'ban', label: renderIconLabel('ban', 'Ban') },
      { value: 'swap', label: renderIconLabel('swap', 'Swap') }
    ],
    required: false,
    showIf: (values) => values?.section_type === 'card'
  },
  { 
    name: 'title', 
    label: 'Title', 
    type: 'text', 
    required: false,
    showIf: (values) => values?.section_type === 'card'
  },
  { 
    name: 'content', 
    label: 'Content', 
    placeholder: 'Use "- " for bullets, double newline for paragraphs, **bold** for bold text',
    type: 'textarea', 
    required: false,
    showIf: (values) => values?.section_type === 'card'
  },
  { 
    name: 'stat_value', 
    label: 'Stat Value', 
    placeholder: 'e.g. 7-10',
    type: 'text', 
    required: false,
    showIf: (values) => values?.section_type === 'stat'
  },
  { 
    name: 'stat_unit', 
    label: 'Stat Unit', 
    placeholder: 'e.g. days',
    type: 'text', 
    required: false,
    showIf: (values) => values?.section_type === 'stat'
  },
  { 
    name: 'stat_label', 
    label: 'Stat Label', 
    placeholder: 'e.g. Major Metro Cities',
    type: 'text', 
    required: false,
    showIf: (values) => values?.section_type === 'stat'
  },
  { 
    name: 'stat_caption', 
    label: 'Stat Caption', 
    placeholder: 'e.g. from the order confirmation date',
    type: 'text', 
    required: false,
    showIf: (values) => values?.section_type === 'stat'
  },
  { 
    name: 'order_no', 
    label: 'Order Number', 
    placeholder: 'e.g. 10 (Lower numbers appear first)',
    type: 'number', 
    required: false 
  },
  { name: 'is_active', label: 'Active', type: 'checkbox' }
];

export const mapPolicySectionToFormData = (data) => {
  if (!data) return null;
  return {
    section_id: data.section_id,
    section_type: data.section_type || 'card',
    icon: data.icon || '',
    title: data.title || '',
    content: data.content || '',
    stat_value: data.stat_value || '',
    stat_unit: data.stat_unit || '',
    stat_label: data.stat_label || '',
    stat_caption: data.stat_caption || '',
    order_no: data.order_no ?? '',
    is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
  };
};

export const buildPolicySectionPayload = (formData, pageId, groupName, orderNo) => {
  const payload = { ...formData };
  payload.is_active = payload.is_active ? 1 : 0;
  if (pageId) payload.page_id = pageId;
  if (groupName) payload.group_name = groupName;
  if (orderNo !== undefined) payload.order_no = orderNo; // Fallback for drag-drop
  if (formData.order_no) payload.order_no = parseInt(formData.order_no, 10);
  return payload;
};
