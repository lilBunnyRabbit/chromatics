<script lang="ts">
  import { HWB } from "@/models";
  import EditorBase from "./EditorBase.svelte";

  export let hwb: HWB = new HWB(0, 0, 0);
</script>

<EditorBase class={$$props.class} name="HWB" color={hwb.toHSL().toString()}>
  <label for="hwb-h">Hue</label>
  <input type="number" bind:value={hwb.h} min="0" max="360" />
  <input type="range" id="hwb-h" bind:value={hwb.h} min="0" max="360" />

  <label for="hwb-w">Whiteness</label>
  <input type="number" bind:value={hwb.w} min="0" max="1" step="0.01" />
  <input type="range" id="hwb-w" bind:value={hwb.w} min="0" max="1" step="0.01" />

  <label for="hwb-b">Blackness</label>
  <input type="number" bind:value={hwb.b} min="0" max="1" step="0.01" />
  <input type="range" id="hwb-b" bind:value={hwb.b} min="0" max="1" step="0.01" />
</EditorBase>
