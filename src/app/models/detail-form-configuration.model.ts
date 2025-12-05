import { FormEntityDataModel } from './form-entity-data.model';
import { FormField } from './form-field.model';

export class DetailFormConfiguration {
  label!: string;
  options: unknown[] = [];
  maxlength!: number;
  existingRecord = false;
  existingData?: FormEntityDataModel;
  fields!: FormField[];
  screenName?: string;
  isPickListOrderChange?: boolean;
  editScreenName?: string;
  isSaveButton?: boolean;
  removeCard?: boolean;
  discardButtonLabel?: string;
  columns?: 2 | 3; // Number of columns in the grid layout (default: 3)
}
