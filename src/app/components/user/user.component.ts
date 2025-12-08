import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FormLayoutComponent } from '../form-layout/form-layout.component';
import { getUserFields } from '../../utils/user-fields';
import { FormService } from '../../services/form.service';

@Component({
  selector: 'app-user',
  imports: [FormLayoutComponent, ReactiveFormsModule, RouterLink],
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
    columns: 3 as const,
    onSave: (formData: unknown) => this.onSubmit(formData),
    onDiscard: () => this.onDiscard()
  });

  protected onSubmit(formData: unknown): void {
    console.log('onSubmit called in UserComponent');
    console.log('Form submitted successfully:', formData);
    this.saveUser(formData);
    // TODO: Make API call here
    // Example:
    // this.userService.saveUser(formData).subscribe({
    //   next: (response) => console.log('User saved:', response),
    //   error: (error) => console.error('Save failed:', error)
    // });
  }

  protected onDiscard(): void {
    const form = this.userFormGroup();
    form.reset();
    console.log('Form discarded and reset');
  }

  private saveUser(userData: unknown): void {
    // TODO: Implement actual save logic via UserService
    console.log('Saving user data:', userData);
  }
}
