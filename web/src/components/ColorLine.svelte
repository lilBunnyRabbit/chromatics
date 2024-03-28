<script lang="ts">
  export let steps = 100;
  export let color: (index: number) => string;

  const aspect = 3 / 100;
</script>

<svg class="w-full" viewBox={`0 0 ${steps} ${aspect * steps}`} xmlns="http://www.w3.org/2000/svg">
  {#each { length: steps } as _, i}
    <rect shape-rendering="crispEdges" x={i} y={0} height="100%" width={1} fill={color(i)} />
  {/each}
</svg>
