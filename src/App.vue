<template>
  <div class="home">
    <v-container>
      <v-row>
        <v-col md="5">
          <DirectoryTreeView
            :flatData="folders"
            @change="setActive($event)"
          ></DirectoryTreeView>
        </v-col>
        <v-col md="7">
          <FolderTreeView :flatData="documentsAndFolders"></FolderTreeView>
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

  created(): void {
    this.$store.dispatch("getData").then((flatData) => {
      this.folders = [...flatData];
    });
  }
}
</script>
