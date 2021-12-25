<template>
  <div class="home">
    <v-container>
      <v-row>
        <v-col md="4">
          <DirectoryTreeView></DirectoryTreeView>
        </v-col>
        <v-col md="8">
          <DirectoryTreeView></DirectoryTreeView>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import HelloWorld from "@/components/HelloWorld.vue"; // @ is an alias to /src
import DirectoryTreeView from "@/components/TreeView/DirectoryTreeView/DirectoryTreeView.vue"; // @ is an alias to /src

@Component({
  components: {
    HelloWorld,
    DirectoryTreeView,
  },
})
export default class Home extends Vue {}
</script>
