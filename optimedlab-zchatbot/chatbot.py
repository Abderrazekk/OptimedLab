from groq import Groq
import os
import json
import faiss
import numpy as np
import time
import asyncio
import httpx
from langchain_core.documents import Document
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from langchain_ollama import OllamaEmbeddings
from langchain_community.vectorstores import FAISS
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    print("WARNING: GROQ_API_KEY not found in environment variables")
os.environ['GROQ_API_KEY'] = api_key or ""

# -------------------------------------------------------------------
# Tool definitions for Groq function calling
# -------------------------------------------------------------------
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_clients",
            "description": "Recherche des clients par nom. Retourne une liste de clients correspondants.",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {"type": "string", "description": "Nom du client à rechercher"}
                },
                "required": ["name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_products",
            "description": "Recherche des produits par nom. Retourne une liste de produits correspondants.",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {"type": "string", "description": "Nom du produit à rechercher"}
                },
                "required": ["name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "create_quote",
            "description": "Crée un nouveau devis pour un client avec les produits et quantités spécifiés.",
            "parameters": {
                "type": "object",
                "properties": {
                    "client_name": {"type": "string", "description": "Nom du client"},
                    "items": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "product_name": {"type": "string", "description": "Nom du produit"},
                                "quantity": {"type": "integer", "description": "Quantité"}
                            },
                            "required": ["product_name", "quantity"]
                        }
                    }
                },
                "required": ["client_name", "items"]
            }
        }
    }
]

class RAGSystem:
    def __init__(self, data_path: str, index_path: str, model_name: str = "llama-3.1-8b-instant", 
                 embedding_model: str = "nomic-embed-text:latest", top_k: int = 1):
        """Initialize the RAG system with configuration parameters"""
        self.data_path = data_path
        self.index_path = index_path
        self.model_name = model_name
        self.embedding_model_name = embedding_model
        self.top_k = top_k
        
        print(f"Initializing RAG system with data_path={data_path}, index_path={index_path}")
        
        # Set up embedding model
        try:
            self.embeddings = OllamaEmbeddings(model=self.embedding_model_name)
            print("✅ Embedding model initialized")
        except Exception as e:
            print(f"❌ Error initializing embeddings: {e}")
            raise
        
        # Initialize Groq client
        self.client = Groq()
        print("✅ Groq client initialized")
        
        # Load data and create index
        self.data = self._load_data()
        self.vectorstore = self._initialize_vectorstore()
        
        # Refined prompt for LLM generation
        self.prompt_template = """
            Vous êtes OptimedLabBOT un assistant IA francophone, utile et concis, développé par "Ben Sassi Iheb", tu travailles pour le compte de la société "OptimedLab" et tu es là pour répondre aux questions des utilisateurs.
            Vous pouvez répondre aux questions en utilisant le contexte fourni, ou effectuer des actions (comme créer un devis, rechercher des clients/produits) en utilisant les outils mis à disposition.
            
            Contexte pour les questions générales:
            ---------------------
            {context}
            ---------------------

            Répondez en français.
            Si la réponse n'est pas dans le contexte, dites : "Je n'ai pas assez d'informations pour répondre à cette question."

            Question : {question}

            Réponse :
            """
        self.prompt = ChatPromptTemplate.from_template(self.prompt_template)
        print("✅ RAG system initialized successfully")

    def _load_data(self) -> List[Dict[str, Any]]:
        """Load and prepare data from JSON file"""
        try:
            if not os.path.exists(self.data_path):
                print(f"❌ Data file not found: {self.data_path}")
                return []
                
            with open(self.data_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
                print(f"✅ Loaded {len(data)} entries from {self.data_path}")
                return data
        except Exception as e:
            print(f"❌ Error loading data: {e}")
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
        try:
            if os.path.exists(self.index_path) and os.path.exists(f"{self.index_path}/index.faiss"):
                print('📚 Loading existing FAISS index...')
                return FAISS.load_local(self.index_path, self.embeddings, allow_dangerous_deserialization=True)
            
            print('🆕 Creating new FAISS index...')
            documents = []
            for item in self.data:
                question = item.get('question', '')
                answer = item.get('answer', '')
                
                if question and answer:
                    # Combine question and answer in a fixed format
                    combined_text = f"Question: {question}\nRéponse: {answer}"
                    doc = Document(
                        page_content=combined_text,
                        metadata={"source": "qa_pair", "question": question}
                    )
                    documents.append(doc)
            
            if not documents:
                print("⚠️ No valid documents found to index")
                # Create an empty vectorstore
                empty_doc = Document(page_content="Empty", metadata={"source": "empty"})
                vectorstore = FAISS.from_documents([empty_doc], self.embeddings)
            else:
                vectorstore = FAISS.from_documents(documents, self.embeddings)
                
            vectorstore.save_local(self.index_path)
            print(f"✅ Created and saved FAISS index with {len(documents)} documents")
            return vectorstore
            
        except Exception as e:
            print(f"❌ Error initializing vectorstore: {e}")
            # Return an empty vectorstore as fallback
            empty_doc = Document(page_content="Empty", metadata={"source": "empty"})
            return FAISS.from_documents([empty_doc], self.embeddings)
    
    def retrieve_context(self, query: str) -> List[Document]:
        """Retrieve relevant documents for a query"""
        start_time = time.time()
        try:
            results = self.vectorstore.similarity_search(query, k=self.top_k)
            retrieval_time = time.time() - start_time
            print(f"📖 Retrieved {len(results)} documents in {retrieval_time:.2f} seconds")
            return results
        except Exception as e:
            print(f"❌ Error retrieving context: {e}")
            return []
    
    def format_context(self, retrieved_docs: List[Document]) -> str:
        """Format retrieved documents into a context string for prompt"""
        context_parts = []
        for i, doc in enumerate(retrieved_docs):
            context_parts.append(f"{doc.page_content}")
        return "\n\n".join(context_parts)
    
    def generate_response(self, query: str, context: str) -> str:
        """Generate answer from LLM using Groq client"""
        try:
            prompt_text = self.prompt.format(context=context, question=query)
            start_time = time.time()
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        'role': 'system',
                        'content': 'Vous êtes OptimedLabBOT, un assistant utile qui répond uniquement en français.'
                    },
                    {
                        'role': 'user',
                        'content': prompt_text,
                    }
                ],
                model=self.model_name,
                temperature=0,
                max_tokens=1024,
            )
            generation_time = time.time() - start_time
            print(f"💬 Response generated in {generation_time:.2f} seconds")
            return chat_completion.choices[0].message.content.strip()
        except Exception as e:
            print(f"❌ Error generating response: {e}")
            return "Je n'ai pas assez d'informations pour répondre à cette question."

    def _system_prompt(self, context: str) -> str:
        return f"""
Vous êtes OptimedLabBOT, un assistant IA francophone, utile et concis. Vous travaillez pour la société OptimedLab.
Vous pouvez répondre aux questions en utilisant le contexte fourni, ou effectuer des actions (comme créer un devis, rechercher des clients/produits) en utilisant les outils mis à disposition.

Si l'utilisateur demande une action, utilisez l'outil approprié. Ne devinez jamais les IDs ; utilisez les outils pour obtenir des informations réelles.

Contexte pour les questions générales:
---------------------
{context}
---------------------

Répondez en français.
"""

    # -----------------------------------------------------------------
    # Core agentic message processor
    # -----------------------------------------------------------------
    async def process_message(self, query: str, token: str = None) -> str:
        try:
            # 1. Retrieve context (blocking, run in thread)
            retrieved_docs = await asyncio.to_thread(self.retrieve_context, query)
            context = self.format_context(retrieved_docs) if retrieved_docs else ""

            messages = [
                {"role": "system", "content": self._system_prompt(context)},
                {"role": "user", "content": query}
            ]

            # 2. First LLM call with tools
            response = await asyncio.to_thread(
                self.client.chat.completions.create,
                model=self.model_name,
                messages=messages,
                tools=tools,
                tool_choice="auto",
                temperature=0
            )

            message = response.choices[0].message
            tool_calls = message.tool_calls

            if not tool_calls:
                return message.content or "Je n'ai pas de réponse à cette question."

            # 3. Handle tool calls
            messages.append(message)  # assistant message with tool calls
            for tool_call in tool_calls:
                fn_name = tool_call.function.name
                args = json.loads(tool_call.function.arguments)

                print(f"🔧 Executing tool: {fn_name} with args: {args}")
                
                if fn_name == "get_clients":
                    result = await self._get_clients(args.get("name", ""), token)
                elif fn_name == "get_products":
                    result = await self._get_products(args.get("name", ""), token)
                elif fn_name == "create_quote":
                    result = await self._create_quote(args, token)
                else:
                    result = {"error": f"Outil inconnu: {fn_name}"}

                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": json.dumps(result, ensure_ascii=False)
                })

            # 4. Final LLM call with tool results
            final_response = await asyncio.to_thread(
                self.client.chat.completions.create,
                model=self.model_name,
                messages=messages,
                temperature=0
            )
            return final_response.choices[0].message.content
            
        except Exception as e:
            print(f"❌ Error in process_message: {e}")
            return f"Désolé, une erreur s'est produite: {str(e)}"

    # -----------------------------------------------------------------
    # HTTP helpers to call Node.js API
    # -----------------------------------------------------------------
    async def _call_api(self, method: str, path: str, token: str = None, data=None):
        base_url = os.getenv("NODE_API_URL", "http://localhost:5000/api")
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        
        print(f"🌐 Calling API: {method} {base_url}{path}")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                if method.upper() == "GET":
                    resp = await client.get(f"{base_url}{path}", headers=headers, params=data)
                elif method.upper() == "POST":
                    resp = await client.post(f"{base_url}{path}", headers=headers, json=data)
                else:
                    raise ValueError(f"Unsupported method {method}")
                
                resp.raise_for_status()
                result = resp.json()
                print(f"✅ API call successful: {result.get('success', False)}")
                return result
            except httpx.TimeoutException:
                print(f"❌ API timeout: {path}")
                return {"error": "Timeout calling API"}
            except httpx.HTTPStatusError as e:
                print(f"❌ HTTP error: {e}")
                return {"error": f"HTTP error: {e.response.status_code}"}
            except Exception as e:
                print(f"❌ API call error: {e}")
                return {"error": str(e)}

    async def _get_clients(self, name: str, token: str):
        try:
            result = await self._call_api("GET", "/clients", token)
            if isinstance(result, dict) and "error" in result:
                return result
                
            clients = result.get("data", [])
            # Simple case‑insensitive filter
            filtered = [c for c in clients if name.lower() in c.get("name", "").lower()]
            return filtered
        except Exception as e:
            return {"error": str(e)}

    async def _get_products(self, name: str, token: str):
        try:
            result = await self._call_api("GET", "/products", token)
            if isinstance(result, dict) and "error" in result:
                return result
                
            products = result.get("data", [])
            filtered = [p for p in products if name.lower() in p.get("name", "").lower()]
            return filtered
        except Exception as e:
            return {"error": str(e)}

    async def _create_quote(self, args: dict, token: str):
        client_name = args.get("client_name")
        items = args.get("items", [])

        if not client_name or not items:
            return {"error": "Client name and items are required"}

        # Resolve client ID
        clients = await self._get_clients(client_name, token)
        if not clients or isinstance(clients, dict) and "error" in clients:
            return {"error": f"Client '{client_name}' introuvable."}
        if len(clients) == 0:
            return {"error": f"Client '{client_name}' introuvable."}
            
        client_id = clients[0]["_id"]

        # Resolve product IDs and get prices
        quote_items = []
        for item in items:
            prod_name = item["product_name"]
            quantity = item["quantity"]
            
            products = await self._get_products(prod_name, token)
            if not products or isinstance(products, dict) and "error" in products:
                return {"error": f"Produit '{prod_name}' introuvable."}
            if len(products) == 0:
                return {"error": f"Produit '{prod_name}' introuvable."}
                
            product = products[0]
            quote_items.append({
                "product": product["_id"],
                "quantity": quantity,
                "price": product["price"]
            })

        payload = {"client": client_id, "items": quote_items}
        try:
            result = await self._call_api("POST", "/quotes", token, data=payload)
            if isinstance(result, dict) and "error" in result:
                return result
            return {"success": True, "quote": result.get("data", {}), "message": "Devis créé avec succès"}
        except Exception as e:
            return {"error": str(e)}

# -------------------------------------------------------------------
# FastAPI app
# -------------------------------------------------------------------
app = FastAPI(title="OptimedLab Chatbot API", description="Agentic chatbot for OptimedLab")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5000",   # Node backend
        "http://127.0.0.1:5000",
        "http://localhost:5173",   # Vite frontend
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize chatbot
print("🚀 Starting OptimedLab Chatbot...")
try:
    rag = RAGSystem(
        data_path='data.json',
        index_path='faiss_index_store',
        model_name='llama-3.1-8b-instant',
        top_k=1
    )
    print("✅ Chatbot initialized successfully!")
except Exception as e:
    print(f"❌ Failed to initialize chatbot: {e}")
    rag = None

# Request model
class ChatRequest(BaseModel):
    message: str

@app.get("/")
async def root():
    return {"message": "OptimedLab Chatbot API is running", "status": "healthy" if rag else "degraded"}

@app.get("/health")
async def health():
    return {"status": "healthy" if rag else "degraded", "rag_initialized": rag is not None}

@app.post("/chat")
async def chat_endpoint(request: ChatRequest, authorization: str = Header(None)):
    if not rag:
        raise HTTPException(status_code=503, detail="Chatbot service not initialized")
    
    try:
        token = None
        if authorization and authorization.startswith("Bearer "):
            token = authorization[7:]
        
        print(f"📨 Processing message: {request.message}")
        reply = await rag.process_message(request.message, token)
        print(f"📤 Reply: {reply[:100]}...")
        
        return {"reply": reply}
    except Exception as e:
        print(f"❌ Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def main():
    """CLI version for testing"""
    print("\n=== OptimedLab RAG System with Agentic Capabilities ===")
    print("Type 'exit' to quit\n")
    
    async def test_message():
        while True:
            user_query = input("\n👉 Enter your question: ")
            if user_query.lower() in ['exit', 'quit', 'q']:
                break
                
            if not rag:
                print("❌ Chatbot not initialized")
                continue
                
            reply = await rag.process_message(user_query, None)
            print(f"\n🤖 Answer: {reply}")

    asyncio.run(test_message())

if __name__ == "__main__":
    import uvicorn
    import sys
    
    # Check if we're running in CLI mode
    if len(sys.argv) > 1 and sys.argv[1] == "--cli":
        main()
    else:
        # Run the FastAPI app
        print("🌐 Starting FastAPI server on http://localhost:8000")
        uvicorn.run(app, host="0.0.0.0", port=8000)