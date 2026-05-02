from typing import List, Dict, Any
import uuid

class VectorStoreService:
    """
    Service responsible for interacting with the vector database.
    Handles operations like inserting vectors and similarity search using ChromaDB.
    """
    def __init__(self, db_client: Any, collection_name: str = "knowledge_base"):
        """
        Accepts a ChromaDB client and targets a specific collection.
        """
        self.db_client = db_client
        self.collection_name = collection_name
        # Get or create the specified collection in Chroma
        self.collection = self.db_client.get_or_create_collection(name=self.collection_name)

    def insert_vectors(self, vectors: List[List[float]], payloads: List[Dict[str, Any]]) -> List[str]:
        """
        Inserts embeddings into Chroma along with their text content and metadata.
        Returns a list of generated vector IDs.
        """
        if not vectors:
            return []
            
        vector_ids = [str(uuid.uuid4()) for _ in range(len(vectors))]
        
        # Extract content out from the generic payloads since Chroma stores them as 'documents'
        # To avoid mutating the original pointers, copy the payload
        metadatas = []
        documents = []
        for p in payloads:
            p_copy = p.copy()
            documents.append(p_copy.pop("content", ""))
            
            # Chroma requires metadatas to be str, int, float, or bool. No dicts/None inside.
            # So we stringify complex values or handle them nicely
            cleaned_metadata = {k: (str(v) if not isinstance(v, (str, int, float, bool)) else v) for k, v in p_copy.items() if v is not None}
            metadatas.append(cleaned_metadata)

        # Call Chroma's massive insert
        self.collection.add(
            embeddings=vectors,
            documents=documents,
            metadatas=metadatas,
            ids=vector_ids
        )
        return vector_ids

    def similarity_search(self, query_vector: List[float], top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Searches Chroma for the top_k most similar vectors.
        Returns generic parsed results for standard consumption.
        """
        results = self.collection.query(
            query_embeddings=[query_vector],
            n_results=top_k
        )
        
        parsed_results = []
        if results and results.get("ids") and len(results["ids"]) > 0:
            for i in range(len(results["ids"][0])):
                parsed_results.append({
                    "id": results["ids"][0][i],
                    "content": results["documents"][0][i] if results.get("documents") else "",
                    "metadata": results["metadatas"][0][i] if results.get("metadatas") else {},
                    # Smaller distance in Chroma's default L2 means more similar
                    "distance": results["distances"][0][i] if results.get("distances") else None 
                })
                
        return parsed_results
