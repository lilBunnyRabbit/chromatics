<script lang="ts">
  import { RGB255, XYZ } from "@lib/models";
  import { randomNumber } from "@lib/utils";
  import { objectKeys } from "../utils/object.util";
  import ColorElement from "./ColorElement.svelte";
  import { convertFromRGB } from "./colorConvert";
  import RgbEdit from "./editors-old/RGBEdit.svelte";

  $: a = 1;
  // $: rgb = new RGB(randomNumber(0, 255), randomNumber(0, 255), randomNumber(0, 255));
  $: rgb = (() => {
    const rgb = new RGB255(randomNumber(0, 255), randomNumber(0, 255), randomNumber(0, 255));
    const hsl = rgb.toHSL();
    hsl.l = 0.8;

    return hsl.toRGB().toRGB255();
  })();

  $: colors = convertFromRGB(rgb);

  function runTest() {
    console.group("Starting Test");
    const test = (rgb: RGB255) => {
      const errors: Record<string, any> = {};

      const hex = RGB255.fromHex(rgb.toHex());
      if (!rgb.equals(hex)) errors.hex = hex.toArray();

      // const numeric = RGB.fromRGB(rgb.toNumeric());
      // if (!rgb.equals(numeric)) errors.numeric = numeric.toArray();

      // const cmyk = rgb.toCMYK().toRGB().toUint8();
      // if (!rgb.equals(cmyk)) errors.cmyk = cmyk.toArray();

      // const hsi = rgb.toHSI().toRGB().toUint8();
      // if (!rgb.equals(hsi)) errors.hsi = hsi.toArray();

      // const hsl = rgb.toHSL().toRGB().toUint8();
      // if (!rgb.equals(hsl)) errors.hsl = hsl.toArray();

      // const hsv = rgb.toHSV().toRGB().toUint8();
      // if (!rgb.equals(hsv)) errors.hsv = hsv.toArray();

      // const hwb = rgb.toHWB().toRGB().toUint8();
      // if (!rgb.equals(hwb)) errors.hwb = hwb.toArray();

      // const xyz = rgb.toXYZ().toRGB().toUint8();
      // if (!rgb.equals(xyz)) errors.xyz = xyz.toArray();

      // const lab = rgb.toLAB().toXYZ().toRGB().toUint8();
      // if (!rgb.equals(lab)) errors.lab = lab.toArray();

      if (Object.keys(errors).length) {
        return [rgb.toArray(), errors];
      }
    };

    const errors: any[] = [];

    for (let r = 0; r < 256; r++) {
      console.log(`Test r = ${r}, errors = ${errors.length}`);
      for (let g = 0; g < 256; g++) {
        for (let b = 0; b < 256; b++) {
          const error = test(new RGB255(r, g, b));
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

  $: colorKeys = objectKeys(colors);

  $: illuminants = (() => {
    return [
      {
        illuminant: "",
        conversions: {
          xyz: rgb.toXYZ().toString(),
          xyzRgb: rgb.toXYZ().toRGB().toRGB255().toString(),
          lab: "",
          labRgb: "",
        },
      },
      ...objectKeys(XYZ.Illuminants).map((illuminant) => {
        const xyz = rgb.toXYZ();
        const xyzRgb = xyz.toRGB().toRGB255();
        const lab = xyz.toLAB(illuminant);
        const labRgb = lab.toXYZ().toRGB().toRGB255();

        return {
          illuminant,
          conversions: {
            xyz: xyz.toString(illuminant),
            xyzRgb: xyzRgb.toString(),
            lab: lab.toString(),
            labRgb: labRgb.toString(),
          },
        };
      }),
    ];
  })();
</script>

<div class="flex flex-col">
  <button class="mb-4 border w-fit px-4" on:click={runTest}>Run Test</button>

  <div class="flex items-start gap-4">
    <RgbEdit class="mb-4" bind:rgb bind:a />

    <div class="mt-8">
      <div>Hex: {rgb.toHex()}</div>
      <div>Numeric: {rgb.toNumeric()}</div>
    </div>
  </div>

  <h2>Direct Coversions</h2>

  <table style:border-color={rgb.toString()}>
    <thead>
      <tr>
        <th style:width="200px">From \ To</th>
        {#each colorKeys as colorKey}
          <th style:width={colors[colorKey].width}>{colors[colorKey].name}</th>
        {/each}
      </tr>
    </thead>

    <tbody>
      {#each colorKeys as colorKey}
        <tr>
          <th>{colors[colorKey].name}</th>

          {#each colorKeys as conversionKey}
            {#if conversionKey in colors[colorKey].conversions}
              <ColorElement element={colors[colorKey].conversions[conversionKey]} />
            {:else}
              <td></td>
            {/if}
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>

  <h2 class="mt-8">XYZ illuminants</h2>

  <table style:border-color={rgb.toString()}>
    <thead>
      <tr>
        <th style:width="200px">Illuminant \ Coversion</th>
        <th style:width="260px">XYZ</th>
        <th style:width="139px">→ RGB</th>
        <th style:width="260px">LAB</th>
        <th style:width="139px">→ RGB</th>
      </tr>
    </thead>

    <tbody>
      {#each illuminants as values}
        <tr>
          <th>{values.illuminant}</th>
          <ColorElement element={values.conversions.xyz} />
          <ColorElement element={values.conversions.xyzRgb} />
          <ColorElement element={values.conversions.lab} />
          <ColorElement element={values.conversions.labRgb} />
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style lang="scss">
  #colors-grid {
    & > div {
      color: rgb(255, 255, 255);
      mix-blend-mode: difference;
    }
  }

  p {
    color: rgb(255, 255, 255);
    mix-blend-mode: difference;

    text-orientation: upright;
    writing-mode: vertical-rl;
  }

  table {
    @apply border-4;
    table-layout: fixed;
    border-collapse: collapse;
    overflow: hidden;
    width: fit-content;

    & > thead {
      @apply border-inherit;
      & > tr {
        @apply border-b-4 border-inherit;

        & > th {
          &:not(:last-child) {
            @apply border-r-4 border-inherit;
          }
        }
      }
    }

    & > tbody {
      @apply border-inherit;

      & > tr {
        @apply border-inherit;

        &:not(:last-child) {
          @apply border-b-4 border-inherit;
        }

        & > th {
          &:not(:last-child) {
            @apply border-r-4 border-inherit;
          }
        }

        & > td {
          &:not(:last-child) {
            @apply border-r-4 border-inherit text-xs text-center;
          }
        }
      }
    }
  }
</style>
