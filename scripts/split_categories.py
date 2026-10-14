# -*- coding: utf-8 -*-
"""
Splits monolithic learn_data.json into lightweight category-specific JSON files
and a tiny metadata file for on-demand runtime loading and caching.
"""

import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'learn_data.json')
SERVER_CAT_DIR = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'categories')
CLIENT_CAT_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'chatly', 'assets', 'learn')

os.makedirs(SERVER_CAT_DIR, exist_ok=True)
os.makedirs(CLIENT_CAT_DIR, exist_ok=True)

with open(DATA_PATH, 'r', encoding='utf-8') as f:
    full_data = json.load(f)

languages = full_data['languages']
categories = full_data['categories']
phrases = full_data['phrases']

# Compute category counts and organize phrases by category
by_category = {c['id']: {lang['code']: [] for lang in languages} for c in categories}
category_totals = {c['id']: 0 for c in categories}

for lang_code, phrase_list in phrases.items():
    for p in phrase_list:
        cat_id = p.get('categoryId', 'greetings')
        if cat_id in by_category:
            by_category[cat_id][lang_code].append(p)
            category_totals[cat_id] += 1

# Enrich categories metadata with phrase counts
for c in categories:
    c['totalPhrases'] = category_totals.get(c['id'], 0)

meta_data = {
    "version": "3.2.0",
    "updatedAt": "2026-10-13T18:05:00Z",
    "totalLanguages": len(languages),
    "totalCategories": len(categories),
    "totalPhrases": full_data.get('totalPhrases', 18594),
    "languages": languages,
    "categories": categories
}

# 1. Write meta.json
for out_dir in [SERVER_CAT_DIR, CLIENT_CAT_DIR]:
    meta_file = os.path.join(out_dir, 'meta.json')
    with open(meta_file, 'w', encoding='utf-8') as f:
        json.dump(meta_data, f, ensure_ascii=False, indent=2)
    print(f"Wrote meta.json to {meta_file} ({os.path.getsize(meta_file)} bytes)")

# 2. Write individual category JSON files
for c in categories:
    cat_id = c['id']
    cat_payload = {
        "categoryId": cat_id,
        "title": c['title'],
        "totalPhrases": category_totals[cat_id],
        "phrases": by_category[cat_id]
    }
    for out_dir in [SERVER_CAT_DIR, CLIENT_CAT_DIR]:
        cat_file = os.path.join(out_dir, f"{cat_id}.json")
        with open(cat_file, 'w', encoding='utf-8') as f:
            json.dump(cat_payload, f, ensure_ascii=False, indent=2)
        print(f"Wrote {cat_id}.json to {out_dir} ({os.path.getsize(cat_file)} bytes, {category_totals[cat_id]} phrases)")

print("\nDone splitting categories! All files created successfully.")
