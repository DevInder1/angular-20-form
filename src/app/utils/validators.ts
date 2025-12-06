import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

/**
 * Common validators utility
 * Centralized location for all form validators
 */

export function requiredValidator(control: AbstractControl): ValidationErrors | null {
  return Validators.required(control);
}

export function alphaNumericUnderscoreValidator(control: AbstractControl): ValidationErrors | null {
  return Validators.pattern('^[a-zA-Z0-9_]+$')(control);
}

export function nameValidator(control: AbstractControl): ValidationErrors | null {
  return Validators.pattern('^[a-zA-Z .]+$')(control);
}

export function emailDomainValidator(control: AbstractControl): ValidationErrors | null {
  return Validators.pattern('^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')(control);
}

export function nameValidatorWithUnderScoreAndDot(control: AbstractControl): ValidationErrors | null {
  return Validators.pattern('^[A-Za-z0-9\\-_.]+$')(control);
}

export function emailValidator(control: AbstractControl): ValidationErrors | null {
  return Validators.email(control);
}

export function contactNumberValidator(control: AbstractControl): ValidationErrors | null {
  return Validators.pattern(/^\+?[0-9]+$/)(control);
}

export function nameNumberValidator(control: AbstractControl): ValidationErrors | null {
  return Validators.pattern(/^[A-Za-z0-9]*$/)(control);
}

export function passwordPolicyValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.value;
    const specialCharRegex = /[!@#$%^~&*()_+\-=[\]{};':"\\|,.<>?]+/;

    if (!password) {
      return null;
    }
    
    const hasUppercase = /[A-Z]+/.test(password);
    const hasLowercase = /[a-z]+/.test(password);
    const hasNumber = /\d+/.test(password);
    const hasSpecial = specialCharRegex.test(password);

    const isValid = hasUppercase && hasLowercase && hasNumber && hasSpecial;

    return isValid ? null : { passwordPolicy: true };
  };
}

export function numberValidator(control: AbstractControl): ValidationErrors | null {
  return Validators.pattern(/^[0-9]+(, ?[0-9]+)*$/)(control);
}

export function ipAddressValidator(control: AbstractControl): ValidationErrors | null {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  if (ipv4Regex.test(control.value) || ipv6Regex.test(control.value)) {
    return null;
  } else {
    return { invalidIpAddress: true };
  }
}

export function minLengthValidator(length: number): ValidatorFn {
  return Validators.minLength(length);
}

export function maxLengthValidator(length: number): ValidatorFn {
  return Validators.maxLength(length);
}

/**
 * Validator registry - maps validator names to validator functions
 * Used to apply validators from field configuration
 */
export const VALIDATOR_REGISTRY: Record<string, ValidatorFn | ((param?: unknown) => ValidatorFn)> = {
  required: requiredValidator,
  alphaNumericUnderscore: alphaNumericUnderscoreValidator,
  name: nameValidator,
  emailDomain: emailDomainValidator,
  nameWithUnderScoreAndDot: nameValidatorWithUnderScoreAndDot,
  email: emailValidator,
  contactNumber: contactNumberValidator,
  nameNumber: nameNumberValidator,
  passwordPolicy: passwordPolicyValidator,
  number: numberValidator,
  ipAddress: ipAddressValidator,
  minLength: minLengthValidator,
  maxLength: maxLengthValidator
};

/**
 * Helper function to get validators from field configuration
 */
export function getValidatorsFromField(validators?: { name: string; value?: unknown }[]): ValidatorFn[] {
  if (!validators || validators.length === 0) {
    return [];
  }

  return validators
    .map(v => {
      const validatorFn = VALIDATOR_REGISTRY[v.name];
      if (!validatorFn) {
        console.warn(`Validator "${v.name}" not found in registry`);
        return null;
      }

      // If validator requires a parameter (like minLength, maxLength)
      if (typeof validatorFn === 'function' && v.value !== undefined) {
        return (validatorFn as (param: unknown) => ValidatorFn)(v.value);
      }

      return validatorFn as ValidatorFn;
    })
    .filter((v): v is ValidatorFn => v !== null);
}
