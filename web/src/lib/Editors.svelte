<script lang="ts">
  import { CMYK, HSI, HSL, HSV, HWB, NormalizedRGB, RGB } from "@/models";
  import { writable, type Updater } from "svelte/store";
  import CmykEdit from "./editors/CMYKEdit.svelte";
  import RgbEdit from "./editors/RGBEdit.svelte";
  import HslEdit from "./editors/HSLEdit.svelte";
  import HwbEdit from "./editors/HWBEdit.svelte";
  import HsiEdit from "./editors/HSIEdit.svelte";
  import HsvEdit from "./editors/HSVEdit.svelte";
  import NormalizedRgb from "./editors/NormalizedRGB.svelte";

  let cmyk = writable(new CMYK(0, 0, 0, 0));
  let hsi = writable(new HSI(0, 0, 0));
  let hsl = writable(new HSL(0, 0, 0));
  let hsv = writable(new HSV(0, 0, 0));
  let hwb = writable(new HWB(0, 0, 0));

  function updateFromRGB(value: NormalizedRGB, updater: any) {
    console.log("updateFromRGB");

    // BUG: black = 1 -> CMYK(NaN, NaN, NaN, NaN)
    if (updater !== CMYK) cmyk.set(value.toCMYK());
    if (updater !== HSI) hsi.set(value.toHSI());
    if (updater !== HSL) hsl.set(value.toHSL());
    if (updater !== HSV) hsv.set(value.toHSV());
    if (updater !== HWB) hwb.set(value.toHWB());
  }

  let rgb = (() => {
    const { subscribe, update } = writable(new NormalizedRGB(0, 0, 0));

    return {
      subscribe,
      set: (value: NormalizedRGB, updater?: any) => {
        update((current) => {
          if (updater !== undefined && current.toString() === value.toString()) return current;
          updateFromRGB(value, updater);
          return value;
        });
      },
    };
  })();

  $: console.log({
    $cmyk,
    $hsi,
    $hsl,
    $hsv,
    $hwb,
    $rgb,
  });

  cmyk.subscribe((value) => rgb.set(value.toRGB(), CMYK));
  hsi.subscribe((value) => rgb.set(value.toRGB(), HSI));
  hsl.subscribe((value) => rgb.set(value.toRGB(), HSL));
  hsv.subscribe((value) => rgb.set(value.toRGB(), HSV));
  hwb.subscribe((value) => rgb.set(value.toRGB(), HWB));
</script>

<div class="grid grid-cols-4 gap-x-4 gap-y-4">
  <NormalizedRgb bind:rgb={$rgb} />
  <CmykEdit class="col-span-3" bind:cmyk={$cmyk} />
  <HsiEdit bind:hsi={$hsi} />
  <HslEdit bind:hsl={$hsl} />
  <HsvEdit bind:hsv={$hsv} />
  <HwbEdit bind:hwb={$hwb} />
</div>
