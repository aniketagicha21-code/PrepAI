import re

# Common English fillers; word-boundary aware where applicable
FILLER_REGEXES = [
    re.compile(r"\bum+\b", re.IGNORECASE),
    re.compile(r"\buh+\b", re.IGNORECASE),
    re.compile(r"\buhm+\b", re.IGNORECASE),
    re.compile(r"\bhm+\b", re.IGNORECASE),
    re.compile(r"\blike\b", re.IGNORECASE),
    re.compile(r"\byou know\b", re.IGNORECASE),
    re.compile(r"\bkind of\b", re.IGNORECASE),
    re.compile(r"\bsort of\b", re.IGNORECASE),
    re.compile(r"\bbasically\b", re.IGNORECASE),
    re.compile(r"\bliterally\b", re.IGNORECASE),
]


def count_filler_words(text: str) -> int:
    if not text or not text.strip():
        return 0
    total = 0
    for rx in FILLER_REGEXES:
        total += len(rx.findall(text))
    return total


def word_count(text: str) -> int:
    if not text or not text.strip():
        return 0
    return len(text.split())
