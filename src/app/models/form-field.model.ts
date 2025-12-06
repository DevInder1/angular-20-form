export interface FormFieldOption {
  label?: string;
  value?: unknown;
  displayText?: string;
  name?: string;
  id?: number | string;
  countryName?: string;
  code?: string;
}

export interface FormFieldValidator {
  name: string;
  value?: unknown;
  message?: string;
}

export interface FormField {
  label?: string;
  name: string;
  class?: string;
  cardTitle?: string;
  isEditable?: boolean;
  clear?: boolean;
  isCard?: boolean;
  type?: 'input' | 'checkbox' | 'dropdown' | 'textarea' | 'number' | 'calendar' | 'password' |
    'table' | 'inputGroup' | 'pickList' | 'button' | 'tabMenu' | 'label' | 'panel' | 'radio';
  inputType?: string;
  options?: FormFieldOption[];
  hint?: string;
  hide?: boolean;
  validators?: FormFieldValidator[];
  errorMessages?: Record<string, string>; // Custom error messages for validators
  maxLength?: number;
  minLength?: number;
  required?: boolean;
  cssClasses?: string | string[] | Record<string, boolean>;
  isWide?: boolean;
  optionLabel?: string;
  placeholder?: string | Date;
  filter?: boolean;
  displayTooltip?: boolean;
  header?: string;
  minDate?: Date;
  maxDate?: Date;
  optionValue?: string;
  isEntityExist?: boolean;
  height?: string;
  icon?: string;
  toggleMask?: boolean;
  validatePassword?: boolean;
  feedback?: boolean;
  timeOnly?: boolean;
  showClear?: boolean;
  rows?: number;
  value?: unknown;
  disabled?: boolean;
}
