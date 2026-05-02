# app/core/vector_db.py

import chromadb

def get_vector_db():
    return chromadb.PersistentClient(path="./chroma_db_data")