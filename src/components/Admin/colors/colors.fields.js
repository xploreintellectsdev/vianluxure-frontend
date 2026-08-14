export const colorFields = [
  {
    name: 'name', 
    label: 'Color Name',
    type: 'text', 
    placeholder: 'e.g. Navy Blue, Maroon',
    validation: {
      required: 'Color name is required.',
    },
  },
  {
    name: 'hexCode', 
    label: 'HEX Code',
    type: 'text', 
    placeholder: 'e.g. #000000',
    validation: {
      required: 'HEX code is required.',
      pattern: {
        value: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
        message: 'Invalid HEX format (e.g. #FFFFFF)'
      }
    },
  }
];

export const buildColorPayload = (formValues) => ({
  name: formValues.name.trim(),
  hexCode: formValues.hexCode.trim()
});