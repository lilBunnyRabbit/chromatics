<script lang="ts">
  import Editors from "./lib/Editors.svelte";
  import HueActions from "./lib/HueActions.svelte";
  import RGBActions from "./lib/RGBActions.svelte";
</script>

<div class="p-8 flex flex-col gap-4">
  <RGBActions />

  <HueActions />

  <Editors />
</div>
