export interface FlatData {
  id: string | number;
  text: string;
  pid?: string | number;
  documents?: Array<FlatData>;
  isEdit?: boolean;
}