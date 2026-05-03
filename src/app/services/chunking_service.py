from typing import List
from langchain_text_splitters import RecursiveCharacterTextSplitter

class ChunkingService:
    """
    Service responsible for splitting text into smaller chunks based on size and overlap using LangChain.
    """
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        """
        Initialize the ChunkingService with configurable sizes and the LangChain text splitter.
        """
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        
        # We use RecursiveCharacterTextSplitter as the production standard for semantic chunking
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            separators=["\n\n", "\n", " ", ""] # Tries to split by paragraphs first, then sentences, then spaces
        )

    def split_text(self, text: str) -> List[str]:
        """
        Splits text into ordered, semantic chunks using LangChain.
        """
        if not text:
            return []
            
        return self.splitter.split_text(text)
