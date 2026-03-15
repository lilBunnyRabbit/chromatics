export type Constructor<T, Args extends any[] = any[]> = new (...args: Args) => T;

// export abstract class ColorModel2 {
//   static ref: Symbol;

//   protected static conversions: Map<Symbol, (model: ColorModel) => ColorModel>;

//   static from(model: ColorModel) {
//     // @ts-expect-error - ref is a static property
//     return this.conversions.get(model.constructor.ref)(model);
//   }

//   public to(model: ColorModelConstructor) {
//     return model.from(this);
//   }

//   abstract clone(): this;
//   abstract toString(...args: unknown[]): string;
// }

export type ColorModelInstance<T extends ColorModel | ColorModelConstructor> = T extends ColorModelConstructor<infer U>
  ? U
  : T extends ColorModel
  ? T
  : never;

export interface ColorModel {
  clone(): this;
  toString(...args: unknown[]): string;
}

export interface ColorModelConstructor<T extends ColorModel = ColorModel> {
  ref: symbol;
  from(model: ColorModel): T;
  new (...args: any[]): T;
}
