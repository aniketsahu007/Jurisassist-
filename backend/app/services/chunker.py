"""
Chunker Service — Phase 5
Splits long document text into overlapping chunks suitable for vector embedding.
Uses a character-based approach with sentence boundary awareness so legal clauses
are never split mid-sentence, which would corrupt their meaning.
"""
import re
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# --- Config ---
CHUNK_SIZE = 800       # target characters per chunk (legal sentences are longer than prose)
CHUNK_OVERLAP = 150    # characters of overlap between adjacent chunks
MIN_CHUNK_SIZE = 100   # skip chunks with fewer than this many characters (headers, whitespace, etc.)


class DocumentChunker:
    """
    Splits a document's raw text into overlapping chunks that are ready for embedding.
    Legal documents need slightly larger chunks than standard prose because a single
    ruling or citation often spans 3-4 sentences.
    """

    def chunk(self, text: str, document_id: str) -> List[Dict[str, Any]]:
        """
        Main entry point. Returns a list of chunk dicts each with:
            - chunk_index  (int)   : sequential index starting at 0
            - text_content (str)   : the raw text of the chunk
            - char_start   (int)   : start offset in the original text
            - char_end     (int)   : end offset in the original text
            - document_id  (str)   : back-reference to the source document
        """
        if not text or not text.strip():
            logger.warning(f"Empty text for document {document_id}. No chunks created.")
            return []

        # Clean up the text first — remove excessive whitespace
        text = re.sub(r'\n{3,}', '\n\n', text)
        text = re.sub(r' {3,}', ' ', text)

        raw_chunks = self._sliding_window(text)
        
        results = []
        for i, (chunk_text, char_start, char_end) in enumerate(raw_chunks):
            if len(chunk_text.strip()) < MIN_CHUNK_SIZE:
                continue  # skip tiny header-only chunks
            
            results.append({
                "chunk_index": i,
                "text_content": chunk_text.strip(),
                "char_start": char_start,
                "char_end": char_end,
                "document_id": document_id,
            })

        logger.info(f"Document {document_id} split into {len(results)} chunks from {len(text)} chars of text.")
        return results

    def _sliding_window(self, text: str) -> List[tuple]:
        """
        Splits text with a sliding window. Finds the nearest sentence boundary
        at the end of each window to avoid cutting mid-sentence.
        """
        chunks = []
        start = 0
        length = len(text)

        while start < length:
            end = min(start + CHUNK_SIZE, length)

            # Try to end at the nearest sentence boundary (., !, ?, newline)
            if end < length:
                # Search backwards from `end` for a sentence terminator
                boundary = self._find_sentence_boundary(text, end)
                if boundary > start:
                    end = boundary

            chunk_text = text[start:end]
            chunks.append((chunk_text, start, end))

            # Advance start with overlap — start of next chunk overlaps previous chunk
            if end >= length:
                break
            
            start = end - CHUNK_OVERLAP
            if start <= 0:
                break

        return chunks

    def _find_sentence_boundary(self, text: str, pos: int, look_back: int = 200) -> int:
        """
        Look backwards from `pos` to find the most recent sentence-terminating character.
        Returns the position AFTER that character (so the chunk ends there).
        """
        search_from = max(0, pos - look_back)
        segment = text[search_from:pos]
        
        # Find the last sentence terminator in the segment
        # Priority: period+space, newline, question mark, exclamation mark
        terminators = ['. ', '.\n', '?\n', '!\n', '\n\n']
        best = -1
        for t in terminators:
            idx = segment.rfind(t)
            if idx > best:
                best = idx

        if best >= 0:
            return search_from + best + len(terminators[0])  # move past the terminator
        
        # Fallback — no sentence boundary found, use the original position
        return pos
