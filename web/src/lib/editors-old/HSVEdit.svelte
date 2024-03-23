<script lang="ts">
  import { HSV } from "@/models";
  import EditorBase from "./EditorBase.svelte";

  export let hsv: HSV = new HSV(0, 0, 0);
</script>

<EditorBase class={$$props.class} name="HSV" color={hsv.toHSL().toString()}>
  <label for="hsv-h">Hue</label>
  <input type="number" bind:value={hsv.h} min="0" max="360" />
  <input type="range" id="hsv-h" bind:value={hsv.h} min="0" max="360" />

  <label for="hsv-s">Saturation</label>
  <input type="number" bind:value={hsv.s} min="0" max="1" step="0.01" />
  <input type="range" id="hsv-s" bind:value={hsv.s} min="0" max="1" step="0.01" />

  <label for="hsv-v">Value</label>
  <input type="number" bind:value={hsv.v} min="0" max="1" step="0.01" />
  <input type="range" id="hsv-v" bind:value={hsv.v} min="0" max="1" step="0.01" />
</EditorBase>
