<script lang="ts">
  import { RGB255 } from "@lib/models";
  import EditorBase from "./EditorBase.svelte";

  export let rgb: RGB255 = new RGB255(0, 0, 0);
  export let a: number | undefined = undefined;
</script>

<EditorBase class={$$props.class} name="RGB" color={rgb.toString(a)}>
  <label for="rgb-r">Red</label>
  <input type="number" bind:value={rgb.r} min="0" max="255" />
  <input type="range" id="rgb-r" bind:value={rgb.r} min="0" max="255" />

  <label for="rgb-g">Green</label>
  <input type="number" bind:value={rgb.g} min="0" max="255" />
  <input type="range" id="rgb-g" bind:value={rgb.g} min="0" max="255" />

  <label for="rgb-b">Blue</label>
  <input type="number" bind:value={rgb.b} min="0" max="255" />
  <input type="range" id="rgb-b" bind:value={rgb.b} min="0" max="255" />

  {#if a !== undefined}
    <label for="rgb-a">Alpha</label>
    <input type="number" bind:value={a} min="0" max="1" step="0.1" />
    <input type="range" id="rgb-a" bind:value={a} min="0" max="1" step="0.1" />
  {/if}
</EditorBase>
