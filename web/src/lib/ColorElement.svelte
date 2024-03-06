<script lang="ts">
  import { isString } from "@/utils";

  export let element: string | { value: string | number; color: string } | undefined;
</script>

{#if !element}
  <td></td>
{:else if isString(element)}
  <td style:background-color={element}><div>{element}</div></td>
{:else}
  <td style:background-color={element.color}><div>{element.value}</div></td>
{/if}

<style lang="scss">
  td {
    @apply text-xs text-center px-2;

    &:not(:last-child) {
      @apply border-r-4 border-inherit;
    }

    & > div {
      @apply font-mono;
      color: rgb(255, 255, 255);
      mix-blend-mode: difference;
    }
  }
</style>
