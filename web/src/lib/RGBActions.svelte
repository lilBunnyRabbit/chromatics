<script lang="ts">
  import { RGB } from "@/models";
  import ColorBlock from "./ColorBlock.svelte";
  import RgbEdit from "./RGBEdit.svelte";
  import { onMount } from "svelte";

  $: a = 1;
  $: rgb = new RGB(64, 55, 107);

  $: numericRgb = rgb.toNumeric();
  $: numericRgbRgb = RGB.fromRGB(numericRgb);

  $: cmyk = rgb.toCMYK();
  $: cmykRgb = cmyk.toRGB();

  $: hsl = rgb.toHSL();
  $: hslRgb = hsl.toRGB();

  $: hsv = rgb.toHSV();
  $: hsvRgb = hsv.toRGB();

  // $: xyz = rgb.toXYZ();

  // $: xyzsAndLabs = Object.keys(illuminants).map((key) => {
  //   const xyz = rgb.toXYZ(key as keyof typeof illuminants);
  //   const lab = xyz.toLAB();

  //   const xyzRgb = xyz.toRGB();
  //   const labRgb = lab.toRGB();

  //   return {
  //     key,
  //     xyz,
  //     lab,
  //     xyzRgb,
  //     labRgb,
  //   };
  // });

  onMount(() => {
    // for (let r = 0; r < 256; r++) {
    //   console.log("r", r);
    //   for (let g = 0; g < 256; g++) {
    //     for (let b = 0; b < 256; b++) {
    //       const rgb = new RGB(r, g, b);
    //       const hsl = rgb.toHSV();
    //       if (hsl.toRGB().toString() !== rgb.toString()) {
    //         console.log("Error HSL", hsl.toString(), rgb.toString());
    //       }
    //     }
    //   }
    // }
    // console.log("ALL OK");
  });
</script>

<div class="flex flex-col">
  <RgbEdit class="mb-4" bind:rgb bind:a />

  <div class="grid grid-cols-[50px,1fr]">
    <div class="h-full flex justify-center items-center" style:background-color={rgb.toString()}>
      <p>RGB</p>
    </div>

    <div class="grid grid-cols-[min-content,1fr,min-content,1fr] items-center">
      <ColorBlock name="RGB → Numeric RGB" info={numericRgb} color={rgb.toString()} />
      <ColorBlock name="Numeric RGB → RGB" color={numericRgbRgb.toString()} />

      <ColorBlock name="RGB → HEX" color={rgb.toHex()} />
      <ColorBlock name="HEX → RGB" color={rgb.toString()} />

      <ColorBlock name="RGB → CMYK" info={cmyk.toString()} color={cmyk.toHex()} />
      <ColorBlock name="CMYK → RGB" color={cmykRgb.toString()} />

      <ColorBlock name="RGB → HSL" color={hsl.toString()} />
      <ColorBlock name="HSL → RGB" color={hslRgb.toString()} />

      <ColorBlock name="RGB → HSV" info={hsv.toString()} color={hsvRgb.toString()} />
      <ColorBlock name="HSV → RGB" color={hsvRgb.toString()} />

      <!-- <div class="col-span-3 my-2 px-4">XYZ and LAB</div>

      {#each xyzsAndLabs as { key, xyz, xyzRgb, lab, labRgb }}
        <ColorBlock name={`RGB → XYZ(${key})`} color={xyz.toString()} />
        <ColorBlock name={`XYZ(${key}) → RGB`} color={xyzRgb.toString()} />

        <ColorBlock name={`RGB → LAB(${key})`} color={lab.toString()} />
        <ColorBlock name={`LAB(${key}) → RGB`} color={labRgb.toString()} />
      {/each} -->
    </div>
  </div>
</div>

<style lang="scss">
  p {
    color: rgb(255, 255, 255);
    mix-blend-mode: difference;

    text-orientation: upright;
    writing-mode: vertical-rl;
  }
</style>
