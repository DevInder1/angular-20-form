import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormLayoutComponent } from '../form-layout/form-layout.component';
import { getUserFields } from '../../utils/user-fields';
import { FormService } from '../../services/form.service';

@Component({
  selector: 'app-user',
  imports: [FormLayoutComponent, ReactiveFormsModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserComponent {
  private readonly formService = inject(FormService);

  protected readonly userFormGroup = signal(
    this.formService.createFormGroupFromFields(getUserFields())
  );

  protected readonly formConfiguration = signal({
    label: 'User Detail',
    options: [],
    maxlength: 255,
    existingRecord: false,
    fields: getUserFields(),
    isSaveButton: true,
    discardButtonLabel: 'Cancel',
    columns: 3 as const
  });

  protected onSubmit(): void {
    const form = this.userFormGroup();
    const validation = this.formService.validateForm(form);
    
    if (validation.valid) {
      console.log('Form submitted successfully:', form.value);
      this.saveUser(form.value);
    } else {
      console.error('Form validation failed:', validation.errors);
    }
  }

  private saveUser(userData: unknown): void {
    // TODO: Implement actual save logic via UserService
    console.log('Saving user data:', userData);
  }
}
