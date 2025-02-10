import { SpecialFieldEntityEnum } from "../../../constants/application-constant";
import { OptionType } from "../filterSelect/type";

export interface EditSelectOptionType {
  text: string;
  value: any;
}
export interface SpecialFieldBaseProps {
  entity: SpecialFieldEntityEnum;
  title: string;
  description: React.ReactElement;
  entity_id: number;
  fieldLabel: string; // Display label
  fieldName: string; // Name in API requests
  fieldValueType: string; // Type of value
  onSave?: () => any;
}

interface SpecialFieldTextProps extends SpecialFieldBaseProps {
  fieldType: "text";
  options?: OptionType[];
}

interface SpecialFieldSelectProps extends SpecialFieldBaseProps {
  fieldType: "select";
  options: OptionType[];
}

export type SpecialFieldProps = SpecialFieldTextProps | SpecialFieldSelectProps;

export interface SpecialField {
  id?: number;
  entity: SpecialFieldEntityEnum;
  entity_id: number;
  field_name: string;
  field_value: string;
  active_from: string;
  active_to: string;
}
