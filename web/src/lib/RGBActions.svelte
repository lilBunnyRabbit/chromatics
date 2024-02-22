<script lang="ts">
  import { RGB } from "@/models";
  import { randomNumber, timeExecution } from "@/utils";
  import ColorBlock from "./ColorBlock.svelte";
  import RgbEdit from "./editors/RGBEdit.svelte";

  $: a = 1;
  // $: rgb = new RGB(randomNumber(0, 255), randomNumber(0, 255), randomNumber(0, 255));
  $: rgb = (() => {
    const rgb = new RGB(randomNumber(0, 255), randomNumber(0, 255), randomNumber(0, 255));
    const hsl = rgb.toHSL();
    hsl.l = 0.8;

    return hsl.toRGB().toUint8();
  })();

  $: numericRgb = rgb.toNumeric();
  $: numericRgbRgb = RGB.fromRGB(numericRgb);

  $: hex = rgb.toHex();
  $: hexRgb = RGB.fromHex(hex);

  $: cmyk = rgb.toCMYK();
  $: cmykRgb = cmyk.toRGB().toUint8();

  $: hsi = rgb.toHSI();
  $: hsiRgb = hsi.toRGB().toUint8();

  $: hsl = rgb.toHSL();
  $: hslRgb = hsl.toRGB().toUint8();

  $: hsv = rgb.toHSV();
  $: hsvRgb = hsv.toRGB().toUint8();

  $: hwb = rgb.toHWB();
  $: hwbRgb = hwb.toRGB().toUint8();

  $: xyz = rgb.toXYZ();
  $: xyzRgb = xyz.toRGB().toUint8();

  $: lab = rgb.toLAB();
  $: labRgb = lab.toXYZ().toRGB().toUint8();

  function equalsRGB(compare: RGB) {
    if (compare.toString() === rgb.toString()) {
      return { info: "✓", color: "transparent" };
    }

    return { color: compare.toString() };
  }

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

  function runTest() {
    console.group("Starting Test");
    const test = (rgb: RGB) => {
      const errors: Record<string, any> = {};

      const hex = RGB.fromHex(rgb.toHex());
      if (!rgb.equals(hex)) errors.hex = hex.toArray();

      const numeric = RGB.fromRGB(rgb.toNumeric());
      if (!rgb.equals(numeric)) errors.numeric = numeric.toArray();

      const cmyk = rgb.toCMYK().toRGB().toUint8();
      if (!rgb.equals(cmyk)) errors.cmyk = cmyk.toArray();

      const hsi = rgb.toHSI().toRGB().toUint8();
      if (!rgb.equals(hsi)) errors.hsi = hsi.toArray();

      const hsl = rgb.toHSL().toRGB().toUint8();
      if (!rgb.equals(hsl)) errors.hsl = hsl.toArray();

      const hsv = rgb.toHSV().toRGB().toUint8();
      if (!rgb.equals(hsv)) errors.hsv = hsv.toArray();

      const hwb = rgb.toHWB().toRGB().toUint8();
      if (!rgb.equals(hwb)) errors.hwb = hwb.toArray();

      const xyz = rgb.toXYZ().toRGB().toUint8();
      if (!rgb.equals(xyz)) errors.xyz = xyz.toArray();

      const lab = rgb.toLAB().toXYZ().toRGB().toUint8();
      if (!rgb.equals(lab)) errors.lab = lab.toArray();

      if (Object.keys(errors).length) {
        return [rgb.toArray(), errors];
      }
    };

    const errors: any[] = [];

    for (let r = 0; r < 256; r++) {
      console.log(`Test r = ${r}, errors = ${errors.length}`);
      for (let g = 0; g < 256; g++) {
        for (let b = 0; b < 256; b++) {
          const error = test(new RGB(r, g, b));
          if (error) {
            errors.push(error);
          }
        }
      }
    }

    if (!errors.length) {
      console.log("No errors");
    } else {
      console.log("Errors", errors);
    }
    console.groupEnd();
  }

  function runTime() {
    const hsl = new RGB(125, 256, 75).toHSL();

    const times1: number[] = [];
    const times2: number[] = [];
    const times3: number[] = [];

    for (let i = 0; i < 1000; i++) {
      times1.push(timeExecution(hsl.toRGB__Nikolai.bind(hsl)));
      times2.push(timeExecution(hsl.toRGB__Short.bind(hsl)));
      times3.push(timeExecution(hsl.toRGB.bind(hsl)));
    }

    console.log("hsl.toRGB__Nikolai", [...hsl.toRGB__Nikolai()], {
      avg: times1.reduce((p, c) => p + c, 0) / times1.length,
      min: Math.min(...times1),
      max: Math.max(...times1),
    });
    console.log("hsl.toRGB__Short", [...hsl.toRGB__Short()], {
      avg: times2.reduce((p, c) => p + c, 0) / times2.length,
      min: Math.min(...times2),
      max: Math.max(...times2),
    });
    console.log("hsl.toRGB", [...hsl.toRGB()], {
      avg: times3.reduce((p, c) => p + c, 0) / times3.length,
      min: Math.min(...times3),
      max: Math.max(...times3),
    });
  }
</script>

<div class="flex flex-col">
  <RgbEdit class="mb-4" bind:rgb bind:a />

  <button class="mb-4 border w-fit px-4" on:click={runTest}>Run Test</button>
  <button class="mb-4 border w-fit px-4" on:click={runTime}>Run Time</button>

  <div class="grid grid-cols-[50px,1fr]">
    <div class="h-full flex justify-center items-center" style:background-color={rgb.toString()}>
      <p>RGB</p>
    </div>

    <div class="grid grid-cols-[min-content,1fr,min-content,1fr] items-center">
      <ColorBlock name="RGB" color={rgb.toString()} />
      <ColorBlock name="RGB" color={rgb.toString()} />

      <ColorBlock name="HEX" color={hex} />
      <ColorBlock name="RGB" {...equalsRGB(hexRgb)} />

      <ColorBlock name="Numeric RGB" info={numericRgb} color={rgb.toString()} />
      <ColorBlock name="RGB" {...equalsRGB(numericRgbRgb)} />

      <ColorBlock name="CMYK" info={cmyk.toString()} color={cmykRgb.toString()} />
      <ColorBlock name="RGB" {...equalsRGB(cmykRgb)} />

      <ColorBlock name="HSI" info={hsi.toString()} color={hsiRgb.toString()} />
      <ColorBlock name="RGB" {...equalsRGB(hsiRgb)} />

      <ColorBlock name="HSL" color={hsl.toString()} />
      <ColorBlock name="RGB" {...equalsRGB(hslRgb)} />

      <ColorBlock name="HSV" info={hsv.toString()} color={hsvRgb.toString()} />
      <ColorBlock name="RGB" {...equalsRGB(hsvRgb)} />

      <ColorBlock name="HWB" color={hwb.toString()} />
      <ColorBlock name="RGB" {...equalsRGB(hwbRgb)} />

      <ColorBlock name="XYZ (D65)" color={xyz.toString("D65")} />
      <ColorBlock name="RGB" {...equalsRGB(xyzRgb)} />

      <ColorBlock name="LAB (D65)" color={lab.toString()} />
      <ColorBlock name="RGB" {...equalsRGB(labRgb)} />

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
