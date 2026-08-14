export const productTypeFields = [
  {
    name: 'name', 
    label: 'Product Type Name',
    type: 'text', 
    placeholder: 'e.g. Fabric, Ready to Wear',
    colSpan: 2,
    validation: {
      required: 'Name is required.',
      minLength: { value: 2, message: 'Min 2 characters.' }
    },
  }
];

export const buildProductTypePayload = (formValues) => ({
  name: formValues.name.trim()
});