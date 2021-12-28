<template>
  <div class="folder-view">
    <div class="folder-actions" v-if="!!activeNode">
      <button @click="addNode({})">
        <v-icon class="add-node" small>mdi-plus</v-icon>Create New File
      </button>
    </div>
    <Draggable
      :flatData="flatData"
      :parentIdKey="'pid'"
      :eachDroppable="draggableAndDroppable"
      :eachDraggable="draggableAndDroppable"
      virtualization
      ref="tree"
      edgeScroll
      @drop="drop($event)"
    >
      <template v-slot="{ node }" edgeScroll :gap="6">
        <div
          class="tree"
          :class="{
            active: !!activeNode && node.$id === activeNode.id,
            draggable: node.type === dataTypes.DOCUMENT,
          }"
        >
          <v-icon
            @click="node.$folded = !node.$folded"
            v-if="node.$children.length > 0"
            small
            :class="{ active: node.$folded }"
            >mdi-menu-down</v-icon
          >
          <v-icon small>mdi-{{ node.type }}</v-icon>
          <p v-if="!node.isEdit" class="text">
            {{ node.details.text }}
          </p>
          <input
            :ref="'tree-' + node.id"
            type="text"
            v-else
            :value="node.details.text"
            @blur="updateNode(node, $event.target.value)"
          />
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
            <button>
              <v-icon class="add-node" small @click="addNode(node)"
                >mdi-plus</v-icon
              >
            </button>
            <button>
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
import { Component, Prop, Vue } from "vue-property-decorator";
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
  @Prop({ default: [] }) flatData!: Array<FlatData>;

  get activeNode(): FlatData {
    return this.$store.getters.selectedNode;
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
        this.tree.addNode(addNode, node.$id);

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
        this.tree.removeNode(node);
      });
  }

  drop(event: any): void {
    console.log(event, "node");
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

  private draggableAndDroppable = (node: FlatData) => {
    return node.type === DataTypes.DOCUMENT;
  };

  mounted(): void {
    this.tree = this.$refs["tree"] as Draggable;
  }
}
</script>
<style lang="scss" scoped>
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

  &.active {
    border: 1px solid red;
    .actions {
      display: block;
    }
  }

  &:hover {
    .actions {
      display: block;
    }
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
}
</style>