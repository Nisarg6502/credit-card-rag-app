from sentence_transformers import SentenceTransformer

def get_embedding_model(model_name="intfloat/multilingual-e5-large-instruct"):
    return SentenceTransformer(model_name)

def compute_embeddings(model, documents):
    return model.encode(documents, convert_to_numpy=True)
