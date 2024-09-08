export const getImageSrc = (src) => {
    return `${process.env.PUBLIC_URL}${src}`;
};

export const getImageSrc2 = (folder, imageName) => {
    return `${process.env.PUBLIC_URL}/img/${folder}/${imageName}`;
};
  