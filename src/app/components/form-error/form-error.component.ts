import { Component, input, computed, signal, effect, inject } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { VALIDATOR_ERROR_MESSAGES } from '../../utils/validators';

/**
 * Reusable component to display form validation errors
 */
@Component({
  selector: 'app-form-error',
  template: `
    @if (shouldShowError() && errorMessage()) {
      <small class="error-message" role="alert" aria-live="polite">{{ errorMessage() }}</small>
    }
  `,
  styleUrl: './form-error.component.scss'
})
export class FormErrorComponent {
  private readonly liveAnnouncer = inject(LiveAnnouncer);
  
  errors = input<ValidationErrors | null>(null);
  control = input<AbstractControl | null>(null);
  errorMessages = input<Record<string, string>>({}); // Custom error messages from field config
  
  // Create a signal that updates whenever control state changes
  private controlStateVersion = signal(0);
  
  shouldShowError = computed(() => {
    const ctrl = this.control();
    if (!ctrl) return true;
    
    // Access the signal to make this computed reactive to control state changes
    this.controlStateVersion();
    
    return ctrl.invalid && (ctrl.touched || ctrl.dirty);
  });
  
  errorMessage = computed(() => {
    const ctrl = this.control();
    
    // Access the signal to make this computed reactive to control state changes
    this.controlStateVersion();
    
    const errors = this.errors() || ctrl?.errors;
    const customMessages = this.errorMessages();
    
    if (!errors) return null;

    // If field is NOT empty, skip 'required' error and show specific validation errors
    const hasValue = ctrl?.value && (typeof ctrl.value === 'string' ? ctrl.value.trim().length > 0 : true);
    
    // Priority order of error checking (specific validators first, required last)
    const errorKeys = ['alphaNumericUnderscore', 'name', 'email', 'emailDomain', 
                       'contactNumber', 'passwordPolicy', 'nameNumber', 'nameWithUnderScoreAndDot',
                       'pattern', 'minlength', 'maxlength', 'min', 'max', 'ipAddress', 'number', 'required'];

    // Find first matching error
    for (const key of errorKeys) {
      if (errors[key]) {
        // Skip 'required' error if field has value (prioritize specific validation errors)
        if (key === 'required' && hasValue) {
          continue;
        }

        // Check for custom message from field config
        if (customMessages[key]) {
          return customMessages[key];
        }

        // Check for default message from validator registry
        if (VALIDATOR_ERROR_MESSAGES[key]) {
          return VALIDATOR_ERROR_MESSAGES[key];
        }

        // Special handling for length validators
        if (key === 'minlength') {
          return `Minimum length is ${errors['minlength'].requiredLength} characters`;
        }
        if (key === 'maxlength') {
          return `Maximum length is ${errors['maxlength'].requiredLength} characters`;
        }
        if (key === 'min') {
          return `Minimum value is ${errors['min'].min}`;
        }
        if (key === 'max') {
          return `Maximum value is ${errors['max'].max}`;
        }
      }
    }
    
    return 'Invalid value';
  });
  
  constructor() {
    // Announce errors to screen readers
    effect(() => {
      const message = this.errorMessage();
      const shouldShow = this.shouldShowError();
      
      if (shouldShow && message) {
        this.liveAnnouncer.announce(message, 'polite');
      }
    });

    // Subscribe to control changes to trigger reactivity
    effect(() => {
      const ctrl = this.control();
      if (ctrl) {
        ctrl.statusChanges.subscribe(() => {
          this.controlStateVersion.update(v => v + 1);
        });
        ctrl.valueChanges.subscribe(() => {
          this.controlStateVersion.update(v => v + 1);
        });
      }
    });
  }
}
