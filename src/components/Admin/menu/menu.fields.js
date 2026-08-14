export const getNavbarFields = () => [
  { name: 'label', label: 'Label', type: 'text', placeholder: 'e.g. Home', validation: { required: 'Label is required' } },
  { name: 'link', label: 'Link', type: 'text', placeholder: 'e.g. /home', validation: { required: 'Link is required' } },
  { name: 'order_no', label: 'Order Number', type: 'number', placeholder: '0' },
  { name: 'is_active', label: 'Active Status', type: 'checkbox' }
];

export const getFooterFields = () => [
  { 
    name: 'group_name', 
    label: 'Group / Column', 
    type: 'select', 
    options: [
      { value: 'Description', label: 'Brand Description' },
      { value: 'Links', label: 'Links' },
      { value: 'Policy', label: 'Policy' },
      { value: 'Contacts', label: 'Contacts (including Address)' },
      { value: 'Social', label: 'Social' }
    ],
    validation: { required: 'Group is required' }
  },
  { 
    name: 'item_type', 
    label: 'Item Type', 
    type: 'select', 
    options: [
      { value: 'link', label: 'Standard Link' },
      { value: 'phone', label: 'Phone Number' },
      { value: 'email', label: 'Email Address' },
      { value: 'social', label: 'Social Icon' },
      { value: 'text', label: 'Plain Text / Address' }
    ],
    validation: { required: 'Item type is required' }
  },
  { 
    name: 'label', 
    label: 'Label / Name', 
    type: 'text', 
    placeholder: 'e.g. Terms and Condition, Home, +91 9876543210', 
    validation: { required: 'Label is required' },
    showIf: (values) => values.item_type !== 'text'
  },
  { 
    name: 'label', 
    label: 'Text Content / Address', 
    type: 'textarea', 
    placeholder: 'Enter your multiline text or address here...', 
    validation: { required: 'Text content is required' },
    showIf: (values) => values.item_type === 'text'
  },
  { 
    name: 'link', 
    label: 'Link / URL (Optional)', 
    type: 'text', 
    placeholder: 'e.g. /policy/terms',
    showIf: (values) => ['link', 'phone', 'email'].includes(values.item_type)
  },
  { 
    name: 'link', 
    label: 'Social Profile URL', 
    type: 'text', 
    placeholder: 'e.g. https://instagram.com/vian...',
    showIf: (values) => values.item_type === 'social'
  },
  { 
    name: 'icon', 
    label: 'Icon Name', 
    type: 'select', 
    options: [
      { value: 'FacebookIcon', label: 'Facebook' },
      { value: 'InstagramIcon', label: 'Instagram' },
      { value: 'XIcon', label: 'X (Twitter)' },
      { value: 'YoutubeIcon', label: 'YouTube' }
    ],
    placeholder: 'Select an icon',
    showIf: (values) => values.item_type === 'social' 
  },
  { name: 'order_no', label: 'Order Number', type: 'number', placeholder: '0' },
  { name: 'is_active', label: 'Active Status', type: 'checkbox' }
];
