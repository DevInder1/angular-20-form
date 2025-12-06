import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DetailFormConfiguration } from '../../models';
import { FieldRendererComponent } from './field-renderer/field-renderer.component';

@Component({
  selector: 'app-form-layout',
  imports: [ReactiveFormsModule, FieldRendererComponent],
  templateUrl: './form-layout.component.html',
  styleUrl: './form-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormLayoutComponent {
  formGroup = input.required<FormGroup>();
  configuration = input.required<DetailFormConfiguration>();

  visibleFields = computed(() => 
    this.configuration().fields.filter(f => !f.hide && f.name)
  );

  columns = computed(() => this.configuration().columns || 3);

  gridClass = computed(() => ({
    'form-grid': true,
    [`columns-${this.columns()}`]: true
  }));

  handleSubmit(): void {
    console.log('handleSubmit called');
    const form = this.formGroup();
    console.log('Form valid:', form.valid);
    console.log('Form value:', form.value);
    
    if (form.valid) {
      console.log('Calling onSave callback');
      this.configuration().onSave?.(form.value);
    } else {
      console.log('Form invalid, marking all as touched');
      form.markAllAsTouched();
      this.focusFirstInvalidField();
    }
  }

  private focusFirstInvalidField(): void {
    const form = this.formGroup();
    const firstInvalidControl = Object.keys(form.controls).find(
      key => form.get(key)?.invalid
    );

    if (firstInvalidControl) {
      setTimeout(() => {
        const element = document.getElementById(firstInvalidControl) as HTMLElement;
        element?.focus();
      }, 100);
    }
  }

  handleDiscard(): void {
    console.log('handleDiscard called');
    this.configuration().onDiscard?.();
  }
}
