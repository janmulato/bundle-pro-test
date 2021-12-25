<template>
  <div class="directory-view">
    <div class="directory-actions">
      <button @click="addNode({})">
        <v-icon class="add-node" small>mdi-plus</v-icon>Create New Folder
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
          :class="{ active: !!activeNode && node.$id === activeNode.$id }"
        >
          <v-icon
            @click="node.$folded = !node.$folded"
            v-if="node.$children.length > 0"
            small
            :class="{ active: node.$folded }"
            >mdi-menu-down</v-icon
          >
          <v-icon small>mdi-folder</v-icon>
          <p v-if="!node.isEdit" class="text" @click="setNode(node)">
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
import { Component, Prop, Vue } from "vue-property-decorator";
import { FlatData } from "@/models/FlatData";
import { BaseTree, Draggable, BaseNode, Node } from "@he-tree/vue2";
import "@he-tree/vue2/dist/he-tree-vue2.css";

@Component({
  components: {
    BaseTree,
    Draggable,
  },
})
export default class DirectoryTreeView extends Vue {
  @Prop() private msg!: string;
  private flatData: Array<FlatData> = [
    { text: "node1", id: 1, isEdit: false },
    {
      id: 2,
      text: "node 1-1",
      documents: [{ text: "testing 123", id: 123123 }],
      pid: 1,
      isEdit: false,
    },
    {
      id: 3,
      text: "node 1-1-1",
      documents: [],
      pid: 2,
      isEdit: false,
    },
    {
      id: 15,
      text: "node 1-1-1",
      documents: [],
      pid: 2,
      isEdit: false,
    },
    { id: 4, text: "node 1-2", pid: 1, isEdit: false },
    { id: 5, text: "node 1-3", pid: 1, isEdit: false },
    { id: 6, text: "node 1-4", pid: 1, isEdit: false },
    { id: 7, text: "node 1-5", pid: 1, isEdit: false },
    { id: 8, text: "node 1-6", pid: 1, isEdit: false },
    { id: 9, text: "node 1-7", pid: 1, isEdit: false },
    { id: 10, text: "node 1-8", pid: 1, isEdit: false },
    { id: 11, text: "node 1-9", pid: 1, isEdit: false },
    { id: 12, text: "node 1-10", pid: 1, isEdit: false },
    { id: 13, text: "node 1-11", pid: 1, isEdit: false },
    { id: 14, text: "node 1-12", pid: 1, isEdit: false },
  ];

  private activeNode: BaseNode = {} as BaseNode;

  public addNode(node: BaseNode): void {
    const newFolder = {
      text: "NewFolder",
      id: this.generateId(),
      pid: node?.$id,
      isEdit: true,
    };
    this.flatData.push(newFolder);

    this.$nextTick(() => {
      this.$refs[`tree-${newFolder.id}`]?.focus();
    });
  }

  public removeNode(node: Node): void {
    if (!confirm("Are you sure you want to delete folder?")) {
      return;
    }

    const index = this._findIndex(node.$id);

    if (index > -1) {
      const node = this.flatData[index];
      this.flatData.splice(index, 1);
      this.flatData = this.flatData.filter((data) => data.pid != node.id);
    }
  }

  setNode(node: BaseNode): void {
    this.activeNode = node;
  }

  drop(event: any): void {
    const index = this._findIndex(event?.draggingNode?.$id);
    if (index > -1) {
      this.flatData[index].pid = event?.draggingNode?.$pid;
    }
  }

  generateId(prefix = ""): string {
    return Math.random().toString(36).replace("0.", prefix);
  }

  updateNode(node: BaseNode, text: string): void {
    const index = this._findIndex(node.$id);
    if (index > -1) {
      const data = this.flatData[index];
      const updatedData = {
        ...data,
        text: text,
        isEdit: false,
      };
      this.flatData.splice(index, 1, updatedData);
    }
  }

  editNode(node: BaseNode): void {
    this.$nextTick(() => {
      this.$refs[`tree-${node.$id}`]?.focus();
    });
  }

  private _findIndex(id: string | number) {
    return this.flatData.findIndex((item) => item.id === id);
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
    max-width: 60%;
    flex-grow: 1;
    &:focus {
      border: 1px solid blue;
      .actions {
        display: block;
      }
    }
  }

  p {
    max-width: 150px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-grow: 1;
  }

  .actions {
    margin-left: auto;
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