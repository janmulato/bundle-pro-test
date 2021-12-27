import { DataTypes, FlatData } from "@/models/FlatData";
import { Node } from "@he-tree/vue2";
import Vue from "vue";
import Vuex from "vuex";
import { generateTree } from "@/json/data";
import * as hp from "helper-js";

Vue.use(Vuex);

export type State = {
  flatData: Array<FlatData>;
  activeNode: number | string;
};

export type UpdateNodeParams = {
  node: Node;
  text: string;
};

export type UpsertDocumentParam = {
  node: Node;
  text: string;
  folder: FlatData;
  document: FlatData;
  folderId: number | string;
};

const state: State = {
  flatData: [],
  activeNode: 0,
};

function _findIndex(state: State, id: number | string) {
  return state.flatData.findIndex((item: FlatData) => item.id === id);
}

export default new Vuex.Store({
  state: state,
  mutations: {
    addFolder(state: State, newFolder: any): void {
      state.flatData.push(newFolder);
    },

    removeFolder(state: State, id: string | number): void {
      const index = _findIndex(state, id);

      if (index > -1) {
        const node = state.flatData[index];
        state.flatData.splice(index, 1);
        state.flatData = state.flatData.filter((data) => data.pid != node.id);
      }
    },

    moveFolder(state: State, node: Node) {
      const index = _findIndex(state, node.$id);

      if (index > -1) {
        state.flatData[index].pid = node?.$pid;
      }
    },

    updateNode(state: State, payload: UpdateNodeParams): void {
      const index = _findIndex(state, payload.node.$id);

      if (index > -1) {
        const data = state.flatData[index];
        const updatedData = {
          ...data,
          text: payload.text,
          isEdit: false,
        };
        state.flatData.splice(index, 1, updatedData);
      }
    },

    setActive(state: State, id: number | string) {
      state.activeNode = id;
    },

    setData(state: State, data: Array<FlatData>) {
      state.flatData = data;
    },

    createDocument(state: State, payload: UpsertDocumentParam) {
      const index = _findIndex(state, payload?.folder?.id);
      if (index > -1) {
        const data = state.flatData[index];
        data.documents?.push(payload.document);
        state.flatData.splice(index, 1, data);
      }

      console.log(payload, "payload");
    },
  },
  actions: {
    createNewFolder(context, node: Node) {
      const newFolder = {
        text: "New Folder",
        id: hp.randString(12),
        pid: node?.$id,
        isEdit: true,
        type: DataTypes.FOLDER,
        documents: [],
      };

      context.commit("addFolder", newFolder);

      return newFolder;
    },

    removeFolder(context, id) {
      context.commit("removeFolder", id);
    },

    moveFolder(context, node) {
      context.commit("moveFolder", node);
    },

    setFolderName(context, payload: UpdateNodeParams) {
      context.commit("updateNode", payload);
    },

    setActiveNode(context, node: Node) {
      context.commit("setActive", node.$id);
    },

    getData(context) {
      const data = generateTree();

      context.commit("setData", data);
      return data;
    },

    createNewDocument(context, payload: UpsertDocumentParam) {
      if (!payload.folder && !payload.folderId) {
        return;
      }

      console.log(payload, 'in action')
      payload.folder = payload?.folder
        ? payload.folder
        : context.getters.getFolderById(payload.folderId);

      const newDocument = {
        text: "New Document",
        id: hp.randString(12),
        pid: payload.node?.$id,
        folderId: payload?.folder?.id,
        isEdit: true,
      };

      payload.document = newDocument;

      context.commit("createDocument", payload);
    },
  },
  getters: {
    selectedNode: (state) => {
      return state.flatData.find(
        (data: FlatData) => data.id === state.activeNode
      );
    },

    documentsAndFolders: (state) => {
      const item = state.flatData.find(
        (data: FlatData) => data.id === state.activeNode
      );

      console.log(item, 'item')

      const folders = state.flatData.filter((data: FlatData) => {
        return data.pid === item?.id;
      });

      // console.log(folders, 'folders');

      console.log([...folders, ...(item?.documents || [])]);
      // return [...folders, ...(item?.documents || [])];
      return [...folders];
    },

    getFolderById: (state, id) => {
      return state.flatData.find((data: FlatData) => data.id === id);
    },

    getDirectory: (state) => {
      return state.flatData;
    },
  },
  modules: {},
});
