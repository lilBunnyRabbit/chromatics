<script lang="ts">
  import type { HTMLButtonAttributes, HTMLInputAttributes } from "svelte/elements";

  interface $$Props extends HTMLInputAttributes {
    name: string;
  }

  export let value: number | string | undefined = undefined;
  export let name: string;
</script>

<div class="whitespace-nowrap border-r pr-2 border-white/20">{name}</div>
<input type="range" bind:value {...$$restProps} />
<input type="number" bind:value {...$$restProps} />

<style lang="scss">
  input[type="range"] {
    width: 100%;
  }

  input[type="number"] {
    @apply font-mono text-sm py-1 px-2 bg-black border border-white/20 truncate;
    width: 100%;
  }
</style>
