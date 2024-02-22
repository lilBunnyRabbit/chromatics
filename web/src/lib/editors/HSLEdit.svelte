<script lang="ts">
  import { HSL } from "@/models";
  import EditorBase from "./EditorBase.svelte";

  export let hsl: HSL = new HSL(0, 0, 0);
</script>

<EditorBase class={$$props.class} name="HSL" color={hsl.toString()}>
  <label for="hsl-h">Hue</label>
  <input type="number" bind:value={hsl.h} min="0" max="360" />
  <input type="range" id="hsl-h" bind:value={hsl.h} min="0" max="360" />

  <label for="hsl-s">Saturation</label>
  <input type="number" bind:value={hsl.s} min="0" max="1" step="0.01" />
  <input type="range" id="hsl-s" bind:value={hsl.s} min="0" max="1" step="0.01" />

  <label for="hsl-l">Lightness</label>
  <input type="number" bind:value={hsl.l} min="0" max="1" step="0.01" />
  <input type="range" id="hsl-l" bind:value={hsl.l} min="0" max="1" step="0.01" />
</EditorBase>
