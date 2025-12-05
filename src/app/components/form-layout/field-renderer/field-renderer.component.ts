import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { InputNumber } from 'primeng/inputnumber';
import { Checkbox } from 'primeng/checkbox';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { Password } from 'primeng/password';
import { RadioButton } from 'primeng/radiobutton';
import { FormField } from '../../../models';
import { FormErrorComponent } from '../../form-error/form-error.component';

/**
 * Generic field renderer component - handles individual field rendering
 * Improves performance by isolating field rendering with OnPush
 */
@Component({
  selector: 'app-field-renderer',
  imports: [
    ReactiveFormsModule,
    InputText,
    Textarea,
    InputNumber,
    Checkbox,
    Select,
    DatePicker,
    Password,
    RadioButton,
    FormErrorComponent
  ],
  templateUrl: './field-renderer.component.html',
  styleUrl: './field-renderer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.field-wide]': 'field().isWide'
  }
})
export class FieldRendererComponent {
  field = input.required<FormField>();
  control = input.required<AbstractControl | null>();
  
  isRequired = computed(() => 
    this.field().required || 
    this.field().validators?.some(v => v.name === 'required') || 
    false
  );
  
  placeholder = computed(() => {
    const ph = this.field().placeholder;
    return typeof ph === 'string' ? ph : (ph instanceof Date ? ph.toLocaleDateString() : '');
  });
}
