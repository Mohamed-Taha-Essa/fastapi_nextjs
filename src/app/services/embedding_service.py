from typing import List

class EmbeddingService:
    """
    Service responsible for converting text chunks into dense embeddings.
    Abstracts the underlying embedding provider (e.g., OpenAI, HuggingFace).
    """
    def __init__(self, model_name: str = "text-embedding-ada-002"):
        """
        Initialize with an embedding model configuration or client.
        """
        self.model_name = model_name

    def generate_embedding(self, text: str) -> List[float]:
        """
        Generates a vector embedding for a single string.
        """
        # Placeholder for actual API call, e.g., client.embeddings.create(...)
        return [0.0] * 1536

    def generate_batch_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generates vector embeddings for a batch of strings.
        """
        return [self.generate_embedding(text) for text in texts]
