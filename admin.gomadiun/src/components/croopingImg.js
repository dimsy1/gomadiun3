
export const getCroppedImg = async (imageSrc, croppedArea) => {
  const image = new Image();
  image.src = imageSrc;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = croppedArea.width;
  canvas.height = croppedArea.height;

  ctx.drawImage(
      image,
      croppedArea.x,
      croppedArea.y,
      croppedArea.width,
      croppedArea.height,
      0,
      0,
      croppedArea.width,
      croppedArea.height
  );

  return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
          if (!blob) {
              reject(new Error('Canvas is empty'));
              return;
          }
          const fileUrl = URL.createObjectURL(blob);
          resolve(fileUrl);
      }, 'image/jpeg');
  });
};



