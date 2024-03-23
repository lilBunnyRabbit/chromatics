<script lang="ts">
  export let name: string;
  export let color: string = "transparent";
</script>

<div
  on:mousedown
  role="button"
  tabindex="0"
  class="cursor-default flex flex-col gap-y-4 bg-black rounded-3xl p-4 outline outline-4"
  style:outline-color={color}
>
  <h2 class="text-center text-xl">{name}</h2>
  <div class="grid grid-cols-[min-content,1fr,100px] gap-x-2 gap-y-1 items-center">
    <slot />
  </div>
</div>
