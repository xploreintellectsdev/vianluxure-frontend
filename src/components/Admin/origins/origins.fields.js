export const originFields = [
  {
    name: 'name', 
    label: 'Origin Name',
    type: 'text', 
    placeholder: 'e.g. Italian, Indian, Egyptian',
    colSpan: 2,
    validation: {
      required: 'Origin name is required.',
      minLength: { value: 2, message: 'Min 2 characters.' }
    },
  }
];

export const buildOriginPayload = (formValues) => ({
  name: formValues.name.trim()
});