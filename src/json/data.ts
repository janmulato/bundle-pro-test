import inputJson from "@/json/input.json";
import { FlatData, DataTypes } from "@/models/FlatData";
import * as hp from "helper-js";

export function generateTree(): Array<FlatData> {
  const flatData = convertDataToFlat(inputJson.BundlePro.Folder);
  return flatData;
}

export function convertDataToFlat(
  data: any,
  childrenKey = "Folder"
): Array<FlatData> {
  const flatData: Array<FlatData> = [];
  const mapForPid = new Map();

  depthFirstSearch(
    data,
    (node, index, parent) => {
      const folderId = hp.randString(12);
      mapForPid.set(node, folderId);

      const newNode = {
        id: folderId,
        pid: (parent && mapForPid.get(parent)) || null,
        text: node._Name,
        documents: node.Document.map((doc: string) => {
          return {
            id: hp.randString(12),
            folderId: folderId,
            pid: "",
            isEdit: false,
            type: DataTypes.DOCUMENT,
            details: {
              text: doc,
            },
          };
        }),
        isEdit: false,
        type: DataTypes.FOLDER,
        details: {
          text: node._Name,
          checked: false,
        },
      };
      flatData.push(newNode);
    },
    childrenKey
  );
  return flatData;
}

type TreeDataPath = number[];

type depthFirstSearch_Handler = (
  item: any,
  index: number,
  parent: null | any,
  path: TreeDataPath
) => void | false | "skip children" | "skip siblings";
type depthFirstSearch_Options = {
  reverse?: boolean;
};

export function isArray(v: any[]): v is any[] {
  return Object.prototype.toString.call(v) === "[object Array]";
}

/**
 * From helper JS used in he-tree
 * 
 * @param obj 
 * @param handler 
 * @param childrenKey 
 * @param opt 
 */
export function depthFirstSearch(
  obj: any,
  handler: depthFirstSearch_Handler,
  childrenKey = "children",
  opt: depthFirstSearch_Options = {}
) {
  const rootChildren = isArray(obj) ? obj : [obj];
  //
  class StopException { }
  const func = (children: any, parent: any, parentPath: any) => {
    if (opt.reverse) {
      children = children.slice();
      children.reverse();
    }
    const len = children.length;
    for (let i = 0; i < len; i++) {
      const item = children[i];
      const index = opt.reverse ? len - i - 1 : i;
      const path = parentPath ? [...parentPath, index] : [];
      const r = handler(item, index, parent, path);
      if (r === false) {
        // stop
        throw new StopException();
      } else if (r === "skip children") {
        continue;
      } else if (r === "skip siblings") {
        break;
      }

      if (item[childrenKey] != null) {
        const itemChildren = item[childrenKey];
        // Check if item children is array similar to rootChildren to accomodate the input.json
        const children = isArray(itemChildren) ? itemChildren : [itemChildren];
        func(children, item, path);
      }
    }
  };
  try {
    func(rootChildren, null, isArray(obj) ? [] : null);
  } catch (e) {
    if (e instanceof StopException) {
      // stop
    } else {
      throw e;
    }
  }
}
