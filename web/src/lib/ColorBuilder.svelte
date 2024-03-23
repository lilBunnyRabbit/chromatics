<script lang="ts">
  import { CMYK, HSI, HSL, RGB255, HSV, HWB, XYZ, Lab } from "@/models";
  import ColorEditor from "./ColorEditor.svelte";
  import ColorInput from "./ColorInput.svelte";
  import { writable } from "svelte/store";
  import { randomNumber } from "@/utils";

  const initialColor = new RGB255(randomNumber(0, 255), randomNumber(0, 255), randomNumber(0, 255));

  $: base = initialColor.toRGB();

  $: rgb = initialColor.clone();
  $: cmyk = initialColor.toCMYK();
  $: hsi = initialColor.toHSI();
  $: hsl = initialColor.toHSL();
  $: hsv = initialColor.toHSV();
  $: hwb = initialColor.toHWB();
  $: xyz = initialColor.toXYZ();
  $: lab = initialColor.toXYZ().toLAB();

  const active = writable<
    typeof RGB255 | typeof CMYK | typeof HSI | typeof HSL | typeof HSV | typeof HWB | typeof XYZ | typeof Lab
  >(RGB255);

  function setActive(color: typeof $active) {
    return () => {
      active.set(color);
    };
  }

  function updateFromBase(exclude?: typeof $active) {
    if (exclude !== RGB255) rgb = base.toRGB255();
    if (exclude !== CMYK) cmyk = base.toCMYK();
    if (exclude !== HSI) hsi = base.toHSI();
    if (exclude !== HSL) hsl = base.toHSL();
    if (exclude !== HSV) hsv = base.toHSV();
    if (exclude !== HWB) hwb = base.toHWB();
    if (exclude !== XYZ) xyz = base.toXYZ();
    if (exclude !== Lab) lab = base.toLAB();
  }

  $: {
    const newBase = (() => {
      switch ($active) {
        case RGB255:
          return rgb.toRGB();
        case CMYK:
          return cmyk.toRGB();
        case HSI:
          return hsi.toRGB();
        case HSL:
          return hsl.toRGB();
        case HSV:
          return hsv.toRGB();
        case HWB:
          return hwb.toRGB();
        case XYZ:
          return xyz.toRGB();
        case Lab:
          return lab.toXYZ().toRGB();
      }
    })();

    if (newBase) {
      base = newBase;
      updateFromBase($active);
    }
  }
</script>

<div class="w-full h-full flex justify-center items-center p-6">
  <div class="w-full h-full rounded-3xl p-6 overflow-y-auto" style:background-color={base.toString()}>
    <div
      class="bg-black rounded-3xl px-6 py-4 mb-6 text-center text-2xl grid grid-cols-[1fr,2fr,1fr] whitespace-nowrap items-center font-mono"
    >
      <div class="text-xs text-left">
        <div class:bg-red-500={base.r < 0 || base.r > 1}>R: {base.r}</div>
        <div class:bg-red-500={base.g < 0 || base.g > 1}>G: {base.g}</div>
        <div class:bg-red-500={base.b < 0 || base.b > 1}>B: {base.b}</div>
      </div>
      <div>{rgb.toHex()}</div>
      <div class="text-xs text-right">{rgb.toNumeric()}</div>
    </div>

    <div class="gap-6 grid grid-cols-[repeat(auto-fit,minmax(450px,1fr))] justify-start">
      <ColorEditor name="RGB 255" on:mousedown={setActive(RGB255)} color={rgb.toString()}>
        <ColorInput name="Red" bind:value={rgb.r} min="0" max="255" step="1" />
        <ColorInput name="Green" bind:value={rgb.g} min="0" max="255" step="1" />
        <ColorInput name="Blue" bind:value={rgb.b} min="0" max="255" step="1" />
      </ColorEditor>

      <ColorEditor name="CMYK" on:mousedown={setActive(CMYK)}>
        <ColorInput name="Cyan" bind:value={cmyk.c} min="0" max="1" step="0.01" />
        <ColorInput name="Magenta" bind:value={cmyk.m} min="0" max="1" step="0.01" />
        <ColorInput name="Yellow" bind:value={cmyk.y} min="0" max="1" step="0.01" />
        <ColorInput name="Black" bind:value={cmyk.k} min="0" max="1" step="0.01" />
      </ColorEditor>

      <ColorEditor name="HSI" on:mousedown={setActive(HSI)}>
        <ColorInput name="Hue" bind:value={hsi.h} min="0" max="360" step="0.01" />
        <ColorInput name="Saturation" bind:value={hsi.s} min="0" max="1" step="0.01" />
        <ColorInput name="Intensity" bind:value={hsi.i} min="0" max="1" step="0.01" />
      </ColorEditor>

      <ColorEditor name="HSL" on:mousedown={setActive(HSL)} color={hsl.toString()}>
        <ColorInput name="Hue" bind:value={hsl.h} min="0" max="360" step="0.01" />
        <ColorInput name="Saturation" bind:value={hsl.s} min="0" max="1" step="0.01" />
        <ColorInput name="Luminosity" bind:value={hsl.l} min="0" max="1" step="0.01" />
      </ColorEditor>

      <ColorEditor name="HSV" on:mousedown={setActive(HSV)} color={hsv.toHSL().toString()}>
        <ColorInput name="Hue" bind:value={hsv.h} min="0" max="360" step="0.01" />
        <ColorInput name="Saturation" bind:value={hsv.s} min="0" max="1" step="0.01" />
        <ColorInput name="Value" bind:value={hsv.v} min="0" max="1" step="0.01" />
      </ColorEditor>

      <ColorEditor name="HWB" on:mousedown={setActive(HWB)} color={hwb.toString()}>
        <ColorInput name="Hue" bind:value={hwb.h} min="0" max="360" step="0.01" />
        <ColorInput name="Whiteness" bind:value={hwb.w} min="0" max="1" step="0.01" />
        <ColorInput name="Blackness" bind:value={hwb.b} min="0" max="1" step="0.01" />
      </ColorEditor>

      <ColorEditor name="XYZ (D65)" on:mousedown={setActive(XYZ)} color={xyz.toString("D65")}>
        <ColorInput name="X" bind:value={xyz.x} min="0" max="95" step="0.01" />
        <ColorInput name="Y" bind:value={xyz.y} min="0" max="100" step="0.01" />
        <ColorInput name="Z" bind:value={xyz.z} min="0" max="108" step="0.01" />
      </ColorEditor>

      <ColorEditor name="CIE Lab (D65)" on:mousedown={setActive(Lab)} color={lab.toString()}>
        <ColorInput name="Lightness" bind:value={lab.l} min="0" max="100" step="0.01" />
        <ColorInput name="Green-Red" bind:value={lab.a} min="-128" max="127" step="0.01" />
        <ColorInput name="Blue-Yellow" bind:value={lab.b} min="-128" max="127" step="0.01" />
      </ColorEditor>
    </div>
  </div>

  <div class="fixed top-[1.5px] left-0 right-0 text-center text-red-500 text-sm font-black tracking-[.75rem]">WIP</div>
</div>
