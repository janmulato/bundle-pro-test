<template>
  <div class="folder-view">
    <div class="folder-actions">
      <button @click="addNode({})">
        <v-icon class="add-node" small>mdi-plus</v-icon>Create New File
      </button>
    </div>
    <Draggable
      :flatData="flatData"
      virtualization
      ref="tree"
      :parentIdKey="'pid'"
      @drop="drop($event)"
      edgeScroll
    >
      <template
        v-slot="{ node }"
        triggerClass="drag-trigger"
        edgeScroll
        :gap="6"
      >
        <div
          class="tree"
          :class="{ active: !!activeNode && node.$id === activeNode.id }"
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
            {{ node.text }}
          </p>
          <input
            :ref="'tree-' + node.id"
            type="text"
            v-else
            :value="node.text"
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
import { Component, Vue } from "vue-property-decorator";
import { BaseTree, Draggable, BaseNode, Node } from "@he-tree/vue2";
import "@he-tree/vue2/dist/he-tree-vue2.css";
import { FlatData } from "@/models/FlatData";

@Component({
  components: {
    BaseTree,
    Draggable,
  },
})
export default class FolderTreeView extends Vue {
  get flatData(): Array<FlatData> {
    return this.$store.getters.documentsAndFolders;
  }

  get activeNode(): FlatData {
    return this.$store.getters.selectedNode;
  }

  public addNode(node: BaseNode): void {
    this.$store.dispatch("createNewFolder", node).then((newFolder) => {
      this.$nextTick(() => {
        this.$refs[`tree-${newFolder.id}`]?.focus();
      });
    });
  }

  public removeNode(node: Node): void {
    if (!confirm(`Are you sure you want to delete ${node?.type}?`)) {
      return;
    }

    this.$store.dispatch("removeFolder", node.$id);
  }

  drop(event: any): void {
    this.$store.dispatch("moveFolder", event?.draggingNode);
  }

  updateNode(node: BaseNode, text: string): void {
    this.$store.dispatch("setFolderName", { node: node, text: text });
  }

  editNode(node: BaseNode): void {
    this.$nextTick(() => {
      this.$refs[`tree-${node.$id}`]?.focus();
    });
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
    max-width: 50%;
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