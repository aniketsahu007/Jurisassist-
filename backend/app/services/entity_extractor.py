import spacy
import re
from typing import List, Dict, Any
import logging

from ..models import EntityType

logger = logging.getLogger(__name__)

# Load the spaCy model globally so it doesn't reload on every request
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    # Fallback if model isn't downloaded yet (e.g. during initial worker boot)
    import spacy.cli
    spacy.cli.download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

class EntityExtractor:
    def __init__(self):
        # Indian Law specific regex patterns
        self.patterns = {
            "statute": re.compile(r"(?:section|sec\.?|§)\s*\d+[a-z]?(?:\s*of\s*the\s*|\s*)(IPC|CrPC|BNS|BNSS|BSA|Indian Penal Code)", re.IGNORECASE),
            "fir": re.compile(r"(?:FIR|RC)[-\s]*(?:No\.?|Number)?\s*[\w\-\(\)]+/\d{4}(?:/[\w\-]+)*", re.IGNORECASE),
            "case_number": re.compile(r"(?:Crl\.\s*A\.|W\.P\.\s*\(C\)|C\.C\.|ARB\.P\.)\s*\d+/\d{4}", re.IGNORECASE)
        }
    
    def _chunk_text_for_spacy(self, text: str, max_chars: int = 50000):
        """
        Generator that yields (text_chunk, start_offset) for nlp.pipe.
        Splits text on newlines to ensure we don't break entities or sentences in half,
        while strictly bounding memory usage.
        """
        start = 0
        while start < len(text):
            end = start + max_chars
            if end >= len(text):
                yield text[start:], start
                break
                
            # Search backwards for a natural break (newline) to avoid cutting mid-sentence/word
            last_newline = text.rfind('\n', start, end)
            if last_newline != -1 and last_newline > start:
                end = last_newline + 1  # Cut exactly after the newline
                
            yield text[start:end], start
            start = end

    def extract_entities(self, text: str) -> List[Dict[str, Any]]:
        """
        Takes raw document text and extracts structured entities using spaCy (NER) 
        and Regex heuristics for rigid legal formats.
        """
        entities = []
        if not text:
            return entities
            
        logger.info(f"Extracting entities from text of length {len(text)}")
            
        # 1. Regex Pass for highly structured Indian legal data
        for match in self.patterns["statute"].finditer(text):
            entities.append({
                "entity_type": EntityType.STATUTE,
                "value": match.group(0).strip(),
                "confidence": 0.95,  # High confidence for rigid regex matches
                "context": self._get_context(text, match.start(), match.end())
            })
            
        for match in self.patterns["fir"].finditer(text):
            entities.append({
                "entity_type": EntityType.CASE_NUMBER,
                "value": match.group(0).strip(),
                "confidence": 0.95,
                "context": self._get_context(text, match.start(), match.end())
            })
            
        for match in self.patterns["case_number"].finditer(text):
            entities.append({
                "entity_type": EntityType.CASE_NUMBER,
                "value": match.group(0).strip(),
                "confidence": 0.95,
                "context": self._get_context(text, match.start(), match.end())
            })

        # 2. NLP Pass using spaCy for fuzzier entities (People, Orgs, Dates, Locations)
        text_limit = text[:900000] # Still limit total processing to avoid endless tasks
        
        # Use a generator and nlp.pipe() which is the optimized, production-ready way 
        # to process texts in spaCy without allocating massive contiguous memory blocks.
        chunk_generator = self._chunk_text_for_spacy(text_limit, max_chars=10000)
        
        for doc, offset in nlp.pipe(chunk_generator, as_tuples=True, batch_size=2):
            for ent in doc.ents:
                mapped_type = self._map_spacy_label_to_entity_type(ent.label_, ent.text)
                if mapped_type:
                    # Map the chunk-relative index back to the absolute document index
                    abs_start = offset + ent.start_char
                    abs_end = offset + ent.end_char
                    entities.append({
                        "entity_type": mapped_type,
                        "value": ent.text.strip(),
                        "confidence": 0.75, 
                        "context": self._get_context(text, abs_start, abs_end)
                    })
                
        logger.info(f"Successfully extracted {len(entities)} entities.")
        return entities

    def _get_context(self, text: str, start: int, end: int, window: int = 60) -> str:
        """Extract a window of characters around the match for the 'context' field."""
        context_start = max(0, start - window)
        context_end = min(len(text), end + window)
        return text[context_start:context_end].replace("\n", " ").strip()
        
    def _map_spacy_label_to_entity_type(self, label: str, text: str) -> EntityType:
        """Map spaCy's standard NER labels to our custom JurisAssist legal enums."""
        if label == "DATE":
            # Reject raw 1-4 digit numbers (e.g. years or random numbers like "2001,")
            cleaned = re.sub(r'[^a-zA-Z0-9]', '', text)
            if not cleaned or (len(cleaned) <= 4 and cleaned.isdigit()):
                return None
            return EntityType.DATE
        elif label == "PERSON":
            # Simple heuristic: if it has "Justice" or "Hon'ble", it's a judge.
            text_lower = text.lower()
            if "justice" in text_lower or "judge" in text_lower or "hon'ble" in text_lower:
                return EntityType.JUDGE
            elif "advocate" in text_lower or "counsel" in text_lower:
                return EntityType.ADVOCATE
            else:
                # Default to PARTY for MVP
                return EntityType.PARTY
        elif label == "ORG":
            text_lower = text.lower()
            if "court" in text_lower or "tribunal" in text_lower or "bench" in text_lower:
                return EntityType.COURT
            return EntityType.ORGANIZATION
        elif label == "GPE" or label == "LOC":
            return EntityType.LOCATION
            
        return None
