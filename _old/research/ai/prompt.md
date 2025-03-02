I am building a typescript color library. The library consists of color models (with specific operations) that extend typed arrays, conversion between models and model parsing.

Example of RGB255 model:

```ts
export interface ColorModel {
  clone(): this;
  equals(comparator: unknown): boolean;
  toString(...args: unknown[]): string;
}

export type Constructor<T, Args extends any[] = any[]> = new (...args: Args) => T;

class RGB255Base extends Uint8ClampedArray {
  public get r() {
    return this[0];
  }

  public set r(r: number) {
    this[0] = r;
  }

  public get g() {
    return this[1];
  }

  public set g(g: number) {
    this[1] = g;
  }

  public get b() {
    return this[2];
  }

  public set b(b: number) {
    this[2] = b;
  }

  public get a() {
    return this[3];
  }

  public set a(a: number) {
    this[3] = a;
  }

  /**
   * @param r - [0, 255]
   * @param g - [0, 255]
   * @param b - [0, 255]
   * @param a - [0, 255]
   */
  constructor(r: number, g: number, b: number, a: number = 255) {
    super(4);

    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  public clone(): this {
    return new (this.constructor as Constructor<this>)(this.r, this.g, this.b, this.a);
  }

  public equals(comparator: unknown): boolean {
    if (!comparator || !(comparator instanceof RGB255Base)) {
      return false;
    }

    return this.every((v, i) => comparator[i] === v);
  }

  public toString() {
    return `rgba(${this.r}, ${this.g}, ${this.b}, ${round(this.a / 255, 2)})`;
  }
}

export class RGB255 extends RGB255Base implements ColorModel {
  public invert() {
    return new RGB255(255 - this.r, 255 - this.g, 255 - this.b, this.a);
  }
}
```

Folder structure:

src/
└── models/
    ├── rgb/
    │   └── rgb255/
    │       ├── index.ts
    │       ├── rgb255.model.ts
    │       ├── rgb255.converter.ts
    │       └── rgb255.parser.ts
...

This is my research: