"""
Vector Store Service — Phase 5
Wraps ChromaDB for document chunk ingestion and semantic search.

Architecture:
- One ChromaDB collection per use case (documents, precedents)
- Uses a local sentence-transformers model for embeddings (no API key needed)
- Stores document_id, chunk_index, and case_id as metadata for post-retrieval filtering
"""
import logging
import os
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

# Chroma data will be persisted here so it survives restarts
CHROMA_PERSIST_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "chroma_data")

# Collection names — separate namespace for uploaded docs vs. legal precedents
COLLECTION_DOCUMENTS = "case_documents"
COLLECTION_PRECEDENTS = "legal_precedents"

# ChromaDB's DefaultEmbeddingFunction uses the same all-MiniLM-L6-v2 model
# but runs it via ONNX Runtime instead of PyTorch. ONNX Runtime uses ~50 MB
# of RAM vs ~700 MB+ for PyTorch, making it safe for resource-constrained
# machines. The embedding vectors are identical (384-dim, cosine-compatible).
EMBEDDING_BATCH_SIZE = max(1, int(os.getenv("EMBEDDING_BATCH_SIZE", "8")))


class VectorStoreService:
    """
    Manages all interactions with ChromaDB.
    Lazy-initializes the client and embedding function on first use
    so import of this module doesn't fail even before chromadb is installed.
    """

    def __init__(self):
        self._client = None
        self._embedding_fn = None

    def _get_client(self):
        """Lazily initialise the ChromaDB persistent client."""
        if self._client is None:
            import chromadb
            os.makedirs(CHROMA_PERSIST_DIR, exist_ok=True)
            self._client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
            logger.info(f"ChromaDB client initialised at {CHROMA_PERSIST_DIR}")
        return self._client

    def _get_embedding_fn(self):
        """Lazily initialise ChromaDB's default ONNX-based embedding function."""
        if self._embedding_fn is None:
            from chromadb.utils.embedding_functions import DefaultEmbeddingFunction
            self._embedding_fn = DefaultEmbeddingFunction()
            logger.info("Embedding function loaded: DefaultEmbeddingFunction (ONNX all-MiniLM-L6-v2)")
        return self._embedding_fn

    def _get_collection(self, name: str):
        """Get-or-create a ChromaDB collection."""
        client = self._get_client()
        embedding_fn = self._get_embedding_fn()
        return client.get_or_create_collection(
            name=name,
            embedding_function=embedding_fn,
            metadata={"hnsw:space": "cosine"},  # cosine similarity is better for text
        )

    # -------------------------------------------------------------------------
    # INGESTION
    # -------------------------------------------------------------------------

    def ingest_document_chunks(
        self,
        chunks: List[Dict[str, Any]],
        document_id: str,
        case_id: str,
    ) -> int:
        """
        Embed and store a list of document chunks into the case_documents collection.
        
        Each chunk dict must have:
            - chunk_index  (int)
            - text_content (str)
            - document_id  (str)

        Returns the number of chunks successfully ingested.
        """
        if not chunks:
            return 0

        collection = self._get_collection(COLLECTION_DOCUMENTS)

        # Chroma embeds the complete `documents` list passed to `upsert`.
        # Keep that list small so a long document cannot create a large peak
        # in Python, NumPy, PyTorch, and Chroma memory at the same time.
        total = 0
        for start in range(0, len(chunks), EMBEDDING_BATCH_SIZE):
            batch = chunks[start:start + EMBEDDING_BATCH_SIZE]
            ids = []
            documents = []
            metadatas = []

            for chunk in batch:
                vector_id = f"{document_id}__chunk_{chunk['chunk_index']}"
                ids.append(vector_id)
                documents.append(chunk["text_content"])
                metadatas.append({
                    "document_id": document_id,
                    "case_id": case_id,
                    "chunk_index": chunk["chunk_index"],
                    "char_start": chunk.get("char_start", 0),
                    "char_end": chunk.get("char_end", 0),
                })

            # ChromaDB's `upsert` is idempotent — safe to re-run if the
            # document is reprocessed.
            collection.upsert(ids=ids, documents=documents, metadatas=metadatas)
            total += len(ids)
            logger.info(
                "Embedded batch %s-%s of %s for document %s",
                start + 1,
                start + len(batch),
                len(chunks),
                document_id,
            )

        logger.info("Ingested %s chunks for document %s into ChromaDB.", total, document_id)
        return total

    def ingest_precedent(
        self,
        text: str,
        precedent_id: str,
        source_title: str,
        source_url: str,
        court_name: Optional[str] = None,
        judgment_date: Optional[str] = None,
    ) -> None:
        """
        Embed and store a legal precedent (judgment) into the legal_precedents collection.
        Used by the precedent search feature (Phase 5 / Phase 6).
        """
        collection = self._get_collection(COLLECTION_PRECEDENTS)
        
        metadata = {
            "precedent_id": precedent_id,
            "source_title": source_title,
            "source_url": source_url,
            "court_name": court_name or "Unknown",
            "judgment_date": judgment_date or "",
        }

        collection.upsert(
            ids=[precedent_id],
            documents=[text],
            metadatas=[metadata],
        )
        logger.info(f"Ingested precedent '{source_title}' into ChromaDB.")

    # -------------------------------------------------------------------------
    # SEARCH
    # -------------------------------------------------------------------------

    def search_documents(
        self,
        query: str,
        case_id: Optional[str] = None,
        top_k: int = 5,
    ) -> List[Dict[str, Any]]:
        """
        Semantic search over ingested case documents.
        Optionally filter to a specific case_id.
        
        Returns a list of dicts with 'text', 'score', and 'metadata'.
        """
        collection = self._get_collection(COLLECTION_DOCUMENTS)
        
        where_filter = {"case_id": case_id} if case_id else None

        results = collection.query(
            query_texts=[query],
            n_results=top_k,
            where=where_filter,
            include=["documents", "metadatas", "distances"],
        )

        return self._format_results(results)

    def search_precedents(
        self,
        query: str,
        top_k: int = 5,
    ) -> List[Dict[str, Any]]:
        """
        Semantic search over the legal precedents collection.
        Returns a list of dicts with 'text', 'score', and 'metadata'.
        """
        collection = self._get_collection(COLLECTION_PRECEDENTS)

        results = collection.query(
            query_texts=[query],
            n_results=top_k,
            include=["documents", "metadatas", "distances"],
        )

        return self._format_results(results)

    # -------------------------------------------------------------------------
    # MAINTENANCE
    # -------------------------------------------------------------------------

    def delete_document_chunks(self, document_id: str) -> None:
        """Remove all chunks for a given document (e.g. on re-processing)."""
        collection = self._get_collection(COLLECTION_DOCUMENTS)
        collection.delete(where={"document_id": document_id})
        logger.info(f"Deleted all Chroma chunks for document {document_id}.")

    def get_collection_stats(self) -> Dict[str, int]:
        """Quick diagnostic — returns the count of items in each collection."""
        try:
            docs_col = self._get_collection(COLLECTION_DOCUMENTS)
            prec_col = self._get_collection(COLLECTION_PRECEDENTS)
            return {
                "case_documents": docs_col.count(),
                "legal_precedents": prec_col.count(),
            }
        except Exception as e:
            logger.error(f"Failed to get Chroma collection stats: {e}")
            return {}

    # -------------------------------------------------------------------------
    # HELPERS
    # -------------------------------------------------------------------------

    def _format_results(self, raw: Dict) -> List[Dict[str, Any]]:
        """Convert the raw ChromaDB query response into a clean list of result dicts."""
        results = []
        
        if not raw or not raw.get("documents"):
            return results

        docs = raw["documents"][0]      # first (and only) query
        metas = raw["metadatas"][0]
        distances = raw["distances"][0]

        for doc, meta, dist in zip(docs, metas, distances):
            # ChromaDB cosine distance → similarity score (1 = perfect match, 0 = unrelated)
            score = round(1 - dist, 4)
            results.append({
                "text": doc,
                "score": score,
                "metadata": meta,
            })

        return results


# Singleton instance — import this directly from other modules
vector_store = VectorStoreService()
