from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn

from app.data_loader import load_data, flatten_documents
from app.embedding import get_embedding_model, compute_embeddings
from app.faiss_index import build_faiss_index, retrieve_context
from app.generator import load_generation_model, generate_response
import os
from dotenv import load_dotenv

load_dotenv()  

token = os.getenv("HF_TOKEN")

app = FastAPI()

# Global variables for models and data
embedding_model = None
faiss_index = None
documents = None
tokenizer = None
generation_model = None
llm_model = "google/gemma-3-1b-it"

@app.on_event("startup")
def startup_event():
    global embedding_model, faiss_index, documents, tokenizer, generation_model
    # Load and flatten data
    data_file = "data/credit_card_benefits.json"
    data = load_data(data_file)
    documents, card_names = flatten_documents(data)
    
    # Initialize embedding model and compute document embeddings
    embedding_model = get_embedding_model()
    doc_embeddings = compute_embeddings(embedding_model, documents)
    
    # Build the FAISS index
    faiss_index = build_faiss_index(doc_embeddings)
    
    # Load the generation model (Gemma 3 "it")
    tokenizer, generation_model = load_generation_model(llm_model, token)

class QueryRequest(BaseModel):
    query: str

@app.post("/recommend")
def recommend_card(request: QueryRequest):
    query = request.query
    # Retrieve context from the FAISS index
    context = retrieve_context(query, embedding_model, faiss_index, documents, top_k=2)
    # Generate a recommendation response using the language model
    recommendation = generate_response(query, context, tokenizer, generation_model)
    return {"recommendation": recommendation}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
