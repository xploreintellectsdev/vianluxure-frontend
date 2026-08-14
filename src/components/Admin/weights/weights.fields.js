export const weightFields = [
  {
    name: 'name', 
    label: 'Weight Label',
    type: 'text', 
    placeholder: 'e.g. Light, Medium, 205 gsm',
    colSpan: 2,
    validation: {
      required: 'Weight label is required.',
      minLength: { value: 2, message: 'Min 2 characters.' }
    },
  }
];

export const buildWeightPayload = (formValues) => ({
  name: formValues.name.trim()
});