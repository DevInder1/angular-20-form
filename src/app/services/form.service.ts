import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, AbstractControlOptions, ValidatorFn, ValidationErrors } from '@angular/forms';
import { FormField } from '../models';
import { getValidatorsFromField } from '../utils/validators';

/**
 * Form control definition for dynamic form creation
 */
export interface FormControlDefinition {
  name: string;
  initialValue?: unknown;
  disabled?: boolean;
  validators?: ValidatorFn[];
}

/**
 * Generic service for creating and managing dynamic FormGroups
 * Provides reusable methods for form creation from field configurations
 */
@Injectable({
  providedIn: 'root'
})
export class FormService {
  private readonly formBuilder = inject(FormBuilder);

  /**
   * Creates a FormGroup from an array of FormControlDefinition objects
   * @param formControls - Array of control definitions with name, value, validators, and disabled state
   * @returns FormGroup with all specified controls
   */
  createDetailForm(formControls: FormControlDefinition[]): FormGroup {
    const formGroup: Record<string, FormControl> = {};
    
    formControls.forEach(controlDefinition => {
      const options: AbstractControlOptions = {
        validators: controlDefinition.validators || []
      };

      // Directly create a FormControl for better control
      formGroup[controlDefinition.name] = new FormControl({
        value: controlDefinition.initialValue || '',
        disabled: controlDefinition.disabled || false
      }, options);
    });
    
    return this.formBuilder.group(formGroup);
  }

  /**
   * Creates a FormGroup from an array of FormField configurations
   * Extracts necessary properties from FormField objects
   * @param fields - Array of FormField configurations
   * @returns FormGroup with controls for all fields
   */
  createFormGroupFromFields(fields: FormField[]): FormGroup {
    const controlDefinitions: FormControlDefinition[] = fields.map(field => {
      // Use validators from field configuration if provided
      const validators: ValidatorFn[] = field.validators 
        ? getValidatorsFromField(field.validators)
        : [];
      
      return {
        name: field.name,
        initialValue: field.value || this.getDefaultValue(field.type),
        disabled: field.disabled || false,
        validators
      };
    });
    
    return this.createDetailForm(controlDefinitions);
  }

  /**
   * Updates existing FormGroup with new values
   * @param formGroup - The FormGroup to update
   * @param values - Object with field names as keys and new values
   * @param emitEvent - Whether to emit valueChanges event (default: true)
   */
  updateFormValues(formGroup: FormGroup, values: Record<string, unknown>, emitEvent = true): void {
    Object.keys(values).forEach(key => {
      const control = formGroup.get(key);
      if (control) {
        control.setValue(values[key], { emitEvent });
      }
    });
  }

  /**
   * Enables or disables a specific control in FormGroup
   * @param formGroup - The FormGroup containing the control
   * @param controlName - Name of the control to enable/disable
   * @param enable - True to enable, false to disable
   * @param emitEvent - Whether to emit statusChanges event (default: true)
   */
  setControlState(formGroup: FormGroup, controlName: string, enable: boolean, emitEvent = true): void {
    const control = formGroup.get(controlName);
    if (control) {
      if (enable) {
        control.enable({ emitEvent });
      } else {
        control.disable({ emitEvent });
      }
    }
  }

  /**
   * Resets the FormGroup to initial values or provided values
   * @param formGroup - The FormGroup to reset
   * @param values - Optional object with new values to reset to
   */
  resetForm(formGroup: FormGroup, values?: Record<string, unknown>): void {
    formGroup.reset(values);
  }

  /**
   * Marks all controls in FormGroup as touched
   * Useful for validation display after submit attempt
   * @param formGroup - The FormGroup to mark as touched
   */
  markAllAsTouched(formGroup: FormGroup): void {
    formGroup.markAllAsTouched();
  }

  /**
   * Gets default value based on field type
   * @param type - The field type
   * @returns Default value for the field type
   */
  private getDefaultValue(type?: string): unknown {
    switch (type) {
      case 'checkbox':
        return false;
      case 'number':
        return 0;
      case 'dropdown':
      case 'radio':
        return null;
      case 'calendar':
        return null;
      default:
        return '';
    }
  }

  /**
   * Validates if FormGroup is valid and returns errors if any
   * @param formGroup - The FormGroup to validate
   * @returns Object with validation result and errors
   */
  validateForm(formGroup: FormGroup): { valid: boolean; errors: Record<string, ValidationErrors> } {
    this.markAllAsTouched(formGroup);
    
    const errors: Record<string, ValidationErrors> = {};
    
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    
    return {
      valid: formGroup.valid,
      errors
    };
  }
}
