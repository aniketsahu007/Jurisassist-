import pymupdf as fitz  # PyMuPDF
import pytesseract
from PIL import Image
import re
import logging
import math
import os
from typing import Dict, Any

logger = logging.getLogger(__name__)

MAX_DOCUMENT_PAGES = max(1, int(os.getenv("MAX_DOCUMENT_PAGES", "500")))
MAX_OCR_PIXELS = max(1_000_000, int(os.getenv("MAX_OCR_PIXELS", "4000000")))
OCR_DPI = max(72, int(os.getenv("OCR_DPI", "300")))

class DocumentProcessor:
    """
    Service for processing documents (PDFs and images), extracting text natively where possible,
    and falling back to Tesseract OCR when a document is scanned.
    """
    
    def __init__(self, tesseract_cmd: str = None):
        # Allow passing a custom tesseract executable path if needed (e.g., Windows path)
        if tesseract_cmd:
            pytesseract.pytesseract.tesseract_cmd = tesseract_cmd

    def process_file(self, file_path: str) -> Dict[str, Any]:
        """
        Process a document and extract text.
        Returns a dict with 'text', 'confidence', 'pages' and 'is_scanned'.
        """
        result = {
            "text": "",
            "confidence": 0.0,
            "pages": [],
            "is_scanned": False,
            "error": None
        }
        
        try:
            with fitz.open(file_path) as doc:
                if len(doc) > MAX_DOCUMENT_PAGES:
                    raise ValueError(
                        f"Document has {len(doc)} pages; the maximum supported is "
                        f"{MAX_DOCUMENT_PAGES}."
                    )

                full_text = []
                total_words = 0
                is_scanned = False

                for page_num in range(len(doc)):
                    page = doc.load_page(page_num)
                    # Attempt fast native digital extraction first
                    text = page.get_text("text").strip()
                    words = len(text.split())
                
                # Heuristic: If a page has very few extractable words OR is mostly garbage font encoding,
                # it's likely a scanned image or corrupted digital PDF.
                    is_garbage = False
                    if words >= 20:
                        import re
                        # Check for common English stop words or standard punctuation
                        # If the document is purely legal text but has no common words, it's gibberish.
                        common_words = ['the', 'and', 'of', 'to', 'in', 'is', 'for', 'that', 'this', 'with', 'court']
                        text_lower = text.lower()
                        # Count how many of these common words exist as standalone words
                        common_count = sum(len(re.findall(r'\b' + w + r'\b', text_lower)) for w in common_words)
                        # If we have less than 3 common words in 20+ words of text, it's almost certainly font garbage
                        if common_count < 3:
                            is_garbage = True

                    if words < 20 or is_garbage:
                        is_scanned = True
                        try:
                            # Keep unusually large pages below a predictable memory ceiling.
                            page_width = max(float(page.rect.width), 1.0)
                            page_height = max(float(page.rect.height), 1.0)
                            requested_dpi = min(
                                OCR_DPI,
                                math.sqrt(MAX_OCR_PIXELS / (page_width * page_height)) * 72,
                            )
                            dpi = max(72, int(requested_dpi))
                            pix = page.get_pixmap(dpi=dpi, colorspace=fitz.csRGB)
                            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

                            # OCR the image, then release both image buffers before the next page.
                            ocr_text = pytesseract.image_to_string(img)
                            text = ocr_text.strip()
                            words = len(text.split())
                            img.close()
                            del pix
                        except Exception as ocr_error:
                            logger.error(f"OCR failed on page {page_num}: {str(ocr_error)}")
                            if "tesseract is not installed" in str(ocr_error).lower() or "not found" in str(ocr_error).lower():
                                result["error"] = "Tesseract OCR engine is not installed or not in PATH."
                            # If OCR fails, we keep the (mostly empty) native text

                    total_words += words
                    full_text.append(text)
                    # Do not retain every page's full text as a second copy in memory.
                    result["pages"].append({"page_num": page_num + 1, "words": words})

                clean_text = self._clean_text("\n\n".join(full_text))
                result["text"] = clean_text
                result["is_scanned"] = is_scanned

                # Rough confidence heuristic based on processing path and output
                if is_scanned:
                    # OCR text is naturally lower confidence than native digital text
                    result["confidence"] = 0.80 if result["error"] is None else 0.10
                else:
                    result["confidence"] = 0.98
                
        except Exception as e:
            logger.error(f"Error processing document {file_path}: {str(e)}")
            result["error"] = str(e)
            
        return result
        
    def _clean_text(self, text: str) -> str:
        """Basic text cleaning: remove excessive newlines and whitespace."""
        # Replace 3 or more newlines with 2 newlines
        text = re.sub(r'\n{3,}', '\n\n', text)
        # Replace 3 or more spaces with 2 spaces
        text = re.sub(r' {3,}', '  ', text)
        return text.strip()
