<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  interface $$Props extends HTMLInputAttributes {
    name: string;
    steps?: number;
    getColor?: (index: number) => string;
  }

  export let value: $$Props["value"] = undefined;
  export let name: $$Props["name"];

  export let steps: Exclude<$$Props["steps"], undefined> = 10;
  export let getColor: $$Props["getColor"] = undefined;

  const aspect = 10 / 100;
</script>

<div class="whitespace-nowrap border-r pr-2 border-white/20 h-full flex items-center">{name}</div>

{#if getColor}
  <div class="relative">
    <input class="absolute top-0 bottom-0 right-0 left-0" type="range" bind:value {...$$restProps} />
    <div class="z-[-1]">
      <svg
        class="w-full top-0 bottom-0 left-0 right-0"
        shape-rendering="crispEdges"
        viewBox={`0 0 ${steps} ${aspect * steps}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {#each { length: steps } as _, i}
          <rect x={i} y={0} height="100%" width={1} fill={getColor(i)} />
        {/each}
      </svg>
    </div>
  </div>
{:else}
  <input type="range" bind:value {...$$restProps} />
{/if}

<input type="number" bind:value {...$$restProps} />

<style lang="scss">
  input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 100%;
    background: transparent;
    outline: none;
    opacity: 0.8;
    -webkit-transition: 0.2s;
    transition: opacity 0.2s;

    /* Mouse-over effects */
    &:hover {
      opacity: 1;
    }

    /* The slider handle (use -webkit- (Chrome, Opera, Safari, Edge) and -moz- (Firefox) to override default look) */
    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 1rem;
      height: 30px;
      background: transparent;
      cursor: pointer;
      outline: 2px solid white;
      border: 4px solid black;
    }

    &::-moz-range-thumb {
      width: 10%;
      height: 100%;
      background: black;
      cursor: pointer;
      outline: 2px solid white;
      border: 4px solid black;
    }
  }

  input[type="number"] {
    @apply font-mono text-sm py-1 px-2 bg-black border border-white/20 truncate;
    width: 100%;
  }
</style>
