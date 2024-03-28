<script lang="ts">
  import { base } from "$app/paths";
  import { HSI } from "@lib/models";
  import { randomNumber } from "@lib/utils";

  const baseColor = new HSI(randomNumber(0, 360), 1, 0.5);
  const color = baseColor.toRGB();
  const color2 = new HSI((baseColor.h + 180) % 360, baseColor.s, baseColor.i).toRGB();
</script>

<div class="w-full h-full grid grid-rows-[1fr,2fr,1fr] p-6">
  <div></div>
  <div class="-mt-16 self-center text-center">
    <h1 class="text-8xl font-medium" style:color={color.toString()}>Chromatics</h1>
    <h2 class="text-2xl mt-2" style:color={color2.toString()}>
      by <a href="https://github.com/lilBunnyRabbit">lilBunnyRabbit</a>
    </h2>
  </div>
  <div>
    <h3>Pages: (Temporary)</h3>
    <ul class="list-disc list-inside [&_a]:underline [&_a]:text-blue-300">
      <li><a href="{base}/builder">Color Builder</a></li>
      <li><a href="{base}/rgb-playground">RGB Playground</a></li>
    </ul>
  </div>
</div>

<style lang="scss">
  h1 {
    text-shadow: 0 0 0.1em currentColor;
  }
</style>
