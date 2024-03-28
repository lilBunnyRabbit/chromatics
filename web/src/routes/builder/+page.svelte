<script lang="ts">
  import { CMY, CMYK, HSI, HSL, HSV, HWB, Lab, RGB255, XYZ, YCbCr255 } from "@lib/models";
  import { randomNumber } from "@lib/utils";
  import { writable } from "svelte/store";
  import ColorEditor from "../../components/ColorEditor.svelte";
  import ColorInput from "../../components/ColorInput.svelte";

  console.log({ RGB255 });

  const initialColor = new RGB255(randomNumber(0, 255), randomNumber(0, 255), randomNumber(0, 255));

  $: base = initialColor.toRGB();

  $: rgb255 = initialColor.clone();
  $: cmy = initialColor.toCMY();
  $: cmyk = initialColor.toCMYK();
  $: hsi = initialColor.toHSI();
  $: hsl = initialColor.toHSL();
  $: hsv = initialColor.toHSV();
  $: hwb = initialColor.toHWB();
  $: xyz = initialColor.toXYZ();
  $: lab = initialColor.toXYZ().toLAB();
  $: ycrcb255 = initialColor.toYCbCr255();

  const active = writable<
    | typeof RGB255
    | typeof CMY
    | typeof CMYK
    | typeof HSI
    | typeof HSL
    | typeof HSV
    | typeof HWB
    | typeof XYZ
    | typeof Lab
    | typeof YCbCr255
  >(RGB255);

  function setActive(color: typeof $active) {
    return () => {
      active.set(color);
    };
  }

  function updateFromBase(exclude?: typeof $active) {
    if (exclude !== RGB255) rgb255 = base.toRGB255();
    if (exclude !== CMY) cmy = base.toCMY();
    if (exclude !== CMYK) cmyk = base.toCMYK();
    if (exclude !== HSI) hsi = base.toHSI();
    if (exclude !== HSL) hsl = base.toHSL();
    if (exclude !== HSV) hsv = base.toHSV();
    if (exclude !== HWB) hwb = base.toHWB();
    if (exclude !== XYZ) xyz = base.toXYZ();
    if (exclude !== Lab) lab = base.toLAB();
    if (exclude !== YCbCr255) ycrcb255 = base.toRGB255().toYCbCr255();
  }

  $: {
    const newBase = (() => {
      switch ($active) {
        case RGB255:
          return rgb255.toRGB();
        case CMY:
          return cmy.toRGB();
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
        case YCbCr255:
          return ycrcb255.toRGB255().toRGB();
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
      <div>{rgb255.toHex()}</div>
      <div class="text-xs text-right">{rgb255.toNumeric()}</div>
    </div>

    <div class="gap-6 grid grid-cols-[repeat(auto-fit,minmax(450px,1fr))] justify-start">
      <ColorEditor name="RGB 255" on:mousedown={setActive(RGB255)} color={rgb255.toString()}>
        <ColorInput
          name="Red"
          bind:value={rgb255.r}
          min="0"
          max="255"
          step="1"
          getColor={(i) => {
            const color = rgb255.clone();
            color.r = 255 * (i / 10);
            return color.toString();
          }}
        />
        <ColorInput
          name="Green"
          bind:value={rgb255.g}
          min="0"
          max="255"
          step="1"
          getColor={(i) => {
            const color = rgb255.clone();
            color.g = 255 * (i / 10);
            return color.toString();
          }}
        />
        <ColorInput
          name="Blue"
          bind:value={rgb255.b}
          min="0"
          max="255"
          step="1"
          getColor={(i) => {
            const color = rgb255.clone();
            color.b = 255 * (i / 10);
            return color.toString();
          }}
        />
      </ColorEditor>

      <ColorEditor name="CMY" on:mousedown={setActive(CMY)}>
        <ColorInput
          name="Cyan"
          bind:value={cmy.c}
          min="0"
          max="1"
          step="0.01"
          getColor={(i) => {
            const color = cmy.clone();
            color.c = i / 10;
            return color.toRGB().toString();
          }}
        />
        <ColorInput
          name="Magenta"
          bind:value={cmy.m}
          min="0"
          max="1"
          step="0.01"
          getColor={(i) => {
            const color = cmy.clone();
            color.m = i / 10;
            return color.toRGB().toString();
          }}
        />
        <ColorInput
          name="Yellow"
          bind:value={cmy.y}
          min="0"
          max="1"
          step="0.01"
          getColor={(i) => {
            const color = cmy.clone();
            color.y = i / 10;
            return color.toRGB().toString();
          }}
        />
      </ColorEditor>

      <ColorEditor name="CMYK" on:mousedown={setActive(CMYK)}>
        <ColorInput
          name="Cyan"
          bind:value={cmyk.c}
          min="0"
          max="1"
          step="0.01"
          getColor={(i) => {
            const color = cmyk.clone();
            color.c = i / 10;
            return color.toRGB().toString();
          }}
        />
        <ColorInput
          name="Magenta"
          bind:value={cmyk.m}
          min="0"
          max="1"
          step="0.01"
          getColor={(i) => {
            const color = cmyk.clone();
            color.m = i / 10;
            return color.toRGB().toString();
          }}
        />
        <ColorInput
          name="Yellow"
          bind:value={cmyk.y}
          min="0"
          max="1"
          step="0.01"
          getColor={(i) => {
            const color = cmyk.clone();
            color.y = i / 10;
            return color.toRGB().toString();
          }}
        />
        <ColorInput
          name="Black"
          bind:value={cmyk.k}
          min="0"
          max="1"
          step="0.01"
          getColor={(i) => {
            const color = cmyk.clone();
            color.k = i / 10;
            return color.toRGB().toString();
          }}
        />
      </ColorEditor>

      <ColorEditor name="HSI" on:mousedown={setActive(HSI)}>
        <ColorInput
          name="Hue"
          bind:value={hsi.h}
          min="0"
          max="360"
          step="0.01"
          getColor={(i) => {
            const color = hsi.clone();
            color.h = 360 * (i / 10);
            return color.toHSL().toString();
          }}
        />
        <ColorInput
          name="Saturation"
          bind:value={hsi.s}
          min="0"
          max="1"
          step="0.01"
          getColor={(i) => {
            const color = hsi.clone();
            color.s = i / 10;
            return color.toHSL().toString();
          }}
        />
        <ColorInput
          name="Intensity"
          bind:value={hsi.i}
          min="0"
          max="1"
          step="0.01"
          getColor={(i) => {
            const color = hsi.clone();
            color.i = i / 10;
            return color.toHSL().toString();
          }}
        />
      </ColorEditor>

      <ColorEditor name="HSL" on:mousedown={setActive(HSL)} color={hsl.toString()}>
        <ColorInput
          name="Hue"
          bind:value={hsl.h}
          min="0"
          max="360"
          step="0.01"
          getColor={(i) => {
            const color = hsl.clone();
            color.h = 360 * (i / 10);
            return color.toString();
          }}
        />

        <ColorInput
          name="Saturation"
          bind:value={hsl.s}
          min="0"
          max="1"
          step="0.01"
          getColor={(i) => {
            const color = hsl.clone();
            color.s = i / 10;
            return color.toString();
          }}
        />
        <ColorInput
          name="Luminosity"
          bind:value={hsl.l}
          min="0"
          max="1"
          step="0.01"
          getColor={(i) => {
            const color = hsl.clone();
            color.l = i / 10;
            return color.toString();
          }}
        />
      </ColorEditor>

      <ColorEditor name="HSV" on:mousedown={setActive(HSV)} color={hsv.toHSL().toString()}>
        <ColorInput
          name="Hue"
          bind:value={hsv.h}
          min="0"
          max="360"
          step="0.01"
          getColor={(i) => {
            const color = hsv.clone();
            color.h = 360 * (i / 10);
            return color.toHSL().toString();
          }}
        />
        <ColorInput
          name="Saturation"
          bind:value={hsv.s}
          min="0"
          max="1"
          step="0.01"
          getColor={(i) => {
            const color = hsv.clone();
            color.s = i / 10;
            return color.toHSL().toString();
          }}
        />
        <ColorInput
          name="Value"
          bind:value={hsv.v}
          min="0"
          max="1"
          step="0.01"
          getColor={(i) => {
            const color = hsv.clone();
            color.v = i / 10;
            return color.toHSL().toString();
          }}
        />
      </ColorEditor>

      <ColorEditor name="HWB" on:mousedown={setActive(HWB)} color={hwb.toString()}>
        <ColorInput
          name="Hue"
          bind:value={hwb.h}
          min="0"
          max="360"
          step="0.01"
          getColor={(i) => {
            const color = hwb.clone();
            color.h = 360 * (i / 10);
            return color.toHSL().toString();
          }}
        />
        <ColorInput
          name="Whiteness"
          bind:value={hwb.w}
          min="0"
          max="1"
          step="0.01"
          getColor={(i) => {
            const color = hwb.clone();
            color.w = i / 10;
            return color.toHSL().toString();
          }}
        />
        <ColorInput
          name="Blackness"
          bind:value={hwb.b}
          min="0"
          max="1"
          step="0.01"
          getColor={(i) => {
            const color = hwb.clone();
            color.b = i / 10;
            return color.toHSL().toString();
          }}
        />
      </ColorEditor>

      <ColorEditor name="XYZ (D65)" on:mousedown={setActive(XYZ)} color={xyz.toString("D65")}>
        <ColorInput
          name="X"
          bind:value={xyz.x}
          min="0"
          max="95"
          step="0.01"
          getColor={(i) => {
            const color = xyz.clone();
            color.x = 95 * (i / 10);
            return color.toString("D65");
          }}
        />
        <ColorInput
          name="Y"
          bind:value={xyz.y}
          min="0"
          max="100"
          step="0.01"
          getColor={(i) => {
            const color = xyz.clone();
            color.y = 100 * (i / 10);
            return color.toString("D65");
          }}
        />
        <ColorInput
          name="Z"
          bind:value={xyz.z}
          min="0"
          max="108"
          step="0.01"
          getColor={(i) => {
            const color = xyz.clone();
            color.z = 108 * (i / 10);
            return color.toString("D65");
          }}
        />
      </ColorEditor>

      <ColorEditor name="CIE Lab (D65)" on:mousedown={setActive(Lab)} color={lab.toString()}>
        <ColorInput
          name="Lightness"
          bind:value={lab.l}
          min="0"
          max="100"
          step="0.01"
          getColor={(i) => {
            const color = lab.clone();
            color.l = 100 * (i / 10);
            return color.toString();
          }}
        />
        <ColorInput
          name="Green-Red"
          bind:value={lab.a}
          min="-128"
          max="127"
          step="0.01"
          getColor={(i) => {
            const color = lab.clone();
            color.a = 256 * (i / 10) - 128;
            return color.toString();
          }}
        />
        <ColorInput
          name="Blue-Yellow"
          bind:value={lab.b}
          min="-128"
          max="127"
          step="0.01"
          getColor={(i) => {
            const color = lab.clone();
            color.b = 256 * (i / 10) - 128;
            return color.toString();
          }}
        />
      </ColorEditor>

      <ColorEditor name="YCrCb 255" on:mousedown={setActive(YCbCr255)} color={rgb255.toString()}>
        <ColorInput
          name="Luma"
          bind:value={ycrcb255.y}
          min="0"
          max="255"
          step="1"
          getColor={(i) => {
            const color = ycrcb255.clone();
            color.y = 255 * (i / 10);
            return color.toRGB255().toString();
          }}
        />
        <ColorInput
          name="Blue Difference"
          bind:value={ycrcb255.cb}
          min="0"
          max="255"
          step="1"
          getColor={(i) => {
            const color = ycrcb255.clone();
            color.cb = 255 * (i / 10);
            return color.toRGB255().toString();
          }}
        />
        <ColorInput
          name="Red Difference"
          bind:value={ycrcb255.cr}
          min="0"
          max="255"
          step="1"
          getColor={(i) => {
            const color = ycrcb255.clone();
            color.cr = 255 * (i / 10);
            return color.toRGB255().toString();
          }}
        />
      </ColorEditor>
    </div>
  </div>

  <div class="fixed top-[1.5px] left-0 right-0 text-center text-red-500 text-sm font-black tracking-[.75rem]">WIP</div>
</div>
