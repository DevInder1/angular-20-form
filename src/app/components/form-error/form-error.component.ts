import { Component, input, computed, effect, signal, inject } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { LiveAnnouncer } from '@angular/cdk/a11y';

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
  
  // Create a signal that updates whenever control state changes
  private controlStateVersion = signal(0);
  
  shouldShowError = computed(() => {
    const ctrl = this.control();
    if (!ctrl) return true;
    
    // Access the signal to make this computed reactive to control state changes
    this.controlStateVersion();
    
    console.log('shouldShowError - touched:', ctrl.touched, 'dirty:', ctrl.dirty, 'invalid:', ctrl.invalid);
    return ctrl.invalid && (ctrl.touched || ctrl.dirty);
  });
  
  errorMessage = computed(() => {
    const ctrl = this.control();
    const errors = this.errors() || ctrl?.errors;
    
    console.log('errorMessage - Current Errors:', errors);
    
    if (!errors) return null;

    if (errors['required']) return 'This field is required';
    if (errors['email']) return 'Please enter a valid email address';
    if (errors['minlength']) {
      return `Minimum length is ${errors['minlength'].requiredLength} characters`;
    }
    if (errors['maxlength']) {
      return `Maximum length is ${errors['maxlength'].requiredLength} characters`;
    }
    if (errors['min']) return `Minimum value is ${errors['min'].min}`;
    if (errors['max']) return `Maximum value is ${errors['max'].max}`;
    if (errors['pattern']) return 'Please enter a valid format';
    
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

    // Subscribe to control changes
    effect(() => {
      const ctrl = this.control();
      if (ctrl) {
        ctrl.statusChanges.subscribe(() => {
          console.log('Status changed - incrementing version');
          this.controlStateVersion.update(v => v + 1);
        });
        ctrl.valueChanges.subscribe(() => {
          console.log('Value changed - incrementing version');
          this.controlStateVersion.update(v => v + 1);
        });
      }
    });
  }
}
