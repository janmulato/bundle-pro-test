<template>
  <div class="home">
    <DirectoryTreeView></DirectoryTreeView>
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
