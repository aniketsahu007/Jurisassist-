import psutil
import os
import gc
import time

def print_memory(label):
    mem = psutil.Process(os.getpid()).memory_info().rss / (1024 * 1024)
    print(f"[{label}] Memory: {mem:.2f} MB")

print_memory("Start")

# 1. Generate fake chunks
print("Generating fake text chunks...")
chunks = [{"chunk_index": i, "text_content": f"This is a test legal sentence number {i}. " * 20} for i in range(2500)]
print_memory("After chunk generation")

# 2. Init ChromaDB and ONNX embedding
from chromadb.utils.embedding_functions import DefaultEmbeddingFunction
print("Loading DefaultEmbeddingFunction...")
ef = DefaultEmbeddingFunction()
print_memory("After ONNX model load")

# 3. Simulate the batch embedding loop
print("Starting embedding loop...")
total = 0
for start in range(0, len(chunks), 8):
    batch = chunks[start:start + 8]
    docs = [c["text_content"] for c in batch]
    # DefaultEmbeddingFunction implements __call__ which takes a list of documents
    vectors = ef(docs)
    total += len(docs)
    
    if start % 160 == 0:
        print_memory(f"Embedded {total} chunks")
        # gc.collect()

print_memory("End")
print(f"Total embedded: {total}")
