from typing import List
from langchain_community.embeddings import HuggingFaceEmbeddings

class EmbeddingService:
    """
    Service responsible for converting text chunks into dense embeddings.
    Abstracts the underlying embedding provider via LangChain HuggingFace.
    """
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        """
        Initialize the Hugging Face embedding model locally using LangChain.
        Defaulting to MiniLM-L6-v2 as it is incredibly fast and standard for local vector generation.
        """
        self.model_name = model_name
        # Loads the embedding model (requires 'sentence-transformers' package installed)
        self.encoder = HuggingFaceEmbeddings(model_name=self.model_name , encode_kwargs={"normalize_embeddings": True})

    def generate_embedding(self, text: str) -> List[float]:
        """
        Generates a vector embedding for a single string.
        """
        text = text.strip()[:2000]
        return self.encoder.embed_query(text)

    def generate_batch_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generates vector embeddings for a batch of strings natively using LangChain for optimal performance.
        """
        cleaned = [t.strip()[:2000] for t in texts if t.strip()]
        if not cleaned:
            return []
        return self.encoder.embed_documents(cleaned)
