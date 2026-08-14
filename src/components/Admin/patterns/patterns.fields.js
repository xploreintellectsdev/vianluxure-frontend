export const patternFields = [
  {
    name: 'name', 
    label: 'Pattern Name',
    type: 'text', 
    placeholder: 'e.g. Solid, Check, Stripe',
    colSpan: 2,
    validation: {
      required: 'Pattern name is required.',
      minLength: { value: 2, message: 'Min 2 characters.' }
    },
  }
];

export const buildPatternPayload = (formValues) => ({
  name: formValues.name.trim()
});