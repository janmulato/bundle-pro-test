<template>
  <div class="directory-view">
    <Draggable :treeData="treeData" virtualization>
      <template
        v-slot="{ node }"
        triggerClass="drag-trigger"
        edgeScroll
        :gap="6"
      >
        <span>
          {{ node.text }}
        </span>
      </template>
    </Draggable>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { TreeData } from "@/models/TreeData";
import { BaseTree, Draggable, obj } from "@he-tree/vue2";
import "@he-tree/vue2/dist/he-tree-vue2.css";
@Component({
  components: {
    BaseTree,
    Draggable,
  },
})
export default class DirectoryTreeView extends Vue {
  @Prop() private msg!: string;
  private treeData: Array<TreeData> = [
    {
      text: "node 1",
      children: [
        {
          text: "node 1-1",
          documents: [""],
          children: [{ text: "Testing 123" }],
        },
        { text: "node 1-2" },
        { text: "node 1-3" },
        { text: "node 1-4" },
        { text: "node 1-5" },
        { text: "node 1-6" },
        { text: "node 1-7" },
        { text: "node 1-8" },
        { text: "node 1-9" },
        { text: "node 1-10" },
        { text: "node 1-11" },
        { text: "node 1-12" },
      ],
    },
  ];
}
</script>
