<script lang="ts">
  import { CMYK } from "@/models";
  import EditorBase from "./EditorBase.svelte";

  export let cmyk: CMYK = new CMYK(0, 0, 0, 0);

  $: console.log(cmyk);
</script>

<EditorBase class={$$props.class} name="CMYK" color={cmyk.toRGB().toString()}>
  <label for="cmyk-c">Cyan</label>
  <input type="number" bind:value={cmyk.c} min="0" max="1" step="0.01" />
  <input type="range" id="cmyk-c" bind:value={cmyk.c} min="0" max="1" step="0.01" />

  <label for="cmyk-m">Magenta</label>
  <input type="number" bind:value={cmyk.m} min="0" max="1" step="0.01" />
  <input type="range" id="cmyk-m" bind:value={cmyk.m} min="0" max="1" step="0.01" />

  <label for="cmyk-y">Yellow</label>
  <input type="number" bind:value={cmyk.y} min="0" max="1" step="0.01" />
  <input type="range" id="cmyk-y" bind:value={cmyk.y} min="0" max="1" step="0.01" />

  <label for="cmyk-k">Black</label>
  <input type="number" bind:value={cmyk.k} min="0" max="1" step="0.01" />
  <input type="range" id="cmyk-k" bind:value={cmyk.k} min="0" max="1" step="0.01" />
</EditorBase>
