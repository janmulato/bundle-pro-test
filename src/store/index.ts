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
  activeNode: -1,
};

function _findIndex(data: Array<any>, id: number | string) {
  return data.findIndex((item: FlatData) => item.id === id);
}

function _checkFolderOrIdExists(payload: UpsertDocumentParam) {
  return !payload.folder && !payload.folderId;
}

export default new Vuex.Store({
  state: state,
  mutations: {
    addFolder(state: State, newFolder: any): void {
      state.flatData.push(newFolder);
    },

    removeFolder(state: State, id: string | number): void {
      const index = _findIndex(state.flatData, id);

      if (index > -1) {
        const node = state.flatData[index];
        state.flatData.splice(index, 1);
        state.flatData = state.flatData.filter((data) => data.pid != node.id);
      }
    },

    moveFolder(state: State, node: Node) {
      const index = _findIndex(state.flatData, node.$id);

      if (index > -1) {
        state.flatData[index].pid = node?.$pid;
      }
    },

    updateNode(state: State, payload: UpdateNodeParams): void {
      const index = _findIndex(state.flatData, payload.node.$id);

      if (index > -1) {
        const data = state.flatData[index];
        const updatedData = {
          ...data,
          text: payload.text,
          isEdit: false,
          details: {
            text: payload.text,
          },
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
      const index = _findIndex(state.flatData, payload?.folder?.id);
      if (index > -1) {
        const data = state.flatData[index];
        data.documents?.push(payload.document);
        state.flatData.splice(index, 1, data);
      }
    },

    removeDocument(state: State, payload: UpsertDocumentParam) {
      const index = _findIndex(state.flatData, payload?.folder?.id);
      if (index > -1) {
        const data = state.flatData[index];
        const documentIndex = _findIndex(
          data?.documents || [],
          payload.document.id
        );

        data.documents.splice(documentIndex, 1);
        data.documents = data.documents.filter(
          (data) => data.pid != payload.document.id
        );
      }
    },

    updateDocument(state: State, payload: UpsertDocumentParam) {
      const index = _findIndex(state.flatData, payload?.folder?.id);
      if (index > -1) {
        const data = state.flatData[index];
        const documentIndex = _findIndex(
          data?.documents || [],
          payload.document.id
        );

        if (documentIndex < 0) {
          return;
        }

        const updatedDoc = {
          ...payload.document,
        };

        data.documents.splice(documentIndex, 1, updatedDoc);
      }
    },
  },
  actions: {
    createNewFolder(context, node: Node) {
      const newFolder = {
        id: hp.randString(12),
        pid: node?.$id,
        isEdit: true,
        type: DataTypes.FOLDER,
        documents: [],
        details: {
          text: "New Folder",
        },
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
      if (_checkFolderOrIdExists(payload)) {
        return;
      }

      payload.folder = context.getters.getFolderInPayLoad(payload);

      const newDocument = {
        id: hp.randString(12),
        pid: payload.node?.$id,
        folderId: payload?.folder?.id,
        isEdit: true,
        documents: [],
        type: DataTypes.DOCUMENT,
        details: {
          text: "New Document",
        },
      };

      payload.document = newDocument;

      context.commit("createDocument", payload);

      return newDocument;
    },

    removeDoc(context, payload: UpsertDocumentParam) {
      if (_checkFolderOrIdExists(payload)) {
        return;
      }

      payload.folder = context.getters.getFolderInPayLoad(payload);

      context.commit("removeDocument", payload);

      return payload.document;
    },

    updateDoc(context, payload: UpsertDocumentParam) {
      if (_checkFolderOrIdExists(payload)) {
        return;
      }

      payload.folder = context.getters.getFolderInPayLoad(payload);

      context.commit("updateDocument", payload);
    },

    moveDoc(context, payload: UpsertDocumentParam) {
      if (!payload.folder && !payload.folderId) {
        return;
      }

      payload.folder = context.getters.getFolderInPayLoad(payload);

      payload.document.pid = payload.node.$pid;
      context.commit("updateDocument", payload);
    },
  },
  getters: {
    selectedNode: (state) => {
      return state.flatData.find(
        (data: FlatData) => data.id === state.activeNode
      );
    },

    documentsAndFolders: (state) => {
      const flatData = [...state.flatData];
      const item = flatData.find(
        (data: FlatData) => data.id === state.activeNode
      );

      if (!item) {
        return [];
      }

      const folders = flatData.filter((data: FlatData) => {
        return data.pid === item?.id;
      });

      return [...folders, ...(item?.documents || [])];
    },

    getFolderById: (state) => (id: number | string) => {
      return state.flatData.find((data: FlatData) => data.id === id);
    },

    getFolderInPayLoad:
      (state, getters) =>
        (payload: UpsertDocumentParam): FlatData => {
          return (payload.folder = payload?.folder
            ? payload.folder
            : getters.getFolderById(payload.folderId));
        },

    getDirectory: (state) => {
      return [...state.flatData];
    },
  },
  modules: {},
});
