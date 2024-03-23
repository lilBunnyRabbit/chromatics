<script lang="ts">
  export let name: string;
  export let color: string;
</script>

<div class={$$props.class}>
  <h3>{name}</h3>
  <div
    class="editor-grid grid grid-cols-[min-content,min-content,1fr] w-full gap-x-4 gap-y-2 whitespace-nowrap p-2 max-w-[500px] border"
    style:background-color={color}
  >
    <slot />
  </div>
</div>

<style lang="scss">
  .editor-grid {
    & :global(> label),
    & :global(> span) {
      color: rgb(255, 255, 255);
      mix-blend-mode: difference;
    }

    & :global(> input[type="number"]) {
      padding: 0px 0.5rem;
      width: 75px;
      text-align: right;
      font-family: "Courier New", Courier, monospace;
      font-size: 14px;
    }

    & :global(> input) {
      /* Chrome, Safari, Edge, Opera */
      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      /* Firefox */
      &[type="number"] {
        appearance: textfield;
        -moz-appearance: textfield;
      }
    }
  }
</style>
