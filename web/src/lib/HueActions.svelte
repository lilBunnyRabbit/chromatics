<script lang="ts">
  import { RGB } from "@/models";
  import HslEdit from "./editors/HSLEdit.svelte";

  $: hsl = new RGB(204, 8, 8).toHSL();

  $: rgb = hsl.toRGB();

  $: hsi = rgb.toHSI();
  $: hsv = rgb.toHSV();
  $: hwb = rgb.toHWB();
</script>

<HslEdit bind:hsl />

{rgb.toUint8()}

<div class="grid grid-cols-[min-content,repeat(4,1fr)] gap-x-4 whitespace-nowrap">
  <div></div>
  <div>HSI</div>
  <div>HSL</div>
  <div>HSV</div>
  <div>HWB</div>

  <!-- RGB -->
  <div>HSI</div>
  <div>{hsi}</div>
  <div>{hsi.toHSL()}</div>
  <div>{hsi.toHSV()}</div>
  <div>{hsi.toHWB()}</div>

  <!-- HSV -->
  <div>HSL</div>
  <div>{hsl.toHSI()}</div>
  <div>{hsl}</div>
  <div>{hsl.toHSV()}</div>
  <div>{hsl.toHWB()}</div>

  <!-- HSL, HWB -->
  <div>HSV</div>
  <div>{hsv.toHSI()}</div>
  <div>{hsv.toHSL()}</div>
  <div>{hsv}</div>
  <div>{hsv.toHWB()}</div>

  <!-- HSV -->
  <div>HWB</div>
  <div>{hwb.toHSI()}</div>
  <div>{hwb.toHSL()}</div>
  <div>{hwb.toHSV()}</div>
  <div>{hwb}</div>
</div>
