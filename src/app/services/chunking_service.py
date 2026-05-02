from typing import List

class ChunkingService:
    """
    Service responsible for splitting text into smaller chunks based on size and overlap.
    """
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        """
        Initialize the ChunkingService with configurable sizes.
        """
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def split_text(self, text: str) -> List[str]:
        """
        Splits text into ordered chunks. 
        A production implementation might use LangChain or similar text splitters.
        """
        if not text:
            return []
            
        chunks = []
        start_idx = 0
        text_length = len(text)

        while start_idx < text_length:
            end_idx = min(start_idx + self.chunk_size, text_length)
            chunks.append(text[start_idx:end_idx])
            start_idx += (self.chunk_size - self.chunk_overlap)

        return chunks
