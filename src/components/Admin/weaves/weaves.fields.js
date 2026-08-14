export const weaveFields = [
  {
    name: 'name', 
    label: 'Weave Name',
    type: 'text', 
    placeholder: 'e.g. Oxford, Twill, Poplin',
    colSpan: 2,
    validation: {
      required: 'Weave name is required.',
      minLength: { value: 2, message: 'Min 2 characters.' }
    },
  }
];

export const buildWeavePayload = (formValues) => ({
  name: formValues.name.trim()
});