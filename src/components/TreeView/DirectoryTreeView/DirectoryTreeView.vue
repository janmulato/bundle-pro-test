<template>
  <div class="directory-view">
    <div class="directory-actions">
      <button @click="addNode({})">
        <v-icon class="add-node" small>mdi-plus</v-icon>Create New Folder
      </button>
    </div>
    <Draggable
      :flatData="flatData"
      :parentIdKey="'pid'"
      virtualization
      ref="tree"
      edgeScroll
      style="height: 90vh; overflow: auto; max-height: 90vh"
      @drop="drop($event)"
      :gap="6"
    >
      <template v-slot="{ node }">
        <div
          class="tree"
          :class="{ active: !!activeNode && node.$id === activeNode.id }"
        >
          <v-icon
            @click="toggleFold(node)"
            v-if="node.$children.length > 0"
            small
            :class="{ active: node.$folded }"
            >mdi-menu-down</v-icon
          >
          <v-icon small>mdi-folder</v-icon>
          <p v-if="!node.isEdit" class="text" @click="setNode(node)">
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
          <div class="total-documents">
            <span>
              {{ node.documents.length }}
            </span>
          </div>
        </div>
      </template>
    </Draggable>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { BaseTree, Draggable, BaseNode, Node, obj } from "@he-tree/vue2";
import "@he-tree/vue2/dist/he-tree-vue2.css";
import { FlatData } from "@/models/FlatData";

@Component({
  components: {
    BaseTree,
    Draggable,
  },
})
export default class DirectoryTreeView extends Vue {
  private tree!: Draggable;
  @Prop() flatData!: Array<FlatData>;

  get activeNode(): FlatData {
    return this.$store.getters.selectedNode;
  }

  public addNode(node: BaseNode): void {
    this.$store.dispatch("createNewFolder", node).then((newFolder) => {
      const addNode = {
        ...newFolder,
        $id: newFolder.id,
      };
      this.tree.addNode(addNode, node.$id);
      this.$emit("change", node);
      this.$nextTick(() => {
        this.$refs[`tree-${newFolder.id}`]?.focus();
      });
    });
  }

  public removeNode(node: Node): void {
    if (!confirm("Are you sure you want to delete folder?")) {
      return;
    }

    this.tree.removeNode(node);
    this.$store.dispatch("removeFolder", node.$id).then(() => {
      this.tree.removeNode(node);
    });
  }

  setNode(node: BaseNode): void {
    this.$store.dispatch("setActiveNode", node);
    this.$emit("change", node);
  }

  drop(event: any): void {
    this.$store.dispatch("moveFolder", event?.draggingNode);
  }

  updateNode(node: any, text: string): void {
    node.isEdit = false;
    node.details.text = text;
    this.$store.dispatch("setFolderName", { node: node, text: text });
  }

  editNode(node: BaseNode): void {
    this.$nextTick(() => {
      this.$refs[`tree-${node.$id}`]?.focus();
    });
  }

  toggleFold(node: Node): void {
    this.tree.toggleFold(node);
  }

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

.directory-view {
  background-color: #f7f7f7;
  padding: 0 15px;
}

.tree {
  display: flex;
  flex-grow: 1;
  flex-basis: 150px;
  min-width: 0;

  &.active,
  &:hover {
    background-color: #d5ddec;
    border: 1px solid blue($color: #000000);
    border-radius: 3px;
    .actions {
      display: flex;
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
    span {
      max-width: 200px;
    }
  }

  .total-documents {
    background-color: #959aa5;
    border: 1px solid gray;
    border-radius: 3px;
    margin: 0 25px 0 0;
    span {
      color: #f3fbfb;
      padding: 5px;
      font-size: 12px;
    }
  }
}

.directory-actions {
  padding: 5px 0;
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
</style>