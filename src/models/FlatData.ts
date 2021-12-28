export interface FlatData {
  id: string | number;
  pid?: string | number;
  documents: Array<FlatData>;
  isEdit?: boolean;
  folderId?: string | number;
  type?: DataTypes;
  details: {
    text: string;
  }
}

export enum DataTypes {
  FOLDER = "folder",
  DOCUMENT = "file",
};
