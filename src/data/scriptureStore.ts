import { BIBLE_BOOKS, getBookById, getNextBook, getVerseCount } from './bibleData';
import { getAytChapterVerses, getAytVerseText } from './ayt/aytScripture';

export type Translation = 'WEB' | 'AYT';

export interface Verse {
  verseNumber: number;
  text: string;
}

export interface ChapterText {
  bookId: string;
  chapter: number;
  verses: Verse[];
}

export interface PassageResult {
  bookId: string;
  bookName: string;
  chapter: number;
  startVerse: number;
  endVerse: number;
  translation: Translation;
  fullText: string;
  verses: Verse[];
  /** False when no authentic text is bundled for the requested passage. */
  textAvailable: boolean;
  reference: string;
  isLastChapterInBook: boolean;
  isEndOfBible: boolean;
}

// Authentic World English Bible (WEB) text. WEB is public domain, so this excerpt is safe to
// bundle, but the bundled set covers only a handful of chapters and is intentionally partial.
const legacyWebScripture: Record<string, Record<number, Verse[]>> = {
  GEN: {
    1: [
      { verseNumber: 1, text: "In the beginning, God created the heavens and the earth." },
      { verseNumber: 2, text: "The earth was formless and empty. Darkness was on the surface of the deep and God’s Spirit was hovering over the surface of the waters." },
      { verseNumber: 3, text: "God said, “Let there be light,” and there was light." },
      { verseNumber: 4, text: "God saw the light, and saw that it was good. God divided the light from the darkness." },
      { verseNumber: 5, text: "God called the light “day”, and the darkness he called “night”. There was evening and there was morning, the first day." },
      { verseNumber: 6, text: "God said, “Let there be an expanse in the middle of the waters, and let it divide the waters from the waters.”" },
      { verseNumber: 7, text: "God made the expanse, and divided the waters which were under the expanse from the waters which were above the expanse; and it was so." },
      { verseNumber: 8, text: "God called the expanse “sky”. There was evening and there was morning, a second day." },
      { verseNumber: 9, text: "God said, “Let the waters under the sky be gathered together to one place, and let the dry land appear;” and it was so." },
      { verseNumber: 10, text: "God called the dry land “earth”, and the gathering together of the waters he called “seas”. God saw that it was good." },
      { verseNumber: 11, text: "God said, “Let the earth yield vegetation, herbs yielding seeds, and fruit trees bearing fruit after their kind, with their seeds in it, on the earth;” and it was so." },
      { verseNumber: 12, text: "The earth yielded vegetation, herbs yielding seed after their kind, and trees bearing fruit, with their seeds in it, after their kind; and God saw that it was good." },
      { verseNumber: 13, text: "There was evening and there was morning, a third day." },
      { verseNumber: 14, text: "God said, “Let there be lights in the expanse of sky to divide the day from the night; and let them be for signs to mark seasons, days, and years;" },
      { verseNumber: 15, text: "and let them be for lights in the expanse of sky to give light on the earth;” and it was so." },
      { verseNumber: 16, text: "God made the two great lights: the greater light to rule the day, and the lesser light to rule the night. He also made the stars." },
      { verseNumber: 17, text: "God set them in the expanse of sky to give light to the earth," },
      { verseNumber: 18, text: "and to rule over the day and over the night, and to divide the light from the darkness. God saw that it was good." },
      { verseNumber: 19, text: "There was evening and there was morning, a fourth day." },
      { verseNumber: 20, text: "God said, “Let the waters swarm with swarms of living creatures, and let birds fly above the earth in the open expanse of sky.”" },
      { verseNumber: 21, text: "God created the large sea creatures and every living creature that moves, with which the waters swarmed, after their kind, and every winged bird after its kind. God saw that it was good." },
      { verseNumber: 22, text: "God blessed them, saying, “Be fruitful, and multiply, and fill the waters in the seas, and let birds multiply on the earth.”" },
      { verseNumber: 23, text: "There was evening and there was morning, a fifth day." },
      { verseNumber: 24, text: "God said, “Let the earth produce living creatures after their kind, livestock, creeping things, and animals of the earth after their kind;” and it was so." },
      { verseNumber: 25, text: "God made the animals of the earth after their kind, and the livestock after their kind, and everything that creeps on the ground after its kind. God saw that it was good." },
      { verseNumber: 26, text: "God said, “Let’s make man in our image, after our likeness. Let them have dominion over the fish of the sea, and over the birds of the sky, and over the livestock, and over all the earth, and over every creeping thing that creeps on the earth.”" },
      { verseNumber: 27, text: "God created man in his own image. In God’s image he created him; male and female he created them." },
      { verseNumber: 28, text: "God blessed them. God said to them, “Be fruitful, multiply, fill the earth, and subdue it. Have dominion over the fish of the sea, over the birds of the sky, and over every living thing that moves on the earth.”" },
      { verseNumber: 29, text: "God said, “Behold, I have given you every herb yielding seed that is on the surface of all the earth, and every tree that bears fruit yielding seed. It will be food for you." },
      { verseNumber: 30, text: "To every animal of the earth, and to every bird of the sky, and to everything that creeps on the earth, in which there is life, I have given every green herb for food;” and it was so." },
      { verseNumber: 31, text: "God saw everything that he had made, and, behold, it was very good. There was evening and there was morning, a sixth day." }
    ],
    2: [
      { verseNumber: 1, text: "The heavens, the earth, and all their vast array were finished." },
      { verseNumber: 2, text: "On the seventh day God finished his work which he had made; and he rested on the seventh day from all his work which he had made." },
      { verseNumber: 3, text: "God blessed the seventh day, and made it holy, because he rested in it from all his work of creation which he had done." },
      { verseNumber: 4, text: "This is the history of the generations of the heavens and of the earth when they were created, in the day that the LORD God made the earth and the heavens." }
    ]
  },
  PSA: {
    1: [
      { verseNumber: 1, text: "Blessed is the man who doesn’t walk in the counsel of the wicked, nor stand in the way of sinners, nor sit in the seat of scoffers;" },
      { verseNumber: 2, text: "but his delight is in the LORD’s law. On his law he meditates day and night." },
      { verseNumber: 3, text: "He will be like a tree planted by the streams of water, that produces its fruit in its season, whose leaf also does not wither. Whatever he does shall prosper." },
      { verseNumber: 4, text: "The wicked are not so, but are like the chaff which the wind drives away." },
      { verseNumber: 5, text: "Therefore the wicked will not stand in the judgment, nor sinners in the congregation of the righteous." },
      { verseNumber: 6, text: "For the LORD knows the way of the righteous, but the way of the wicked shall perish." }
    ],
    23: [
      { verseNumber: 1, text: "The LORD is my shepherd: I shall lack nothing." },
      { verseNumber: 2, text: "He makes me lie down in green pastures. He leads me beside still waters." },
      { verseNumber: 3, text: "He restores my soul. He guides me in the paths of righteousness for his name’s sake." },
      { verseNumber: 4, text: "Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me. Your rod and your staff, they comfort me." },
      { verseNumber: 5, text: "You prepare a table before me in the presence of my enemies. You have anointed my head with oil. My cup runs over." },
      { verseNumber: 6, text: "Surely goodness and loving kindness shall follow me all the days of my life, and I will dwell in the LORD’s house forever." }
    ],
    119: [
      { verseNumber: 1, text: "Blessed are those whose ways are blameless, who walk according to the law of the LORD." },
      { verseNumber: 2, text: "Blessed are those who keep his statutes and seek him with all their heart—" },
      { verseNumber: 3, text: "they do no wrong but follow his ways." },
      { verseNumber: 4, text: "You have commanded your precepts to be fully obeyed." },
      { verseNumber: 5, text: "Oh, that my ways were steadfast in obeying your decrees!" },
      { verseNumber: 6, text: "Then I would not be put to shame when I consider all your commands." },
      { verseNumber: 7, text: "I will praise you with an upright heart as I learn your righteous laws." },
      { verseNumber: 8, text: "I will obey your decrees; do not utterly forsake me." },
      { verseNumber: 9, text: "How can a young person stay on the path of purity? By living according to your word." },
      { verseNumber: 10, text: "I seek you with all my heart; do not let me stray from your commands." },
      { verseNumber: 11, text: "I have hidden your word in my heart that I might not sin against you." },
      { verseNumber: 12, text: "Praise be to you, LORD; teach me your decrees." },
      { verseNumber: 13, text: "With my lips I recount all the laws that come from your mouth." },
      { verseNumber: 14, text: "I rejoice in following your statutes as one rejoices in great riches." },
      { verseNumber: 15, text: "I meditate on your precepts and consider your ways." },
      { verseNumber: 16, text: "I delight in your decrees; I will not neglect your word." }
    ]
  },
  PRO: {
    3: [
      { verseNumber: 1, text: "My son, don’t forget my teaching; but let your heart keep my commandments:" },
      { verseNumber: 2, text: "for length of days, and years of life, and peace, will they add to you." },
      { verseNumber: 3, text: "Don’t let kindness and truth forsake you. Bind them around your neck. Write them on the tablet of your heart." },
      { verseNumber: 4, text: "So you will find favor, and good repute in the sight of God and man." },
      { verseNumber: 5, text: "Trust in the LORD with all your heart, and don’t lean on your own understanding." },
      { verseNumber: 6, text: "In all your ways acknowledge him, and he will make your paths straight." },
      { verseNumber: 7, text: "Don’t be wise in your own eyes. Fear the LORD, and depart from evil." },
      { verseNumber: 8, text: "It will be health to your body, and nourishment to your bones." }
    ]
  },
  SNG: {
    1: [
      { verseNumber: 1, text: "The Song of songs, which is Solomon’s." },
      { verseNumber: 2, text: "Let him kiss me with the kisses of his mouth; for your love is better than wine." },
      { verseNumber: 3, text: "Your oils have a pleasing fragrance. Your name is oil poured out, therefore the virgins love you." },
      { verseNumber: 4, text: "Draw me, we will run after you! The king has brought me into his rooms. We will be glad and rejoice in you. We will praise your love more than wine! They are right to love you." },
      { verseNumber: 5, text: "I am dark, but lovely, you daughters of Jerusalem, like Kedar’s tents, like Solomon’s curtains." },
      { verseNumber: 6, text: "Don’t stare at me because I am dark, because the sun has scorched me. My mother’s sons were angry with me. They made me keeper of the vineyards. I haven’t kept my own vineyard." },
      { verseNumber: 7, text: "Tell me, you whom my soul loves, where you graze your flock, where you rest them at noon; for why should I be as one who is veiled beside the flocks of your companions?" },
      { verseNumber: 8, text: "If you don’t know, most beautiful among women, follow the tracks of the sheep. Graze your young goats beside the shepherds’ tents." },
      { verseNumber: 9, text: "I have compared you, my love, to a steed in Pharaoh’s chariots." },
      { verseNumber: 10, text: "Your cheeks are beautiful with earrings, your neck with strings of jewels." },
      { verseNumber: 11, text: "We will make you earrings of gold, with studs of silver." },
      { verseNumber: 12, text: "While the king sat at his table, my perfume spread its fragrance." },
      { verseNumber: 13, text: "My beloved is to me a sachet of myrrh that lies between my breasts." },
      { verseNumber: 14, text: "My beloved is to me a cluster of henna blossoms from the vineyards of En Gedi." },
      { verseNumber: 15, text: "Behold, you are beautiful, my love. Behold, you are beautiful. Your eyes are like doves." },
      { verseNumber: 16, text: "Behold, you are handsome, my beloved, yes, pleasant; and our couch is verdant." },
      { verseNumber: 17, text: "The beams of our house are cedars. Our rafters are firs." }
    ]
  },
  MAT: {
    5: [
      { verseNumber: 1, text: "Seeing the multitudes, he went up onto the mountain. When he had sat down, his disciples came to him." },
      { verseNumber: 2, text: "He opened his mouth and taught them, saying," },
      { verseNumber: 3, text: "“Blessed are the poor in spirit, for theirs is the Kingdom of Heaven." },
      { verseNumber: 4, text: "Blessed are those who mourn, for they shall be comforted." },
      { verseNumber: 5, text: "Blessed are the gentle, for they shall inherit the earth." },
      { verseNumber: 6, text: "Blessed are those who hunger and thirst after righteousness, for they shall be filled." },
      { verseNumber: 7, text: "Blessed are the merciful, for they shall obtain mercy." },
      { verseNumber: 8, text: "Blessed are the pure in heart, for they shall see God." },
      { verseNumber: 9, text: "Blessed are the peacemakers, for they shall be called children of God.”" }
    ],
    6: [
      { verseNumber: 9, text: "“Pray like this: ‘Our Father in heaven, may your name be kept holy." },
      { verseNumber: 10, text: "May your Kingdom come. May your will be done on earth as it is in heaven." },
      { verseNumber: 11, text: "Give us today our daily bread." },
      { verseNumber: 12, text: "Forgive us our debts, as we also forgive our debtors." },
      { verseNumber: 13, text: "Bring us not into temptation, but deliver us from the evil one. For yours is the Kingdom, the power, and the glory forever. Amen.’”" }
    ]
  },
  JHN: {
    1: [
      { verseNumber: 1, text: "In the beginning was the Word, and the Word was with God, and the Word was God." },
      { verseNumber: 2, text: "The same was in the beginning with God." },
      { verseNumber: 3, text: "All things were made through him. Without him, nothing was made that has been made." },
      { verseNumber: 4, text: "In him was life, and the life was the light of men." },
      { verseNumber: 5, text: "The light shines in the darkness, and the darkness hasn’t overcome it." }
    ],
    3: [
      { verseNumber: 16, text: "For God so loved the world, that he gave his one and only Son, that whoever believes in him should not perish, but have eternal life." },
      { verseNumber: 17, text: "For God didn’t send his Son into the world to judge the world, but that the world should be saved through him." },
      { verseNumber: 18, text: "He who believes in him is not judged. He who doesn’t believe has been judged already, because he has not believed in the name of the one and only Son of God." }
    ]
  },
  ROM: {
    8: [
      { verseNumber: 31, text: "What then shall we say about these things? If God is for us, who can be against us?" },
      { verseNumber: 35, text: "Who shall separate us from the love of Christ? Could oppression, or anguish, or persecution, or famine, or nakedness, or peril, or sword?" },
      { verseNumber: 37, text: "No, in all these things, we are more than conquerors through him who loved us." },
      { verseNumber: 38, text: "For I am persuaded that neither death, nor life, nor angels, nor principalities, nor things present, nor things to come, nor powers," },
      { verseNumber: 39, text: "nor height, nor depth, nor any other created thing, will be able to separate us from God’s love, which is in Christ Jesus our Lord." }
    ],
    12: [
      { verseNumber: 1, text: "Therefore I urge you, brothers, by the mercies of God, to present your bodies a living sacrifice, holy, acceptable to God, which is your spiritual service." },
      { verseNumber: 2, text: "Don’t be conformed to this world, but be transformed by the renewing of your mind, so that you may prove what is the good, well-pleasing, and perfect will of God." }
    ]
  },
  '1CO': {
    13: [
      { verseNumber: 1, text: "If I speak with the languages of men and of angels, but don’t have love, I have become sounding brass, or a clanging cymbal." },
      { verseNumber: 2, text: "If I have the gift of prophecy, and know all mysteries and all knowledge; and if I have all faith, so as to remove mountains, but don’t have love, I am nothing." },
      { verseNumber: 3, text: "If I give away all my goods to feed the poor, and if I give my body to be burned, but don’t have love, it profits me nothing." },
      { verseNumber: 4, text: "Love is patient and is kind. Love doesn’t envy. Love doesn’t brag, is not proud," },
      { verseNumber: 5, text: "doesn’t behave itself inappropriately, doesn’t seek its own way, is not provoked, takes no account of evil;" },
      { verseNumber: 6, text: "doesn’t rejoice in unrighteousness, but rejoices with the truth;" },
      { verseNumber: 7, text: "bears all things, believes all things, hopes all things, endures all things." },
      { verseNumber: 8, text: "Love never fails. But where there are prophecies, they will be done away with. Where there are languages, they will cease. Where there is knowledge, it will be done away with." },
      { verseNumber: 13, text: "But now faith, hope, and love remain—these three. The greatest of these is love." }
    ]
  },
  PHP: {
    4: [
      { verseNumber: 4, text: "Rejoice in the Lord always! Again I will say, Rejoice!" },
      { verseNumber: 5, text: "Let your gentleness be known to all men. The Lord is at hand." },
      { verseNumber: 6, text: "In nothing be anxious, but in everything, by prayer and petition with thanksgiving, let your requests be made known to God." },
      { verseNumber: 7, text: "And the peace of God, which surpasses all understanding, will guard your hearts and your thoughts in Christ Jesus." },
      { verseNumber: 8, text: "Finally, brothers, whatever things are true, whatever things are honorable, whatever things are just, whatever things are pure, whatever things are lovely, whatever things are of good report; if there is any virtue, and if there is any praise, think about these things." },
      { verseNumber: 13, text: "I can do all things through Christ, who strengthens me." }
    ]
  },
  JUD: {
    1: [
      { verseNumber: 1, text: "Jude, a servant of Jesus Christ, and brother of James, to those who are called, sanctified by God the Father, and kept for Jesus Christ:" },
      { verseNumber: 2, text: "Mercy to you, peace, and love be multiplied." },
      { verseNumber: 20, text: "But you, beloved, keep building up yourselves on your most holy faith, praying in the Holy Spirit." },
      { verseNumber: 21, text: "Keep yourselves in God’s love, looking for the mercy of our Lord Jesus Christ to eternal life." },
      { verseNumber: 24, text: "Now to him who is able to keep them from stumbling, and to present you faultless before the presence of his glory in great joy," },
      { verseNumber: 25, text: "to God our Savior, who alone is wise, be glory and majesty, dominion and power, both now and forever. Amen." }
    ]
  },
  REV: {
    1: [
      { verseNumber: 1, text: "This is the Revelation of Jesus Christ, which God gave him to show to his servants the things which must happen soon." },
      { verseNumber: 2, text: "who testified to God’s word, and of the testimony of Jesus Christ, about everything that he saw." },
      { verseNumber: 3, text: "Blessed is he who reads and those who hear the words of the prophecy, and keep the things that are written in it, for the time is at hand." },
      { verseNumber: 8, text: "“I am the Alpha and the Omega,” says the Lord God, “who is and who was and who is to come, the Almighty.”" }
    ],
    21: [
      { verseNumber: 1, text: "I saw a new heaven and a new earth: for the first heaven and the first earth have passed away, and the sea is no more." },
      { verseNumber: 2, text: "I saw the holy city, New Jerusalem, coming down out of heaven from God, prepared like a bride adorned for her husband." },
      { verseNumber: 3, text: "I heard a loud voice out of heaven saying, “Behold, God’s dwelling is with people, and he will dwell with them, and they will be his people, and God himself will be with them as their God." },
      { verseNumber: 4, text: "He will wipe away every tear from their eyes. Death will be no more; neither will there be mourning, nor crying, nor pain, any more. The first things have passed away.”" }
    ],
    22: [
      { verseNumber: 12, text: "“Behold, I come quickly. My reward is with me, to repay to each man according to his work." },
      { verseNumber: 13, text: "I am the Alpha and the Omega, the First and the Last, the Beginning and the End.”" },
      { verseNumber: 16, text: "“I, Jesus, have sent my angel to testify these things to you for the assemblies. I am the root and the offspring of David; the Bright and Morning Star.”" },
      { verseNumber: 17, text: "The Spirit and the bride say, “Come!” He who hears, let him say, “Come!” He who is thirsty, let him come. He who desires, let him take the water of life freely." },
      { verseNumber: 20, text: "He who testifies these things says, “Yes, I come quickly.” Amen! Yes, come, Lord Jesus." },
      { verseNumber: 21, text: "The grace of the Lord Jesus Christ be with all the saints. Amen." }
    ]
  }
};

/**
 * Message shown when a verse has no authentic bundled text.
 *
 * This replaced the former procedural generator, which fabricated scripture-shaped sentences for
 * any chapter that had no local text. Inventing scripture is never acceptable, so a missing verse
 * is now reported honestly and no substitute text is produced.
 */
export const UNAVAILABLE_TEXT_MESSAGE: Record<Translation, string> = {
  AYT: 'Teks AYT untuk ayat ini belum tersedia di aplikasi. Aplikasi tidak membuat atau mengganti teks Alkitab secara otomatis.',
  WEB: 'No authentic WEB text is bundled for this verse. The app does not generate or substitute scripture text.',
};

/**
 * Retrieves the authentic verses available for a chapter in the requested translation.
 *
 * AYT is complete (all 66 books, 31,102 verses), so an AYT chapter always resolves. WEB currently
 * bundles only a small authentic excerpt; chapters outside that excerpt return an empty array so
 * callers can report the text as unavailable instead of substituting anything.
 */
export function getChapterVerses(bookId: string, chapter: number, lang: Translation): Verse[] {
  const upperBookId = bookId.toUpperCase();

  if (lang === 'AYT') {
    const texts = getAytChapterVerses(upperBookId, chapter);
    if (!texts) return [];
    // Verse numbers are validated contiguous from 1, so the array index is the verse number.
    return texts.map((text, index) => ({ verseNumber: index + 1, text }));
  }

  const chapterStore = legacyWebScripture[upperBookId]?.[chapter];
  if (!chapterStore || chapterStore.length === 0) return [];
  return [...chapterStore].sort((a, b) => a.verseNumber - b.verseNumber);
}

/**
 * Loads a passage slice (e.g. from startVerse to endVerse, or whole chapter).
 */
export function getPassage(
  bookId: string,
  chapter: number,
  startVerse?: number,
  endVerse?: number,
  lang: Translation = 'WEB'
): PassageResult {
  const book = getBookById(bookId) || BIBLE_BOOKS[0];
  const allVerses = getChapterVerses(book.id, chapter, lang);

  // The whole chapter's real verse count, used only to decide whether a selection is the full
  // chapter. The selectable range is clamped separately, below.
  const expectedVerseCount = getVerseCount(book.id, chapter);
  const minVerse = allVerses[0]?.verseNumber ?? 1;
  // Clamp to the verses that actually have authentic text, so the reported range never
  // advertises verses the app cannot supply.
  const maxVerse = allVerses[allVerses.length - 1]?.verseNumber ?? expectedVerseCount;

  const start = Math.max(minVerse, Math.min(startVerse ?? minVerse, maxVerse));
  const end = Math.max(start, Math.min(endVerse ?? maxVerse, maxVerse));

  const selectedVerses = allVerses.filter(v => v.verseNumber >= start && v.verseNumber <= end);

  const fullText = selectedVerses.map(v => v.text).join(' ');
  const textAvailable = selectedVerses.length > 0;

  const bookName = lang === 'WEB' ? book.nameEn : book.nameId;
  const actualStart = selectedVerses[0]?.verseNumber ?? start;
  const actualEnd = selectedVerses[selectedVerses.length - 1]?.verseNumber ?? end;

  const isFullChapter = actualStart === 1 && actualEnd === expectedVerseCount;
  const reference = isFullChapter
    ? `${bookName} ${chapter}`
    : actualStart === actualEnd
    ? `${bookName} ${chapter}:${actualStart}`
    : `${bookName} ${chapter}:${actualStart}-${actualEnd}`;

  const isLastChapterInBook = chapter >= book.totalChapters;
  const isEndOfBible = isLastChapterInBook && book.order >= 66;

  return {
    bookId: book.id,
    bookName,
    chapter,
    startVerse: start,
    endVerse: end,
    translation: lang,
    fullText,
    verses: selectedVerses,
    textAvailable,
    reference,
    isLastChapterInBook,
    isEndOfBible,
  };
}

/**
 * Computes next unit location according to practice mode.
 */
export function getNextUnitLocation(
  mode: 'single' | 'book' | 'continuous',
  currentBookId: string,
  currentChapter: number
): { bookId: string; chapter: number; startVerse: number; hasNext: boolean } {
  if (mode === 'single') {
    return { bookId: currentBookId, chapter: currentChapter, startVerse: 1, hasNext: false };
  }

  const currentBook = getBookById(currentBookId);
  if (!currentBook) {
    return { bookId: 'GEN', chapter: 1, startVerse: 1, hasNext: false };
  }

  // Within the same book: go to next chapter
  if (currentChapter < currentBook.totalChapters) {
    return {
      bookId: currentBook.id,
      chapter: currentChapter + 1,
      startVerse: 1,
      hasNext: true,
    };
  }

  // At the end of the book:
  if (mode === 'book') {
    // Book mode ends when book is finished
    return { bookId: currentBook.id, chapter: currentChapter, startVerse: 1, hasNext: false };
  }

  // Continuous mode: proceed to the next book chapter 1
  const nextBook = getNextBook(currentBook.id);
  if (nextBook) {
    return {
      bookId: nextBook.id,
      chapter: 1,
      startVerse: 1,
      hasNext: true,
    };
  }

  // End of Revelation reached!
  return {
    bookId: currentBook.id,
    chapter: currentChapter,
    startVerse: 1,
    hasNext: false,
  };
}

export interface VerseResult {
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
  reference: string; // e.g. "Kidung Agung 1:1"
  text: string;
  translation: Translation;
  totalVersesInChapter: number;
  /** False when no authentic text is bundled for this verse. */
  textAvailable: boolean;
  isFirstVerseInChapter: boolean;
  isLastVerseInChapter: boolean;
  isFirstVerseInBook: boolean;
  isLastVerseInBook: boolean;
  isStartOfBible: boolean;
  isEndOfBible: boolean;
}

/**
 * Retrieves a single verse with exact reference and metadata.
 */
export function getVerse(
  bookId: string,
  chapter: number,
  verse: number,
  lang: Translation = 'WEB'
): VerseResult {
  const book = getBookById(bookId) || BIBLE_BOOKS[0];
  const clampedChapter = Math.max(1, Math.min(chapter, book.totalChapters));
  const totalVerses = getVerseCount(book.id, clampedChapter);
  const clampedVerse = Math.max(1, Math.min(verse, totalVerses));

  // AYT lookups hit the exact published verse. Never synthesise a substitute for a missing one.
  const authenticText =
    lang === 'AYT'
      ? getAytVerseText(book.id, clampedChapter, clampedVerse)
      : getChapterVerses(book.id, clampedChapter, lang).find(v => v.verseNumber === clampedVerse)?.text ??
        null;

  const textAvailable = authenticText !== null;
  const text = authenticText ?? UNAVAILABLE_TEXT_MESSAGE[lang];

  const bookName = lang === 'WEB' ? book.nameEn : book.nameId;
  const reference = `${bookName} ${clampedChapter}:${clampedVerse}`;

  const isFirstVerseInChapter = clampedVerse === 1;
  const isLastVerseInChapter = clampedVerse === totalVerses;
  const isFirstVerseInBook = clampedChapter === 1 && isFirstVerseInChapter;
  const isLastVerseInBook = clampedChapter === book.totalChapters && isLastVerseInChapter;
  const isStartOfBible = book.order === 1 && isFirstVerseInBook;
  const isEndOfBible = book.order === 66 && isLastVerseInBook;

  return {
    bookId: book.id,
    bookName,
    chapter: clampedChapter,
    verse: clampedVerse,
    reference,
    text,
    translation: lang,
    totalVersesInChapter: totalVerses,
    textAvailable,
    isFirstVerseInChapter,
    isLastVerseInChapter,
    isFirstVerseInBook,
    isLastVerseInBook,
    isStartOfBible,
    isEndOfBible,
  };
}

