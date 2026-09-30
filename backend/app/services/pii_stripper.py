import re
import spacy
import logging

logger = logging.getLogger(__name__)

try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    import spacy.cli
    spacy.cli.download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

class PIIStripper:
    def __init__(self):
        # Basic regexes for Indian formats
        self.phone_pattern = re.compile(r'\b(?:\+?91[\-\s]?)?[6789]\d{9}\b')
        self.email_pattern = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')
        self.case_no_pattern = re.compile(r'(?:Crl\.\s*A\.|W\.P\.\s*\(C\)|C\.C\.|ARB\.P\.|FIR\s*No\.?)\s*[\w\-\/]+', re.IGNORECASE)

    def strip_pii(self, text: str) -> str:
        if not text:
            return text
        
        # 1. Regex replacements
        text = self.phone_pattern.sub('[PHONE]', text)
        text = self.email_pattern.sub('[EMAIL]', text)
        text = self.case_no_pattern.sub('[CASE_NUMBER]', text)
        
        # 2. SpaCy NER for Names and Addresses
        # Only parse up to a reasonable limit to prevent performance issues
        doc = nlp(text[:10000])
        
        # Replace from end to beginning so indices don't shift
        ents = sorted(doc.ents, key=lambda e: e.start_char, reverse=True)
        for ent in ents:
            if ent.label_ == "PERSON":
                text = text[:ent.start_char] + "[NAME]" + text[ent.end_char:]
            elif ent.label_ in ["GPE", "LOC", "FAC"]:
                text = text[:ent.start_char] + "[ADDRESS]" + text[ent.end_char:]
                
        return text

# Singleton instance
pii_stripper = PIIStripper()
