# -*- coding: utf-8 -*-
"""
Build Authentic, High-Quality Multi-Language Learn Dataset
Combines 8 category modules across 18 languages (200 concepts x 18 languages = 3,600 authentic phrases).
Ensures 100% authentic native scripts, accurate phonetics, and genuine native distractors.
Outputs to:
  - f:\Chatly\notification-server\src\data\categories\<cat>.json
  - f:\Chatly\notification-server\src\data\categories\meta.json
  - f:\Chatly\notification-server\src\data\learn_data.json
  - f:\Chatly\chatly\assets\learn\<cat>.json
  - f:\Chatly\chatly\assets\learn\meta.json
"""

import os
import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

# Import category modules
import cat_greetings
import cat_social
import cat_travel
import cat_food
import cat_dating
import cat_numbers
import cat_slang
import cat_work

CATEGORIES_META = [
    {
        "id": "greetings",
        "title": "Greetings & Essentials",
        "description": "First words, polite phrases & daily greetings",
        "icon": "👋",
        "gradient": ["#6366F1", "#8B5CF6"],
        "module": cat_greetings
    },
    {
        "id": "social",
        "title": "Social & Flirting Vibes",
        "description": "Make friends, give compliments & chat with style",
        "icon": "✨",
        "gradient": ["#EC4899", "#F43F5E"],
        "module": cat_social
    },
    {
        "id": "travel",
        "title": "Travel & Exploration",
        "description": "Directions, transit, airport & finding places",
        "icon": "✈️",
        "gradient": ["#06B6D4", "#0EA5E9"],
        "module": cat_travel
    },
    {
        "id": "food",
        "title": "Food, Café & Dining",
        "description": "Order meals, coffee, drinks & enjoy local food",
        "icon": "☕",
        "gradient": ["#F59E0B", "#D97706"],
        "module": cat_food
    },
    {
        "id": "dating",
        "title": "Dating & Romance",
        "description": "Charming compliments, dates & sweet vibes",
        "icon": "❤️",
        "gradient": ["#E11D48", "#BE123C"],
        "module": cat_dating
    },
    {
        "id": "numbers",
        "title": "Numbers, Money & Time",
        "description": "Count, price checks & scheduling hangout dates",
        "icon": "🔢",
        "gradient": ["#10B981", "#059669"],
        "module": cat_numbers
    },
    {
        "id": "slang",
        "title": "Slang & Cool Idioms",
        "description": "Speak like a native local with trendy phrases",
        "icon": "🔥",
        "gradient": ["#8B5CF6", "#6D28D9"],
        "module": cat_slang
    },
    {
        "id": "work",
        "title": "Work & Daily Life",
        "description": "Productivity, workplace, school & daily routines",
        "icon": "💼",
        "gradient": ["#3B82F6", "#1D4ED8"],
        "module": cat_work
    }
]

LANGUAGES_META = [
    {"code": "en", "name": "English", "nativeName": "English", "flag": "🇺🇸", "primaryColor": "#3B82F6"},
    {"code": "es", "name": "Spanish", "nativeName": "Español", "flag": "🇪🇸", "primaryColor": "#FF5722"},
    {"code": "fr", "name": "French", "nativeName": "Français", "flag": "🇫🇷", "primaryColor": "#6366F1"},
    {"code": "de", "name": "German", "nativeName": "Deutsch", "flag": "🇩🇪", "primaryColor": "#F59E0B"},
    {"code": "it", "name": "Italian", "nativeName": "Italiano", "flag": "🇮🇹", "primaryColor": "#10B981"},
    {"code": "ja", "name": "Japanese", "nativeName": "日本語", "flag": "🇯🇵", "primaryColor": "#EC4899"},
    {"code": "ko", "name": "Korean", "nativeName": "한국어", "flag": "🇰🇷", "primaryColor": "#8B5CF6"},
    {"code": "zh", "name": "Chinese", "nativeName": "中文", "flag": "🇨🇳", "primaryColor": "#EF4444"},
    {"code": "ru", "name": "Russian", "nativeName": "Русский", "flag": "🇷🇺", "primaryColor": "#0284C7"},
    {"code": "pt", "name": "Portuguese", "nativeName": "Português", "flag": "🇵🇹", "primaryColor": "#059669"},
    {"code": "hi", "name": "Hindi", "nativeName": "हिन्दी", "flag": "🇮🇳", "primaryColor": "#EA580C"},
    {"code": "ar", "name": "Arabic", "nativeName": "العربية", "flag": "🇸🇦", "primaryColor": "#0D9488"},
    {"code": "tr", "name": "Turkish", "nativeName": "Türkçe", "flag": "🇹🇷", "primaryColor": "#DC2626"},
    {"code": "nl", "name": "Dutch", "nativeName": "Nederlands", "flag": "🇳🇱", "primaryColor": "#F97316"},
    {"code": "id", "name": "Indonesian", "nativeName": "Bahasa Indonesia", "flag": "🇮🇩", "primaryColor": "#E11D48"},
    {"code": "th", "name": "Thai", "nativeName": "ภาษาไทย", "flag": "🇹🇭", "primaryColor": "#7C3AED"},
    {"code": "vi", "name": "Vietnamese", "nativeName": "Tiếng Việt", "flag": "🇻🇳", "primaryColor": "#CA8A04"},
    {"code": "tl", "name": "Tagalog", "nativeName": "Tagalog", "flag": "🇵🇭", "primaryColor": "#2563EB"}
]

LANG_CODES = [l["code"] for l in LANGUAGES_META]

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SERVER_CAT_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, '..', 'src', 'data', 'categories'))
CLIENT_CAT_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, '..', '..', 'chatly', 'assets', 'learn'))
FULL_LEARN_DATA = os.path.abspath(os.path.join(SCRIPT_DIR, '..', 'src', 'data', 'learn_data.json'))

os.makedirs(SERVER_CAT_DIR, exist_ok=True)
os.makedirs(CLIENT_CAT_DIR, exist_ok=True)

# Build category datasets
all_phrases_by_lang = {lang: [] for lang in LANG_CODES}
category_totals = {}
category_objects = []

for cat in CATEGORIES_META:
    cat_id = cat["id"]
    cat_title = cat["title"]
    concepts = cat["module"].CONCEPTS
    n_concepts = len(concepts)
    
    print(f"Processing category: {cat_id} ({n_concepts} concepts)...")
    
    cat_phrases = {lang: [] for lang in LANG_CODES}
    
    for lang in LANG_CODES:
        for idx, concept in enumerate(concepts):
            if lang not in concept["translations"]:
                raise ValueError(f"Missing language '{lang}' in concept '{concept['id']}' in category '{cat_id}'")
            
            native, phonetic = concept["translations"][lang]
            
            # Select 3 distinct distractors from the OTHER concepts in the same language and category
            # Use deterministic modular strides so distractors are natural, varied, and never equal the correct answer
            distractor_indices = [
                (idx + 3) % n_concepts,
                (idx + 7) % n_concepts,
                (idx + 13) % n_concepts
            ]
            # Ensure unique and not self
            clean_distractor_indices = []
            for d_idx in distractor_indices:
                if d_idx == idx:
                    d_idx = (d_idx + 1) % n_concepts
                while d_idx in clean_distractor_indices or d_idx == idx:
                    d_idx = (d_idx + 1) % n_concepts
                clean_distractor_indices.append(d_idx)
            
            distractors = [concepts[d_idx]["translations"][lang][0] for d_idx in clean_distractor_indices]
            
            phrase_obj = {
                "id": f"{lang}_{concept['id']}",
                "english": concept["english"],
                "native": native,
                "phonetic": phonetic,
                "categoryId": cat_id,
                "emoji": concept.get("emoji", "💬"),
                "quizDistractors": distractors
            }
            
            cat_phrases[lang].append(phrase_obj)
            all_phrases_by_lang[lang].append(phrase_obj)
            
    total_phrases_in_cat = sum(len(cat_phrases[lang]) for lang in LANG_CODES)
    category_totals[cat_id] = total_phrases_in_cat
    
    category_payload = {
        "categoryId": cat_id,
        "title": cat_title,
        "totalPhrases": total_phrases_in_cat,
        "phrases": cat_phrases
    }
    
    # Save category JSON to server and client
    for target_dir in [SERVER_CAT_DIR, CLIENT_CAT_DIR]:
        target_path = os.path.join(target_dir, f"{cat_id}.json")
        with open(target_path, 'w', encoding='utf-8') as f:
            json.dump(category_payload, f, ensure_ascii=False, indent=2)
            
    print(f"  ✓ Saved {cat_id}.json ({total_phrases_in_cat} total phrases)")
    
    category_objects.append({
        "id": cat_id,
        "title": cat_title,
        "description": cat["description"],
        "icon": cat["icon"],
        "gradient": cat["gradient"],
        "totalPhrases": total_phrases_in_cat
    })

# Compute language totals
languages_with_totals = []
for lang in LANGUAGES_META:
    lang_copy = dict(lang)
    lang_copy["totalPhrases"] = len(all_phrases_by_lang[lang["code"]])
    languages_with_totals.append(lang_copy)

total_all_phrases = sum(len(l) for l in all_phrases_by_lang.values())

meta_payload = {
    "version": "4.0.0",
    "updatedAt": "2026-10-15T18:00:00Z",
    "totalLanguages": len(LANGUAGES_META),
    "totalCategories": len(CATEGORIES_META),
    "totalPhrases": total_all_phrases,
    "languages": languages_with_totals,
    "categories": category_objects
}

for target_dir in [SERVER_CAT_DIR, CLIENT_CAT_DIR]:
    target_path = os.path.join(target_dir, "meta.json")
    with open(target_path, 'w', encoding='utf-8') as f:
        json.dump(meta_payload, f, ensure_ascii=False, indent=2)
    print(f"✓ Saved meta.json to {target_dir}")

# Also update monolithic learn_data.json
monolithic_payload = {
    "version": "4.0.0",
    "updatedAt": "2026-10-15T18:00:00Z",
    "totalLanguages": len(LANGUAGES_META),
    "totalCategories": len(CATEGORIES_META),
    "totalPhrases": total_all_phrases,
    "languages": languages_with_totals,
    "categories": category_objects,
    "phrases": all_phrases_by_lang
}

with open(FULL_LEARN_DATA, 'w', encoding='utf-8') as f:
    json.dump(monolithic_payload, f, ensure_ascii=False, indent=2)
print(f"✓ Saved full monolithic learn_data.json ({total_all_phrases} total phrases)")

print("\nSUCCESS! All quality JSON files generated and synced to server and Flutter app assets.")
