const fs = require('fs');
const path = require('path');

// 18 Supported Languages
const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', primaryColor: '#3B82F6' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', primaryColor: '#FF5722' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', primaryColor: '#6366F1' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', primaryColor: '#F59E0B' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', primaryColor: '#10B981' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', primaryColor: '#EC4899' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', primaryColor: '#8B5CF6' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', primaryColor: '#EF4444' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', primaryColor: '#0284C7' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', primaryColor: '#059669' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', primaryColor: '#EA580C' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', primaryColor: '#0D9488' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', primaryColor: '#DC2626' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', primaryColor: '#F97316' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', primaryColor: '#E11D48' },
  { code: 'th', name: 'Thai', nativeName: 'ภาษาไทย', flag: '🇹🇭', primaryColor: '#7C3AED' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', primaryColor: '#CA8A04' },
  { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog', flag: '🇵🇭', primaryColor: '#2563EB' }
];

// 8 Categories
const categories = [
  {
    id: 'greetings',
    title: 'Greetings & Essentials',
    description: 'First words, polite phrases & daily greetings',
    icon: '👋',
    gradient: ['#6366F1', '#8B5CF6']
  },
  {
    id: 'social',
    title: 'Social & Flirting Vibes',
    description: 'Make friends, give compliments & chat with style',
    icon: '✨',
    gradient: ['#EC4899', '#F43F5E']
  },
  {
    id: 'travel',
    title: 'Travel & Exploration',
    description: 'Directions, transit, airport & finding places',
    icon: '✈️',
    gradient: ['#06B6D4', '#0EA5E9']
  },
  {
    id: 'food',
    title: 'Food, Café & Dining',
    description: 'Order meals, coffee, drinks & enjoy local food',
    icon: '☕',
    gradient: ['#F59E0B', '#D97706']
  },
  {
    id: 'dating',
    title: 'Dating & Romance',
    description: 'Charming compliments, dates & sweet vibes',
    icon: '❤️',
    gradient: ['#E11D48', '#BE123C']
  },
  {
    id: 'numbers',
    title: 'Numbers, Money & Time',
    description: 'Count, price checks & scheduling hangout dates',
    icon: '🔢',
    gradient: ['#10B981', '#059669']
  },
  {
    id: 'slang',
    title: 'Slang & Cool Idioms',
    description: 'Speak like a native local with trendy phrases',
    icon: '🔥',
    gradient: ['#8B5CF6', '#6D28D9']
  },
  {
    id: 'work',
    title: 'Work & Daily Life',
    description: 'Productivity, workplace, school & daily routines',
    icon: '💼',
    gradient: ['#3B82F6', '#1D4ED8']
  }
];

// Phrase blueprint builder
// We create 90 core semantic templates for each of the 8 categories = 720 base concepts
// Each concept has specific translations for all 18 languages.
console.log('Building phrase generator...');
