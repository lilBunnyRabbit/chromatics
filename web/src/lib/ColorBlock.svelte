<script lang="ts">
  export let color: string;
  export let name: string;
  export let info: string | number | undefined = undefined;
</script>

<h3 class="whitespace-nowrap pl-4 h-full py-1" style:background-color={color}>
  <p>{name}</p>
</h3>
<div class="pl-8 h-full py-1 whitespace-nowrap" style:background-color={color}>
  <p>
    {#if info}
      {info}
    {:else}
      {color}
    {/if}
  </p>
</div>

<style lang="scss">
  p {
    color: rgb(255, 255, 255);
    mix-blend-mode: difference;
  }
</style>
