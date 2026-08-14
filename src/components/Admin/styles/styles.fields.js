export const styleFields = [
  {
    name: 'name', 
    label: 'Style Name',
    type: 'text', 
    placeholder: 'e.g. Casual, Formal, Wedding Wear',
    colSpan: 2,
    validation: {
      required: 'Style name is required.',
      minLength: { value: 2, message: 'Min 2 characters.' }
    },
  }
];

export const buildStylePayload = (formValues) => ({
  name: formValues.name.trim()
});