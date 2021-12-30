<template>
  <div class="home">
    <v-container>
      <v-row>
        <button @click="loadData()">Reload source data</button>
      </v-row>
      <v-row>
        <v-col col="12" md="5" lg="4">
          <DirectoryTreeView
            :flatData="folders"
            @change="setActive()"
          ></DirectoryTreeView>
        </v-col>
        <v-col col="12" md="5" lg="4">
          <FolderTreeView :flatData.sync="documentsAndFolders"></FolderTreeView>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import HelloWorld from "@/components/HelloWorld.vue"; // @ is an alias to /src
import DirectoryTreeView from "@/components/TreeView/DirectoryTreeView/DirectoryTreeView.vue"; // @ is an alias to /src
import FolderTreeView from "@/components/TreeView/FolderTreeView/FolderTreeView.vue"; // @ is an alias to /src
import { FlatData } from "./models/FlatData";

@Component({
  components: {
    HelloWorld,
    DirectoryTreeView,
    FolderTreeView,
  },
})
export default class Home extends Vue {
  private documentsAndFolders: Array<FlatData> = [];
  private folders: Array<FlatData> = [];

  setActive(): void {
    this.documentsAndFolders = [];
    this.documentsAndFolders = [...this.$store.getters.documentsAndFolders];
  }

  loadData(): void {
    this.$store.dispatch("setActiveNode", {});
    this.documentsAndFolders = [];
    this.$store.dispatch("getData").then((flatData) => {
      this.folders = [...flatData];
    });
  }

  created(): void {
    this.loadData();
  }
}
</script>
<style lang="scss" scoped>
button {
  padding: 0 0 10px;
}
</style>
