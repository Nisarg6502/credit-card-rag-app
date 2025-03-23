from transformers import AutoTokenizer, AutoModelForCausalLM
from dotenv import load_dotenv
import os

def load_generation_model(model_name, hf_token):
    tokenizer = AutoTokenizer.from_pretrained(model_name, token=hf_token)
    model = AutoModelForCausalLM.from_pretrained(model_name, token=hf_token)
    return tokenizer, model

def generate_response(query, context, tokenizer, model):
    prompt = (
        f"Using the following information about credit cards:\n{context}\n\n"
        f"Answer the query: {query}\nRecommendation:"
    )
    inputs = tokenizer(prompt, return_tensors="pt")
    output_ids = model.generate(**inputs, max_new_tokens=200, do_sample=True, temperature=0.2)
    response = tokenizer.decode(output_ids[0], skip_special_tokens=True)
    return response
