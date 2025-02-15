import { CMY, Lab, RGB, XYZ } from "../models";
import { ConversionRegistry } from "./conversion-registry";
import "./conversions";

console.log(ConversionRegistry.getRegistry());

// ConversionRegistry.register(RGB, CMY, (rgb, janez: string) => {
//   return new CMY(1 - rgb.r, 1 - rgb.g, 1 - rgb.b);
// });

// const conversion = ConversionRegistry.getConversion(RGB, CMY);

// console.log({ conversion });

// // const converter = new Converter();

// const rgb = new RGB(0.5, 0.35, 0.8);
// const cmy = rgb.toCMY();
// const cmy2 = conversion!(rgb);
// // const cmy3 = converter.convert(CMY, [rgb])[0];

// console.log({ rgb, cmy, cmy2 });

// const a = ConversionRegistry.getConversion(RGB, CMY);
// const b = ConversionRegistry.getConversion(XYZ, Lab);
// const c = ConversionRegistry.getConversion(RGB, XYZ);
