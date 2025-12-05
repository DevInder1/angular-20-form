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
}
