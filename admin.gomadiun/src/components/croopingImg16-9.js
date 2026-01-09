export const getCroppedImg16_9 = async (imageSrc, croppedArea) => {
    const image = new Image();
    image.src = imageSrc;
    
    return new Promise((resolve, reject) => {
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
  
        const aspectRatio = 3 / 4;
        const width = croppedArea.width;
        const height = croppedArea.width / aspectRatio;
  
        canvas.width = width;
        canvas.height = height;
  
        ctx.drawImage(
          image,
          croppedArea.x,
          croppedArea.y,
          croppedArea.width,
          croppedArea.height,
          0,
          0,
          width,
          height
        );
  
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }
          const fileUrl = URL.createObjectURL(blob);
          resolve(fileUrl);
        }, 'image/jpeg');
      };
  
      image.onerror = (error) => {
        reject(new Error('Failed to load the image'));
      };
    });
  };
  