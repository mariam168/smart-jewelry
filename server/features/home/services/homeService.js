import HeroSection from "../models/HeroSection.js";

const emptyLocalized = {
  en: "",
  ar: "",
};

const createEmptySlide = () => ({
  eyebrow: { ...emptyLocalized },
  titlePart1: { ...emptyLocalized },
  titlePart2: { ...emptyLocalized },
  description: { ...emptyLocalized },
  cta: { ...emptyLocalized },
  image: "",
  imageAlt: { ...emptyLocalized },
  badge: {
    nfc: { ...emptyLocalized },
    subtext: { ...emptyLocalized },
  },
  features: {
    design: {
      title: { ...emptyLocalized },
      desc: { ...emptyLocalized },
    },
    memories: {
      title: { ...emptyLocalized },
      desc: { ...emptyLocalized },
    },
    nfc: {
      title: { ...emptyLocalized },
      desc: { ...emptyLocalized },
    },
  },
  isActive: true,
});

const defaultHeroSection = {
  slides: [
    {
      eyebrow: {
        en: "SMART JEWELRY",
        ar: "مجوهرات ذكية",
      },

      titlePart1: {
        en: "Carry Your",
        ar: "احملي",
      },

      titlePart2: {
        en: "Memories",
        ar: "ذكرياتك",
      },

      description: {
        en: "Turn every beautiful moment into a memory you can carry with you. Discover smart jewelry designed to connect you with what matters most.",
        ar: "حوّلي كل لحظة جميلة إلى ذكرى تحملينها معك. اكتشفي مجوهرات ذكية صُممت لتربطك بأجمل ما يهمك.",
      },

      cta: {
        en: "Explore Collection",
        ar: "اكتشفي المجموعة",
      },

      image: "",

      imageAlt: {
        en: "JEVORYA smart jewelry",
        ar: "مجوهرات جيفوريا الذكية",
      },

      badge: {
        nfc: {
          en: "NFC",
          ar: "NFC",
        },

        subtext: {
          en: "TAP TO DISCOVER",
          ar: "اضغطي للاكتشاف",
        },
      },

      features: {
        design: {
          title: {
            en: "Elegant Design",
            ar: "تصميم أنيق",
          },

          desc: {
            en: "Jewelry designed to become part of your story.",
            ar: "مجوهرات مصممة لتصبح جزءًا من قصتك.",
          },
        },

        memories: {
          title: {
            en: "Your Memories",
            ar: "ذكرياتك",
          },

          desc: {
            en: "Keep your most meaningful moments close to you.",
            ar: "احتفظي بأجمل لحظاتك بالقرب منك دائمًا.",
          },
        },

        nfc: {
          title: {
            en: "Smart NFC",
            ar: "تقنية NFC الذكية",
          },

          desc: {
            en: "Connect your jewelry to your digital experience.",
            ar: "اربطي مجوهراتك بتجربتك الرقمية.",
          },
        },
      },

      isActive: true,
    },
  ],

  isActive: true,
};

const normalizeSlide = (slide = {}) => {
  const empty = createEmptySlide();

  return {
    ...empty,
    ...slide,

    eyebrow: {
      ...empty.eyebrow,
      ...(slide.eyebrow || {}),
    },

    titlePart1: {
      ...empty.titlePart1,
      ...(slide.titlePart1 || {}),
    },

    titlePart2: {
      ...empty.titlePart2,
      ...(slide.titlePart2 || {}),
    },

    description: {
      ...empty.description,
      ...(slide.description || {}),
    },

    cta: {
      ...empty.cta,
      ...(slide.cta || {}),
    },

    imageAlt: {
      ...empty.imageAlt,
      ...(slide.imageAlt || {}),
    },

    badge: {
      nfc: {
        ...empty.badge.nfc,
        ...(slide.badge?.nfc || {}),
      },

      subtext: {
        ...empty.badge.subtext,
        ...(slide.badge?.subtext || {}),
      },
    },

    features: {
      design: {
        title: {
          ...empty.features.design.title,
          ...(slide.features?.design?.title || {}),
        },

        desc: {
          ...empty.features.design.desc,
          ...(slide.features?.design?.desc || {}),
        },
      },

      memories: {
        title: {
          ...empty.features.memories.title,
          ...(slide.features?.memories?.title || {}),
        },

        desc: {
          ...empty.features.memories.desc,
          ...(slide.features?.memories?.desc || {}),
        },
      },

      nfc: {
        title: {
          ...empty.features.nfc.title,
          ...(slide.features?.nfc?.title || {}),
        },

        desc: {
          ...empty.features.nfc.desc,
          ...(slide.features?.nfc?.desc || {}),
        },
      },
    },

    isActive:
      slide.isActive === undefined
        ? true
        : slide.isActive,
  };
};

const getLegacySlide = (hero) => ({
  eyebrow: hero.eyebrow || emptyLocalized,

  titlePart1:
    hero.titlePart1 || emptyLocalized,

  titlePart2:
    hero.titlePart2 || emptyLocalized,

  description:
    hero.description || emptyLocalized,

  cta:
    hero.cta || emptyLocalized,

  image:
    hero.image || "",

  imageAlt:
    hero.imageAlt || emptyLocalized,

  badge:
    hero.badge || {
      nfc: emptyLocalized,
      subtext: emptyLocalized,
    },

  features:
    hero.features || {
      design: {
        title: emptyLocalized,
        desc: emptyLocalized,
      },

      memories: {
        title: emptyLocalized,
        desc: emptyLocalized,
      },

      nfc: {
        title: emptyLocalized,
        desc: emptyLocalized,
      },
    },

  isActive: true,
});

export const getHeroSection = async () => {
  let hero = await HeroSection.findOne({
    isActive: true,
  });

  if (!hero) {
    hero = await HeroSection.create(
      defaultHeroSection,
    );
  }

  if (
    !Array.isArray(hero.slides) ||
    hero.slides.length === 0
  ) {
    const hasLegacyData =
      hero.image ||
      hero.titlePart1 ||
      hero.titlePart2 ||
      hero.description;

    const legacySlide = hasLegacyData
      ? getLegacySlide(hero)
      : defaultHeroSection.slides[0];

    hero.slides = [
      normalizeSlide(legacySlide),
    ];

    await hero.save();
  }

  const result = hero.toObject();

  result.slides = result.slides
    .filter(
      (slide) =>
        slide.isActive !== false,
    )
    .map(normalizeSlide);

  if (result.slides.length === 0) {
    result.slides = [
      normalizeSlide(
        defaultHeroSection.slides[0],
      ),
    ];
  }

  return result;
};

export const updateHeroSection = async (
  data,
) => {
  const slides = Array.isArray(data?.slides)
    ? data.slides
        .map(normalizeSlide)
        .filter(
          (slide) =>
            slide.isActive !== false,
        )
    : [];

  const finalSlides =
    slides.length > 0
      ? slides
      : [
          normalizeSlide(
            defaultHeroSection.slides[0],
          ),
        ];

  const hero =
    await HeroSection.findOneAndUpdate(
      {},
      {
        $set: {
          slides: finalSlides,
          isActive: true,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    ).lean();

  hero.slides = hero.slides
    .filter(
      (slide) =>
        slide.isActive !== false,
    )
    .map(normalizeSlide);

  return hero;
};