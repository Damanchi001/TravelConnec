const { transformSync } = require('@babel/core');

// Custom Metro transformer to handle import.meta
module.exports = {
  process(src, filename) {
    // Replace import.meta with our polyfill
    const transformedSrc = src.replace(
      /import\.meta/g,
      'require("./import-meta-polyfill.js").default || require("./import-meta-polyfill.js")'
    );

    return {
      code: transformedSrc,
      map: null,
    };
  },
};