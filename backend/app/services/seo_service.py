from typing import List


def generate_seo_keywords(
    product_name: str,
    category_name: str,
    description: str = "",
) -> List[str]:
    """Auto-generate SEO keywords from product name, category, and description.
    
    Generates relevant keywords for Pakistani clothing e-commerce.
    """
    keywords = set()

    # Clean and split product name
    name_lower = product_name.lower().strip()
    keywords.add(name_lower)

    # Add category
    cat_lower = category_name.lower().strip()
    keywords.add(cat_lower)

    # Combine product + category
    keywords.add(f"{name_lower} {cat_lower}")

    # Common Pakistani clothing terms mapping
    clothing_terms = {
        "kurta": ["kurta", "men's kurta", "cotton kurta", "casual kurta", "pakistani kurta"],
        "shalwar": ["shalwar kameez", "shalwar suit", "pakistani shalwar"],
        "kameez": ["kameez", "shalwar kameez", "pakistani kameez"],
        "waistcoat": ["waistcoat", "men's waistcoat", "formal waistcoat", "pakistani waistcoat"],
        "shawl": ["shawl", "winter shawl", "pashmina shawl", "wool shawl"],
        "dupatta": ["dupatta", "chiffon dupatta", "embroidered dupatta"],
        "suit": ["suit", "ladies suit", "stitched suit", "unstitched suit"],
        "jacket": ["jacket", "winter jacket", "casual jacket"],
        "trouser": ["trouser", "cotton trouser", "men's trouser"],
    }

    # Match and add related keywords
    for term, related in clothing_terms.items():
        if term in name_lower or term in cat_lower or term in description.lower():
            keywords.update(related)

    # Add "pakistani clothing" and "online shopping" variants
    keywords.add("pakistani clothing")
    keywords.add("online shopping pakistan")
    keywords.add("hamid cloth house")

    # Gender-specific keywords
    if "men" in cat_lower or "men" in name_lower:
        keywords.add("men's clothing pakistan")
        keywords.add("men's fashion pakistan")
    if "women" in cat_lower or "women" in name_lower or "ladies" in name_lower:
        keywords.add("women's clothing pakistan")
        keywords.add("ladies fashion pakistan")

    # Extract meaningful words from description
    if description:
        stop_words = {"the", "a", "an", "is", "are", "was", "were", "in", "on", "at", "to", "for", "of", "and", "or", "this", "that", "with", "from", "by"}
        desc_words = [w.lower().strip(".,!?;:") for w in description.split() if len(w) > 3]
        meaningful = [w for w in desc_words if w not in stop_words]
        # Add 2-word combinations from description
        for i in range(len(meaningful) - 1):
            combo = f"{meaningful[i]} {meaningful[i+1]}"
            if len(combo) > 5:
                keywords.add(combo)

    # Filter out empty strings and limit
    keywords = [k for k in keywords if k and len(k) > 2]
    return sorted(keywords)[:20]  # Max 20 keywords
