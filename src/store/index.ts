import { FlatData } from "@/models/FlatData";
import { Node } from "@he-tree/vue2";
import Vue from "vue";
import Vuex from "vuex";
import { generateTree } from "@/json/data";

Vue.use(Vuex);

export type State = {
  flatData: Array<FlatData>;
  activeNode: number | string;
};

export type UpdateNodeParams = {
  node: Node;
  text: string;
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
      console.log("set data", data);
      state.flatData = data;
    },
  },
  actions: {
    createNewFolder(context, node: Node) {
      const newFolder = {
        text: "NewFolder",
        id: Math.random().toString(36).replace("0.", ""),
        pid: node?.$id,
        isEdit: true,
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

      console.log(item, 'item');
      const folders = state.flatData.filter((data: FlatData) => {
        return data.pid === item?.id;
      });

      console.log(folders, 'folders')

      return [...folders, ...(item?.documents || [])];
    },
  },
  modules: {},
});
