<script lang="ts">
  import type { RGB } from "@/models";

  export let rgb: RGB;
  export let a: number;
</script>

<div class={$$props.class}>
  <h3>RGB</h3>
  <div
    class="grid grid-cols-[min-content,min-content,min-content,1fr] w-full gap-x-4 gap-y-2 whitespace-nowrap p-2 max-w-[300px] border"
    style:background-color={rgb.toString(a)}
  >
    <label for="r">R</label>
    <span>=</span>
    <input type="number" bind:value={rgb.r} min="0" max="255" />
    <input type="range" id="r" bind:value={rgb.r} min="0" max="255" />

    <label for="g">G</label>
    <span>=</span>
    <input type="number" bind:value={rgb.g} min="0" max="255" />
    <input type="range" id="g" bind:value={rgb.g} min="0" max="255" />

    <label for="b">B</label>
    <span>=</span>
    <input type="number" bind:value={rgb.b} min="0" max="255" />
    <input type="range" id="b" bind:value={rgb.b} min="0" max="255" />

    <label for="a">A</label>
    <span>=</span>
    <input type="number" bind:value={a} min="0" max="1" step="0.1" />
    <input type="range" id="a" bind:value={a} min="0" max="1" step="0.1" />
  </div>
</div>

<style lang="scss">
  label,
  span {
    color: rgb(255, 255, 255);
    mix-blend-mode: difference;
  }

  input[type="number"] {
    padding: 0px 0.5rem;
    width: 50px;
    text-align: right;
  }

  /* Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  input[type="number"] {
    appearance: textfield;
    -moz-appearance: textfield;
  }
</style>
