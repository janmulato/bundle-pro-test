import { Node } from "@he-tree/vue2";
export interface TreeData
  extends Omit<Node, "$id" | "$level" | "$children"> {
  id: string | number;
  id$?: string | number;
  $level?: number;
  text: string;
  children?: Children[];
}

export interface Children extends Omit<Node, "$id" | "$level" | "$children"> {
  id: string | number;
  text: string;
  $id?: string | number;
  $level?: number;
  documents?: Array<string>;
  children?: Children[];
}
