import HeroSection from "../models/HeroSection.js";

const defaultHeroSection = {
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
};

export const getHeroSection = async () => {
  let hero = await HeroSection.findOne({
    isActive: true,
  }).lean();

  if (!hero) {
    hero = await HeroSection.create(
      defaultHeroSection,
    );

    hero = hero.toObject();
  }

  return hero;
};

export const updateHeroSection = async (data) => {
  const hero = await HeroSection.findOneAndUpdate(
    {},
    {
      $set: {
        ...data,
        isActive: true,
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  ).lean();

  return hero;
};