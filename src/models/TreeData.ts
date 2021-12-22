export interface TreeData {
  text: string;
  children: Children[];
}

interface Children {
  text: string;
  documents?: Array<string>;
  children?: Children[];
}
