export interface FlatData {
  id: string | number;
  text: string;
  pid?: string | number;
  documents?: Array<FlatData>;
  isEdit?: boolean;
  folderId?: string | number;
  type?: DataTypes;
}

export enum DataTypes {
  FOLDER = "folder",
  DOCUMENT = "file",
};
