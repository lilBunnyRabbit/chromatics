import { ImageFile, useImageFileClipboard } from "@/helpers/image-file";
import { RGB255 } from "@lilbunnyrabbit/chromatics";
import React from "react";

export default function ImageRoute() {
  const [imageFile, setImageFile] = React.useState<ImageFile>();

  const ref = React.useRef<HTMLCanvasElement>(null);
  useImageFileClipboard((images) => setImageFile(images[0]));

  React.useEffect(() => {
    if (!imageFile || !ref.current) return;

    const canvas = ref.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    console.log({ imageFile });

    const { image } = imageFile;

    canvas.width = image.width;
    canvas.height = image.height;

    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const rgb255 = new RGB255(data[i], data[i + 1], data[i + 2], data[i + 3]);

      // const hsi = rgb255.to.RGB().to.HWB();
      const hsi = rgb255.to.YCbCr255();

      // hsi.cb = 0;

      // const rgb = hsi.to.RGB255();

      // data[i] = rgb.r;
      // data[i + 1] = rgb.g;
      // data[i + 2] = rgb.b;
      // data[i + 3] = rgb.a;

      // const value = 255 - Math.round((hsi.w + hsi.b) * 255);
      // const value = 255 -((hsi.cb + hsi.cr)/2);

      data[i] = 0;
      data[i + 1] = hsi.y;
      data[i + 2] = 0;
      data[i + 3] = rgb255.a;
    }
    ctx.putImageData(imageData, 0, 0);
  }, [imageFile]);

  return (
    <div className="p-6">
      <canvas ref={ref} />
    </div>
  );
}
