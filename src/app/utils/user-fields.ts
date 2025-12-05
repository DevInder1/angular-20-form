import { FormField } from '../models';

export function getUserFields(): FormField[] {
  return [
    {
      label: 'Control System',
      name: 'controlSystem',
      type: 'dropdown',
      optionLabel: 'displayText',
      options: [],
      required: true,
      displayTooltip: true,
      isWide: false
    },
    {
      label: 'Username',
      name: 'userName',
      type: 'input',
      inputType: 'text',
      required: true,
      displayTooltip: true,
      isWide: false
    },
    {
      label: 'First Name',
      name: 'firstName',
      type: 'input',
      inputType: 'text',
      required: true,
      displayTooltip: true,
      isWide: false
    },
    {
      label: 'Last Name',
      name: 'lastName',
      type: 'input',
      inputType: 'text',
      required: true,
      displayTooltip: true,
      isWide: false
    },
    {
      label: 'Customer Type',
      name: 'type',
      type: 'dropdown',
      optionLabel: 'displayText',
      options: [],
      required: true,
      displayTooltip: true,
      isWide: false
    },
    {
      label: 'Company',
      name: 'company',
      type: 'dropdown',
      options: [],
      optionLabel: 'name',
      required: true,
      displayTooltip: true,
      filter: true,
      isWide: false
    },
    {
      label: 'Default User Level',
      name: 'defaultUserLevel',
      type: 'dropdown',
      isWide: false
    },
    {
      label: 'Password',
      name: 'password',
      type: 'password',
      inputType: 'password',
      required: true,
      displayTooltip: false,
      isWide: false
    },
    {
      label: 'Confirm Password',
      name: 'confirmPassword',
      type: 'input',
      inputType: 'password',
      required: true,
      displayTooltip: false,
      isWide: false
    },
    {
      label: 'Address Line',
      header: 'Address',
      name: 'address',
      type: 'input',
      inputType: 'text',
      isWide: true
    },
    {
      label: 'City',
      name: 'city',
      type: 'input',
      inputType: 'text',
      isWide: false
    },
    {
      label: 'Street',
      name: 'street',
      type: 'input',
      inputType: 'text',
      isWide: false
    },
    {
      label: 'Country',
      name: 'country',
      type: 'dropdown',
      optionLabel: 'countryName',
      filter: true,
      options: [],
      required: true,
      displayTooltip: true,
      isWide: false
    },
    {
      label: 'Zip Code',
      name: 'zipCode',
      type: 'input',
      inputType: 'text',
      isWide: false
    },
    {
      label: 'Contact Number',
      name: 'contactNo',
      type: 'input',
      inputType: 'text',
      displayTooltip: true,
      isWide: false
    },
    {
      label: 'Email Address',
      name: 'emailAddress',
      type: 'input',
      inputType: 'email',
      required: true,
      cssClasses: { 'email-field': true },
      isWide: false
    },
    {
      label: 'Enabled',
      name: 'enabled',
      type: 'checkbox',
      isWide: true
    },
    {
      label: 'Contact First Name',
      name: 'contactFirstName',
      type: 'input',
      inputType: 'text',
      isWide: false
    },
    {
      label: 'Contact Last Name',
      name: 'contactLastName',
      type: 'input',
      inputType: 'text',
      isWide: false
    },
    {
      label: 'Contact Email',
      name: 'contactEmail',
      type: 'input',
      inputType: 'email',
      required: false,
      cssClasses: { 'email-field': true },
      isWide: false
    },
    {
      label: 'Designated Use',
      name: 'designatedUse',
      type: 'dropdown',
      options: [],
      optionLabel: 'displayText',
      isWide: false
    },
    {
      label: 'TCG Portal Username',
      name: 'tcgPortalUsername',
      type: 'input',
      inputType: 'text',
      isWide: false
    },
    {
      label: 'Remarks',
      name: 'remark',
      type: 'textarea',
      isWide: true
    }
  ];
}
