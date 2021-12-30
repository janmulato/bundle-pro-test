<template>
  <div class="folder-view">
    <div class="folder-actions" v-if="!!activeNode && !isLoading">
      <button @click="addNode({})">
        <v-icon class="add-node" small>mdi-plus</v-icon>Create New File
      </button>
      <div class="cut-paste-actions">
        <button class="cut" v-if="selectedDocuments" @click="cut()">
          <v-icon small>mdi-content-cut</v-icon> Cut
        </button>
        <button
          @click="paste()"
          v-if="
            !!cutDocuments.length && cutDocuments[0].folderId !== activeNode.id
          "
        >
          <v-icon small> mdi-content-paste </v-icon>
          Paste
        </button>
      </div>
    </div>
    <div class="selected-documents" v-if="!!activeNode">
      <span @click="selectAll()">Select all</span>
      <span @click="unselectAll()">Unselect all</span>
      <p v-if="selectedDocuments">
        <b>{{ selectedDocuments }}</b> Selected documents
      </p>
    </div>
    <Draggable
      v-show="!isLoading"
      :flatData="flatData"
      :parentIdKey="'pid'"
      :eachDroppable="draggableAndDroppable"
      :eachDraggable="draggableAndDroppable"
      :gap="6"
      virtualization
      ref="tree"
      edgeScroll
      style="height: 88vh; overflow: auto; max-height: 88vh"
      @drop="drop($event)"
    >
      <template v-slot="{ node }">
        <div
          class="tree"
          :class="{
            active: node.$checked || cutDocumentsId.includes(node.id),
            draggable: node.type === dataTypes.DOCUMENT,
            cut: cutDocumentsId.includes(node.id),
          }"
        >
          <div class="content">
            <div class="details" @click="updateChecked(node)">
              <v-icon small>mdi-{{ node.type }}</v-icon>
              <p v-if="!node.isEdit" class="text">
                <span>
                  {{ node.details.text }}
                </span>
                <v-icon
                  class="fold"
                  @click.stop.prevent="node.$folded = !node.$folded"
                  v-if="node.$children.length > 0"
                  medium
                  :class="{ active: node.$folded }"
                  >mdi-menu-down</v-icon
                >
              </p>
              <input
                :ref="'tree-' + node.id"
                type="text"
                v-else
                :value="node.details.text"
                @blur="updateNode(node, $event.target.value)"
              />
            </div>
          </div>
          <div class="actions">
            <button v-if="!node.isEdit">
              <v-icon
                small
                class="edit-node"
                @click="
                  node.isEdit = !node.isEdit;
                  editNode(node);
                "
              >
                mdi-pencil
              </v-icon>
            </button>
            <button v-if="node.type === dataTypes.DOCUMENT">
              <v-icon class="add-node" small @click="addNode(node)"
                >mdi-plus</v-icon
              >
            </button>
            <button v-if="node.type === dataTypes.DOCUMENT">
              <v-icon
                color="error"
                class="remove-node"
                small
                @click="removeNode(node)"
                >mdi-delete</v-icon
              >
            </button>
          </div>
        </div>
      </template>
    </Draggable>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { BaseTree, Draggable, BaseNode, Node } from "@he-tree/vue2";
import "@he-tree/vue2/dist/he-tree-vue2.css";
import { DataTypes, FlatData } from "@/models/FlatData";

@Component({
  components: {
    BaseTree,
    Draggable,
  },
})
export default class FolderTreeView extends Vue {
  private tree!: Draggable;
  private dataTypes = DataTypes;
  private isLoading = false;
  @Prop({ default: [] }) flatData!: Array<FlatData>;

  get activeNode(): FlatData {
    return this.$store.getters.selectedNode;
  }

  get selectedDocuments(): number {
    return this.tree?.getAllCheckedNodes()?.length || 0;
  }

  get cutDocuments(): Array<FlatData> {
    return this.$store.state?.cutDocuments || [];
  }

  get cutDocumentsId(): number[] {
    return this.$store.getters.getCutDocumentsId;
  }

  @Watch("flatData") onFlatDataChanged(): void {
    this.tree = this.$refs["tree"] as Draggable;
  }

  public addNode(node: BaseNode): void {
    this.$store
      .dispatch("createNewDocument", { node: node, folder: this.activeNode })
      .then((newDocument) => {
        if (!newDocument?.id) {
          return;
        }

        const addNode = {
          ...newDocument,
          $id: newDocument.id,
        };
        this.tree?.addNode(addNode, node.$id);

        this.$nextTick(() => {
          this.$refs[`tree-${newDocument.id}`]?.focus();
        });
      });
  }

  public removeNode(node: Node): void {
    if (!confirm(`Are you sure you want to delete ${node?.type}?`)) {
      return;
    }

    this.$store
      .dispatch("removeDoc", {
        document: node,
        folder: this.activeNode,
      })
      .then(() => {
        this.tree?.removeNode(node);
      });
  }

  drop(event: any): void {
    const node = event?.draggingNode;
    this.$store.dispatch("moveDoc", {
      node: node,
      folder: this.activeNode,
      document: node,
    });
  }

  updateNode(node: FlatData, text: string): void {
    node.isEdit = false;
    node.details.text = text;

    switch (node.type) {
      case DataTypes.DOCUMENT:
        this.$store.dispatch("updateDoc", {
          document: node,
          folder: this.activeNode,
        });
        break;
      case DataTypes.FOLDER:
        this.$store.dispatch("setFolderName", {
          node: node,
          text: text,
        });
        break;
    }
  }

  editNode(node: BaseNode): void {
    this.$nextTick(() => {
      this.$refs[`tree-${node.$id}`]?.focus();
    });
  }

  updateChecked(node: any): void {
    if (node.type !== DataTypes.DOCUMENT) {
      return;
    }

    node.$checked = !node.$checked;
    this.tree?.updateChecked(node);
  }

  selectAll(): void {
    this.tree?.nodes?.forEach((node: any) => {
      if (node.type !== DataTypes.DOCUMENT) {
        return;
      }

      node.$checked = true;
      this.tree?.updateChecked(node);
    });
  }

  unselectAll(): void {
    this.tree?.nodes?.forEach((node: any) => {
      if (node.type !== DataTypes.DOCUMENT) {
        return;
      }

      node.$checked = false;
      this.tree?.updateChecked(node);
    });
  }

  cut(): void {
    this.$store.commit("cutDocuments", this.tree.getAllCheckedNodes());
  }

  paste(): void {
    this.isLoading = true;
    this.$store.dispatch("pasteDocuments", this.activeNode).then(() => {
      const updated = [...this.$store.getters.documentsAndFolders];
      this.$emit("flatDataChanged", updated);
      this.$emit("update:flatData", []);
      this.$nextTick(() => {
        this.$emit("update:flatData", updated);
        this.isLoading = false;
      });
    });
  }

  private draggableAndDroppable = (node: FlatData) => {
    return node.type === DataTypes.DOCUMENT;
  };

  mounted(): void {
    this.isLoading = false;
  }
}
</script>
<style lang="scss" scoped>
.folder-view {
  border: 1px solid rgb(196, 196, 196);
  padding: 0 15px;
}

.v-icon {
  cursor: pointer;
  &.active {
    transform: rotate(180deg);
  }
}

.tree {
  display: flex;
  flex-grow: 1;
  flex-basis: 150px;
  min-width: 0;
  background-color: #f7f7f7;
  border: 1px solid grey;
  border-radius: 3px;

  .content,
  .details {
    display: flex;
    flex-grow: 1;
    padding: 2px 1px;
  }

  &.active,
  &:hover {
    background-color: #d5ddec;
    border: 1px solid blue($color: #000000);
    border-radius: 3px;
    .actions {
      display: block;
    }
  }

  &.cut {
    opacity: 0.8;
  }

  .fold {
    color: #8bcd66;
  }

  input {
    flex-grow: 1;
    &:focus {
      border: 1px solid blue;
      .actions {
        display: block;
      }
    }
  }

  p {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-grow: 1;
  }
}

.text {
  cursor: pointer;
}

.actions {
  padding: 0 10px;
  display: none;
  button {
    padding: 0 1px;
  }

  .edit-node:hover {
    color: blue;
  }

  .add-node:hover {
    color: green;
  }

  .remove-node:hover {
    color: red;
  }
}

.folder-actions {
  padding: 5px 0;
  display: flex;
  .cut-paste-actions {
    margin-left: auto;
  }

  button {
    padding: 0 5px 0 0;
  }
}

.selected-documents {
  padding: 0 0 5px;
  span {
    padding: 0 5px 0 0;
    cursor: pointer;
  }
}
</style>
