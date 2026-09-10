import React, { createContext, useContext, useState } from 'react';

export type SupportedLanguage = 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'bn';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
];

export const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    home: 'Home',
    howItWorks: 'How It Works',
    awareness: 'Awareness',
    safety: 'Safety',
    news: 'News',
    about: 'About',
    signIn: 'Sign In',
    seller: 'Seller (Source)',
    collector: 'Collector Logistics',
    disposer: 'Disposer (Recycler)',
    recycleBtn: 'Recycle E-Waste',
    scanAiBtn: 'Scan with AI',
    compareBids: 'Compare Bids',
    viewCert: 'Green Certificate',
    heroTag: "India's traceable e-waste circular ecosystem",
    heroTitle: 'Give electronics a second life.',
    heroSubtitle:
      'Re-Circuit connects Sellers, Collectors and Authorized Disposers through a transparent, audited e-waste recovery chain.',
  },
  hi: {
    home: 'होम',
    howItWorks: 'यह कैसे काम करता है',
    awareness: 'जागरूकता',
    safety: 'सुरक्षा',
    news: 'समाचार',
    about: 'हमारे बारे में',
    signIn: 'साइन इन करें',
    seller: 'विक्रेता (स्रोत)',
    collector: 'संग्राहक (कलेक्टर)',
    disposer: 'निपटानकर्ता (रिसाइकलर)',
    recycleBtn: 'ई-कचरा रीसायकल करें',
    scanAiBtn: 'AI से स्कैन करें',
    compareBids: 'बोलियों की तुलना करें',
    viewCert: 'हरित प्रमाणपत्र',
    heroTag: 'भारत का पारदर्शी ई-कचरा परिपत्र पारिस्थितिकी तंत्र',
    heroTitle: 'इलेक्ट्रॉनिक्स को नया जीवन दें।',
    heroSubtitle:
      'री-सर्किट विक्रेताओं, संग्राहकों और अधिकृत निपटानकर्ताओं को पारदर्शी, ऑडिटेड रिकवरी श्रृंखला के माध्यम से जोड़ता है।',
  },
  ta: {
    home: 'முகப்பு',
    howItWorks: 'எவ்வாறு செயல்படுகிறது',
    awareness: 'விழிப்புணர்வு',
    safety: 'பாதுகாப்பு',
    news: 'செய்திகள்',
    about: 'எங்களை பற்றி',
    signIn: 'உள்நுழைக',
    seller: 'விற்பனையாளர் (மூலம்)',
    collector: 'சேகரிப்பாளர்',
    disposer: 'மறுசுழற்சியாளர்',
    recycleBtn: 'மின்னணு கழிவை மறுசுழற்சி செய்க',
    scanAiBtn: 'AI மூலம் ஸ்கேன் செய்க',
    compareBids: 'ஏலங்களை ஒப்பிடுக',
    viewCert: 'பசுமை சான்றிதழ்',
    heroTag: 'இந்தியாவின் வெளிப்படையான மின்னணு கழிவு சுற்றுச்சூழல்',
    heroTitle: 'மின்னணு பொருட்களுக்கு மறுவாழ்வு அளியுங்கள்.',
    heroSubtitle:
      'ரீ-சர்க்யூட் விற்பனையாளர்கள், சேகரிப்பாளர்கள் மற்றும் அங்கீகரிக்கப்பட்ட மறுசுழற்சியாளர்களை இணைக்கிறது.',
  },
  te: {
    home: 'హోమ్',
    howItWorks: 'ఇది ఎలా పనిచేస్తుంది',
    awareness: 'అవగాహన',
    safety: 'భద్రత',
    news: 'వార్తలు',
    about: 'గురించి',
    signIn: 'సైన్ ఇన్',
    seller: 'విక్రేత (మూలం)',
    collector: 'సేకరణదారుడు',
    disposer: 'రీసైక్లర్ (డిస్పోజర్)',
    recycleBtn: 'ఈ-వ్యర్థాలను రీసైకిల్ చేయండి',
    scanAiBtn: 'AI తో స్కాన్ చేయండి',
    compareBids: 'బిడ్లను సరిపోల్చండి',
    viewCert: 'గ్రీన్ సర్టిఫికేట్',
    heroTag: 'భారతదేశ పారదర్శక ఈ-వ్యర్థాల పర్యావరణ వ్యవస్థ',
    heroTitle: 'ఎలక్ట్రానిక్స్ కు రెండవ జీవితాన్ని ఇవ్వండి.',
    heroSubtitle:
      'రీ-సర్క్యూట్ విక్రేతలు, సేకరణదారులు మరియు అధీకృత రీసైక్లర్లను కలుపుతుంది.',
  },
  kn: {
    home: 'ಮುಖಪುಟ',
    howItWorks: 'ಇದು ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ',
    awareness: 'ಜಾಗೃತಿ',
    safety: 'ಸುರಕ್ಷತೆ',
    news: 'ಸುದ್ದಿ',
    about: 'ನಮ್ಮ ಬಗ್ಗೆ',
    signIn: 'ಸೈನ್ ಇನ್',
    seller: 'ಮಾರಾಟಗಾರ (ಮೂಲ)',
    collector: 'ಸಂಗ್ರಾಹಕ',
    disposer: 'ಮರುಬಳಕೆದಾರ (ಡಿಸ್ಪೋಸರ್)',
    recycleBtn: 'ಇ-ತ್ಯಾಜ್ಯ ಮರುಬಳಕೆ ಮಾಡಿ',
    scanAiBtn: 'AI ನೊಂದಿಗೆ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
    compareBids: 'ಬಿಡ್‌ಗಳನ್ನು ಹೋಲಿಕೆ ಮಾಡಿ',
    viewCert: 'ಹಸಿರು ಪ್ರಮಾಣಪತ್ರ',
    heroTag: 'ಭಾರತದ ಪಾರದರ್ಶಕ ಇ-ತ್ಯಾಜ್ಯ ಪರಿಸರ ವ್ಯವಸ್ಥೆ',
    heroTitle: 'ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್‌ಗೆ ಎರಡನೇ ಜೀವನ ನೀಡಿ.',
    heroSubtitle:
      'ರೀ-ಸರ್ಕ್ಯೂಟ್ ಮಾರಾಟಗಾರರು, ಸಂಗ್ರಾಹಕರು ಮತ್ತು ಅಧಿಕೃತ ಮರುಬಳಕೆದಾರರನ್ನು ಸಂಪರ್ಕಿಸುತ್ತದೆ.',
  },
  bn: {
    home: 'হোম',
    howItWorks: 'এটি কীভাবে কাজ করে',
    awareness: 'সচেতনতা',
    safety: 'নিরাপত্তা',
    news: 'সংবাদ',
    about: 'আমাদের সম্পর্কে',
    signIn: 'সাইন ইন করুন',
    seller: 'বিক্রেতা (উৎস)',
    collector: 'সংগ্রাহক (কালেক্টর)',
    disposer: 'পুনর্ব্যবহারকারী (ডিসপোজার)',
    recycleBtn: 'ই-বর্জ্য পুনর্ব্যবহার করুন',
    scanAiBtn: 'AI দিয়ে স্ক্যান করুন',
    compareBids: 'দরপত্র তুলনা করুন',
    viewCert: 'সবুজ সার্টিফিকেট',
    heroTag: 'ভারতের স্বচ্ছ ই-বর্জ্য চক্রাকার বাস্তুতন্ত্র',
    heroTitle: 'ইলেকট্রনিক্সকে দ্বিতীয় জীবন দিন।',
    heroSubtitle:
      'রি-সার্কিট বিক্রেতা, সংগ্রাহক এবং অনুমোদিত পুনর্ব্যবহারকারীদের মধ্যে স্বচ্ছ সংযোগ স্থাপন করে।',
  },
};

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const stored = localStorage.getItem('rc_selected_language');
      if (stored && ['en', 'hi', 'ta', 'te', 'kn', 'bn'].includes(stored)) {
        return stored as SupportedLanguage;
      }
    } catch {
      // fallback
    }
    return 'en';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('rc_selected_language', lang);
    } catch {
      // ignore
    }
  };

  const t = (key: string): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
