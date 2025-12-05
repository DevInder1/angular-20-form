import { Directive, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

/**
 * Directive that automatically adds validation CSS classes to form controls
 * Classes: valid, invalid, touched, untouched, dirty, pristine
 */
@Directive({
  selector: '[appFormControlValidation]',
  host: {
    '[class.valid]': 'isValid()',
    '[class.invalid]': 'isInvalid()',
    '[class.touched]': 'isTouched()',
    '[class.dirty]': 'isDirty()',
    '[class.pristine]': 'isPristine()'
  }
})
export class FormControlValidationDirective {
  private control = inject(NgControl, { self: true });

  isValid = () => this.control.valid && this.control.touched;
  isInvalid = () => this.control.invalid && this.control.touched;
  isTouched = () => this.control.touched;
  isDirty = () => this.control.dirty;
  isPristine = () => this.control.pristine;
}
