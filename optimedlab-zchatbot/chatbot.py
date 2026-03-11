from groq import Groq
import os
import json
import faiss
from langchain_ollama import OllamaEmbeddings
import numpy as np
import time
from langchain_core.documents import Document
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Set API key
load_dotenv()
api_key = os.getenv("GROQ_API_KEY")
os.environ['GROQ_API_KEY'] = api_key

class RAGSystem:
    
    # embedding model name = "nomic-embed-text:latest"
    #top_k: int = 1 => to take the most relivant document 
    def __init__(self, data_path: str, index_path: str, model_name: str = "llama-3.1-8b-instant", 
                 embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2", top_k: int = 1):
        """Initialize the RAG system with configuration parameters"""
        self.data_path = data_path
        self.index_path = index_path
        self.model_name = model_name
        self.embedding_model_name = embedding_model
        self.top_k = top_k
        
        # Set up embedding model (HuggingFace instead of Ollama)
        self.embeddings = HuggingFaceEmbeddings(model_name=self.embedding_model_name)
        
        # Initialize Groq client
        self.client = Groq()
        
        # Load data and create index
        self.data = self._load_data()
        self.vectorstore = self._initialize_vectorstore()
        
        # Refined prompt for LLM generation: strict answer only, in French
        self.prompt_template = """
            Vous êtes OptimedLabBOT un assistant IA francophone , utile et concis, développé par "Ben Sassi Iheb", tu travailles pour le compte de la société "OptimedLab" et tu es là pour répondre aux questions des utilisateurs.
            
            Répondez strictement à la question en utilisant uniquement les informations fournies dans le contexte ci-dessous.

            Contexte :
            ---------------------
            {context}
            ---------------------

            Ne répétez pas la question. Ne fournissez que la réponse.
            Si la réponse n'est pas dans le contexte, dites : "Je n'ai pas assez d'informations pour répondre à cette question."

            Question : {question}

            Réponse :
            """
        self.prompt = ChatPromptTemplate.from_template(self.prompt_template)

    def _load_data(self) -> List[Dict[str, Any]]:
        """Load and prepare data from JSON file"""
        try:
            with open(self.data_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
                print(f"Loaded {len(data)} entries from {self.data_path}")
                return data
        except Exception as e:
            print(f"Error loading data: {e}")
            return []

    def _chunk_text(self, text: str, chunk_size: int = 512, overlap: int = 50) -> List[str]:
        """Split text into chunks with overlap for better context preservation"""
        chunks = []
        for i in range(0, len(text), chunk_size - overlap):
            chunks.append(text[i:i + chunk_size])
            if i + chunk_size >= len(text):
                break
        return chunks

    def _initialize_vectorstore(self) -> FAISS:
        """Initialize or load the FAISS vector store"""
        if os.path.exists(self.index_path) and os.path.exists(f"{self.index_path}/index.faiss"):
            print('Loading existing FAISS index...')
            return FAISS.load_local(self.index_path, self.embeddings, allow_dangerous_deserialization=True)
        
        print('Creating new FAISS index...')
        documents = []
        for item in self.data:
            question = item.get('question', '')
            answer = item.get('answer', '')
            
            if question and answer:
                # Combine question and answer in a fixed format
                combined_text = f"Question: {question}\nla reponse est reponse : {answer}"
                doc = Document(
                    page_content=combined_text,
                    metadata={"source": "qa_pair", "question": question}
                )
                documents.append(doc)
        
        if not documents:
            raise ValueError("No valid documents found to index")
            
        vectorstore = FAISS.from_documents(documents, self.embeddings)
        vectorstore.save_local(self.index_path)
        return vectorstore
    
    def retrieve_context(self, query: str) -> List[Document]:
        """Retrieve relevant documents for a query"""
        start_time = time.time()
        results = self.vectorstore.similarity_search(query, k=self.top_k)
        retrieval_time = time.time() - start_time
        print(f"Retrieved {len(results)} documents in {retrieval_time:.2f} seconds")
        return results
    
    def format_context(self, retrieved_docs: List[Document]) -> str:
        """Format retrieved documents into a context string for prompt"""
        context_parts = []
        for i, doc in enumerate(retrieved_docs):
            context_parts.append(f"{doc.page_content}")
        return "\n\n".join(context_parts)
    
    def generate_response(self, query: str, context: str) -> str:
        """Generate answer from LLM using Groq client with strict prompt"""
        try:
            prompt_text = self.prompt.format(context=context, question=query)
            start_time = time.time()
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        'role': 'system',
                        'content': 'Vous êtes OPM bot, un assistant utile qui répond uniquement en français en utilisant les informations fournies. Retournez juste la réponse sans répétition.'
                    },
                    {
                        'role': 'user',
                        'content': [
                            {'type': 'text', 'text': prompt_text},
                        ],
                    }
                ],
                model=self.model_name,
                temperature=0,
                max_tokens=1024,
            )
            generation_time = time.time() - start_time
            print(f"Réponse générée en {generation_time:.2f} secondes")
            return chat_completion.choices[0].message.content.strip()
        except Exception as e:
            print(f"Erreur lors de la génération de la réponse : {e}")
            return "Je n'ai pas assez d'informations pour répondre à cette question."

    def answer_question(self, query: str) -> str:
        """Main method to get answer: retrieve context and generate LLM answer"""
        print(f"\n--- Processing Query: '{query}' ---")
        
        retrieved_docs = self.retrieve_context(query)
        
        if not retrieved_docs:
            return "Je n'ai pas assez d'informations pour répondre à cette question."
        
        context = self.format_context(retrieved_docs)
        response = self.generate_response(query, context)
        return response

# FastAPI setup
app = FastAPI()

# Add CORS middleware – restrict to your backend and frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows your live backend and frontend to talk to it
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize chatbot
rag = RAGSystem(
    data_path='data.json',
    index_path='faiss_index_store',
    model_name='llama-3.1-8b-instant',
    top_k=1
)

# Request model – now only requires 'message'
class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        reply = rag.answer_question(request.message)
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def main():
    # CLI version (kept for testing)
    rag = RAGSystem(
        data_path='data.json',
        index_path='faiss_index_store',
        model_name='llama-3.1-8b-instant',
        top_k=1
    )
    
    print("\n=== RAG System with Groq and FAISS ===")
    print("Type 'exit' to quit\n")
    
    while True:
        user_query = input("\nEnter your question: ")
        if user_query.lower() in ['exit', 'quit', 'q']:
            break
            
        answer = rag.answer_question(user_query)
        print("\nAnswer:", answer)

if __name__ == "__main__":
    # Run the FastAPI app using uvicorn when executed directly
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
    # To run the CLI version, comment the above line and uncomment:
    # main()