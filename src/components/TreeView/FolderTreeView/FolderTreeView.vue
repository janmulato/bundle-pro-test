<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { TreeData } from "@/models/TreeData";

@Component
export default class FolderTreeView extends Vue {
  @Prop() private msg!: string;
  private treeData: Array<TreeData> = [];
}
</script>
