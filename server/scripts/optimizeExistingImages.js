import "dotenv/config";

import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import sharp from "sharp";

import Product from "../features/catalog/models/Product.js";
import ProductImage from "../features/catalog/models/ProductImage.js";
import Category from "../features/catalog/models/Category.js";
import HeroSection from "../features/home/models/HeroSection.js";

const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  process.env.DATABASE_URL;

const UPLOADS_DIR = path.resolve(
  process.cwd(),
  "uploads",
);

// TEMPORARILY ENABLED FOR THE MIGRATION
const APPLY_MODE = true;

const IMAGE_CONFIGS = {
  hero: {
    width: 1920,
    height: 700,
    quality: 82,
  },

  category: {
    width: 800,
    height: 800,
    quality: 82,
  },

  product: {
    width: 1200,
    height: 1500,
    quality: 82,
  },
};

const SUPPORTED_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
];

const getRelativeUploadPath = (imagePath) => {
  if (!imagePath) {
    return "";
  }

  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("data:") ||
    imagePath.startsWith("blob:")
  ) {
    return "";
  }

  return imagePath
    .replace(/^\/+/, "")
    .replace(/^uploads\/+/i, "");
};

const getAbsoluteImagePath = (imagePath) => {
  const relativePath =
    getRelativeUploadPath(imagePath);

  if (!relativePath) {
    return "";
  }

  return path.join(
    UPLOADS_DIR,
    relativePath,
  );
};

const getWebpPath = (absolutePath) => {
  const extension =
    path.extname(absolutePath);

  return `${absolutePath.slice(
    0,
    -extension.length,
  )}.webp`;
};

const isSupportedImage = (absolutePath) => {
  const extension =
    path.extname(
      absolutePath,
    ).toLowerCase();

  return SUPPORTED_EXTENSIONS.includes(
    extension,
  );
};

const isAlreadyOptimized = (imagePath) => {
  return (
    path
      .extname(imagePath)
      .toLowerCase() === ".webp"
  );
};

const formatBytes = (bytes) => {
  if (!Number.isFinite(bytes)) {
    return "0 B";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(2)} MB`;
};

const getPercentSaved = (
  originalSize,
  newSize,
) => {
  if (!originalSize) {
    return 0;
  }

  return Math.max(
    0,
    Math.round(
      ((originalSize - newSize) /
        originalSize) *
        100,
    ),
  );
};

const addReference = (
  references,
  imagePath,
  type,
) => {
  if (!imagePath) {
    return;
  }

  const relativePath =
    getRelativeUploadPath(
      imagePath,
    );

  if (!relativePath) {
    return;
  }

  if (!isSupportedImage(relativePath)) {
    return;
  }

  if (isAlreadyOptimized(relativePath)) {
    return;
  }

  if (!references.has(relativePath)) {
    references.set(
      relativePath,
      new Set(),
    );
  }

  references
    .get(relativePath)
    .add(type);
};

const collectReferences =
  async () => {
    const references =
      new Map();

    console.log(
      "\nCollecting image references...\n",
    );

    /*
     * -------------------------
     * PRODUCTS
     * -------------------------
     */

    const products =
      await Product.find(
        {
          $or: [
            {
              image: {
                $nin: [
                  "",
                  null,
                ],
              },
            },
            {
              primaryImage: {
                $nin: [
                  "",
                  null,
                ],
              },
            },
            {
              images: {
                $exists: true,
                $ne: [],
              },
            },
          ],
        },
        {
          image: 1,
          primaryImage: 1,
          images: 1,
        },
      ).lean();

    for (const product of products) {
      addReference(
        references,
        product.image,
        "product",
      );

      addReference(
        references,
        product.primaryImage,
        "product",
      );

      for (const image of
        product.images || []) {
        addReference(
          references,
          image,
          "product",
        );
      }
    }

    /*
     * -------------------------
     * PRODUCT IMAGES
     * -------------------------
     */

    const productImages =
      await ProductImage.find(
        {
          imageUrl: {
            $nin: [
              "",
              null,
            ],
          },
        },
        {
          imageUrl: 1,
        },
      ).lean();

    for (const productImage of
      productImages) {
      addReference(
        references,
        productImage.imageUrl,
        "product",
      );
    }

    /*
     * -------------------------
     * CATEGORIES
     * -------------------------
     */

    const categories =
      await Category.find(
        {
          image: {
            $nin: [
              "",
              null,
            ],
          },
        },
        {
          image: 1,
        },
      ).lean();

    for (const category of categories) {
      addReference(
        references,
        category.image,
        "category",
      );
    }

    /*
     * -------------------------
     * HERO
     * -------------------------
     */

    const heroSections =
      await HeroSection.find(
        {},
        {
          image: 1,
          "slides.image": 1,
        },
      ).lean();

    for (const hero of
      heroSections) {
      addReference(
        references,
        hero.image,
        "hero",
      );

      for (const slide of
        hero.slides || []) {
        addReference(
          references,
          slide.image,
          "hero",
        );
      }
    }

    return references;
  };

const detectImageType = (
  types,
) => {
  const uniqueTypes =
    Array.from(types);

  if (
    uniqueTypes.length === 1
  ) {
    return uniqueTypes[0];
  }

  /*
   * If the same physical image is
   * used in different areas, we don't
   * automatically crop it differently.
   *
   * This protects the original image
   * from being replaced incorrectly.
   */

  return null;
};

const createOptimizedImage = async (
  sourcePath,
  destinationPath,
  config,
) => {
  await sharp(sourcePath)
    .rotate()
    .resize(
      config.width,
      config.height,
      {
        fit: "inside",
        withoutEnlargement: true,
      },
    )
    .webp({
      quality: config.quality,
      effort: 5,
    })
    .toFile(destinationPath);
};

const replaceReferences = async (
  oldRelativePath,
  newRelativePath,
) => {
  let updatedCount = 0;

  const oldPaths = [
    oldRelativePath,
    `/${oldRelativePath}`,
  ];

  const newPath =
    `/${newRelativePath}`;

  /*
   * -------------------------
   * PRODUCT
   * -------------------------
   *
   * We intentionally use find()
   * + save() instead of an update
   * pipeline.
   *
   * This avoids:
   *
   * "Cannot pass an array to query
   * updates unless the updatePipeline
   * option is set."
   */

  const products =
    await Product.find({
      $or: [
        {
          image: {
            $in: oldPaths,
          },
        },
        {
          primaryImage: {
            $in: oldPaths,
          },
        },
        {
          images: {
            $in: oldPaths,
          },
        },
      ],
    });

  for (const product of products) {
    let changed = false;

    if (
      oldPaths.includes(
        product.image,
      )
    ) {
      product.image = newPath;
      changed = true;
    }

    if (
      oldPaths.includes(
        product.primaryImage,
      )
    ) {
      product.primaryImage = newPath;
      changed = true;
    }

    if (Array.isArray(product.images)) {
      const updatedImages =
        product.images.map(
          (image) => {
            if (
              oldPaths.includes(
                image,
              )
            ) {
              changed = true;
              return newPath;
            }

            return image;
          },
        );

      product.images =
        updatedImages;
    }

    if (changed) {
      await product.save();
      updatedCount += 1;
    }
  }

  /*
   * -------------------------
   * PRODUCT IMAGE
   * -------------------------
   */

  const productImages =
    await ProductImage.find({
      imageUrl: {
        $in: oldPaths,
      },
    });

  for (const productImage of
    productImages) {
    productImage.imageUrl =
      newPath;

    await productImage.save();

    updatedCount += 1;
  }

  /*
   * -------------------------
   * CATEGORY
   * -------------------------
   */

  const categories =
    await Category.find({
      image: {
        $in: oldPaths,
      },
    });

  for (const category of categories) {
    category.image = newPath;

    await category.save();

    updatedCount += 1;
  }

  /*
   * -------------------------
   * HERO
   * -------------------------
   *
   * Hero images are inside
   * slides, so we update each
   * matching slide.
   */

  const heroSections =
    await HeroSection.find({
      $or: [
        {
          image: {
            $in: oldPaths,
          },
        },
        {
          "slides.image": {
            $in: oldPaths,
          },
        },
      ],
    });

  for (const hero of
    heroSections) {
    let changed = false;

    if (
      oldPaths.includes(
        hero.image,
      )
    ) {
      hero.image = newPath;
      changed = true;
    }

    for (const slide of
      hero.slides || []) {
      if (
        oldPaths.includes(
          slide.image,
        )
      ) {
        slide.image = newPath;
        changed = true;
      }
    }

    if (changed) {
      await hero.save();
      updatedCount += 1;
    }
  }

  return updatedCount;
};

const optimizeImage = async (
  relativePath,
  types,
) => {
  const type =
    detectImageType(types);

  if (!type) {
    console.log(
      `⚠️  SKIPPED - image is used as multiple types: ${relativePath}`,
    );

    console.log(
      `   Types: ${Array.from(types).join(
        ", ",
      )}`,
    );

    return {
      status: "skipped",
    };
  }

  const config =
    IMAGE_CONFIGS[type];

  if (!config) {
    return {
      status: "skipped",
    };
  }

  const sourcePath =
    getAbsoluteImagePath(
      relativePath,
    );

  if (!sourcePath) {
    return {
      status: "missing",
    };
  }

  if (
    !fs.existsSync(sourcePath)
  ) {
    console.log(
      `⚠️  FILE NOT FOUND: ${relativePath}`,
    );

    return {
      status: "missing",
    };
  }

  const destinationPath =
    getWebpPath(
      sourcePath,
    );

  const destinationRelativePath =
    path
      .relative(
        UPLOADS_DIR,
        destinationPath,
      )
      .replaceAll(
        path.sep,
        "/",
      );

  if (
    fs.existsSync(
      destinationPath,
    )
  ) {
    console.log(
      `⚠️  WEBP ALREADY EXISTS: ${destinationRelativePath}`,
    );

    return {
      status: "exists",
    };
  }

  const originalStats =
    fs.statSync(sourcePath);

  console.log(
    `\n${type.toUpperCase()}`,
  );

  console.log(
    `Original: ${relativePath}`,
  );

  console.log(
    `Size: ${formatBytes(
      originalStats.size,
    )}`,
  );

  console.log(
    `Target: ${config.width}x${config.height} WebP`,
  );

  if (!APPLY_MODE) {
    console.log(
      "DRY RUN - no changes made.",
    );

    return {
      status: "dry-run",
    };
  }

  try {
    /*
     * -------------------------
     * CREATE WEBP
     * -------------------------
     */

    await createOptimizedImage(
      sourcePath,
      destinationPath,
      config,
    );

    const optimizedStats =
      fs.statSync(
        destinationPath,
      );

    console.log(
      `Optimized: ${formatBytes(
        optimizedStats.size,
      )}`,
    );

    console.log(
      `Saved: ${getPercentSaved(
        originalStats.size,
        optimizedStats.size,
      )}%`,
    );

    /*
     * -------------------------
     * UPDATE DATABASE
     * -------------------------
     */

    const updatedReferences =
      await replaceReferences(
        relativePath,
        destinationRelativePath,
      );

    console.log(
      `DB references updated: ${updatedReferences}`,
    );

    /*
     * -------------------------
     * DELETE ORIGINAL
     * -------------------------
     *
     * The original is deleted ONLY
     * after:
     *
     * 1. WebP was created
     * 2. DB references were updated
     */

    fs.unlinkSync(
      sourcePath,
    );

    console.log(
      `✅ Original deleted: ${relativePath}`,
    );

    console.log(
      `✅ New image: /${destinationRelativePath}`,
    );

    return {
      status: "optimized",
      originalSize:
        originalStats.size,
      optimizedSize:
        optimizedStats.size,
    };
  } catch (error) {
    /*
     * If anything fails:
     *
     * - Keep original image
     * - Delete incomplete WebP
     */

    if (
      fs.existsSync(
        destinationPath,
      )
    ) {
      try {
        fs.unlinkSync(
          destinationPath,
        );
      } catch {
        // Ignore cleanup error.
      }
    }

    console.error(
      `❌ Failed: ${relativePath}`,
    );

    console.error(
      error.message,
    );

    return {
      status: "failed",
    };
  }
};

const main = async () => {
  if (!MONGO_URI) {
    throw new Error(
      "MongoDB connection string was not found. Expected MONGO_URI, MONGODB_URI, or DATABASE_URL.",
    );
  }

  if (
    !fs.existsSync(
      UPLOADS_DIR,
    )
  ) {
    throw new Error(
      `Uploads directory not found: ${UPLOADS_DIR}`,
    );
  }

  console.log(
    "\n========================================",
  );

  console.log(
    " JEVORYA Existing Images Optimizer",
  );

  console.log(
    "========================================\n",
  );

  console.log(
    `Mode: ${
      APPLY_MODE
        ? "APPLY"
        : "DRY RUN"
    }`,
  );

  console.log(
    `Uploads: ${UPLOADS_DIR}`,
  );

  console.log(
    `Hero: 1920x700 WebP`,
  );

  console.log(
    `Category: 800x800 WebP`,
  );

  console.log(
    `Product: 1200x1500 WebP`,
  );

  await mongoose.connect(
    MONGO_URI,
  );

  console.log(
    "\nMongoDB connected.\n",
  );

  try {
    const references =
      await collectReferences();

    console.log(
      `Found ${references.size} old image reference(s).\n`,
    );

    if (!references.size) {
      console.log(
        "Nothing to optimize.",
      );

      return;
    }

    const stats = {
      optimized: 0,
      dryRun: 0,
      skipped: 0,
      missing: 0,
      exists: 0,
      failed: 0,
    };

    for (const [
      relativePath,
      types,
    ] of references.entries()) {
      const result =
        await optimizeImage(
          relativePath,
          types,
        );

      const statKey =
        result.status ===
        "dry-run"
          ? "dryRun"
          : result.status;

      stats[statKey] += 1;
    }

    console.log(
      "\n========================================",
    );

    console.log(
      " Finished",
    );

    console.log(
      "========================================",
    );

    console.log(
      `Optimized: ${stats.optimized}`,
    );

    console.log(
      `Dry Run: ${stats.dryRun}`,
    );

    console.log(
      `Skipped: ${stats.skipped}`,
    );

    console.log(
      `Missing: ${stats.missing}`,
    );

    console.log(
      `Already Exists: ${stats.exists}`,
    );

    console.log(
      `Failed: ${stats.failed}`,
    );

    console.log(
      "========================================\n",
    );

    if (!APPLY_MODE) {
      console.log(
        "This was a DRY RUN.",
      );

      console.log(
        "No database records or files were changed.",
      );

      console.log(
        "Run with --apply when you are ready.\n",
      );
    }
  } finally {
    await mongoose.disconnect();
  }
};

main().catch((error) => {
  console.error(
    "\n❌ Image optimization failed:",
  );

  console.error(
    error,
  );

  process.exit(1);
});