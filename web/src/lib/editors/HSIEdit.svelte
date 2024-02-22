<script lang="ts">
  import { HSI } from "@/models";
  import EditorBase from "./EditorBase.svelte";

  export let hsi: HSI = new HSI(0, 0, 0);
</script>

<EditorBase class={$$props.class} name="HSI" color={hsi.toRGB().toString()}>
  <label for="hsi-h">Hue</label>
  <input type="number" bind:value={hsi.h} min="0" max="360" />
  <input type="range" id="hsi-h" bind:value={hsi.h} min="0" max="360" />

  <label for="hsi-s">Saturation</label>
  <input type="number" bind:value={hsi.s} min="0" max="1" step="0.01" />
  <input type="range" id="hsi-s" bind:value={hsi.s} min="0" max="1" step="0.01" />

  <label for="hsi-i">Intensity</label>
  <input type="number" bind:value={hsi.i} min="0" max="1" step="0.01" />
  <input type="range" id="hsi-i" bind:value={hsi.i} min="0" max="1" step="0.01" />
</EditorBase>
