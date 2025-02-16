import chromadb
from dotenv import load_dotenv
import os
from langchain_text_splitters import RecursiveCharacterTextSplitter
from canvas_api import get_all_assignments, get_canvas_assignment_info
import uuid

load_dotenv()

client = chromadb.HttpClient(
    ssl=True,
    host='api.trychroma.com',
    tenant='7e86b93e-3e4c-429d-9c86-8899adcefd49',
    database='treehacks25',
    headers={
        'x-chroma-token': os.getenv('CHROMA_API_KEY')
    }
)

def create_canvas_collection():
  assignments = get_all_assignments()
  print(assignments)
  try:
    client.delete_collection('canvas')
  except:
    pass
  collection = client.get_or_create_collection('canvas')


  for assignment in assignments:
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,  # Adjust as needed
        chunk_overlap=100,  # Ensures context is retained
        separators=["\n\n", "\n", " "],  # Prioritizes paragraph, then line, then word breaks
    )

    chunks = text_splitter.split_text(str({
      "assignment_name": assignment["assignment_name"],
      "assignment_description": assignment["assignment_description"],
      "course_name": assignment["course_name"] 
  }))
    for chunk in chunks:
      collection.add(
          ids=[str(uuid.uuid4())],
          documents=chunk
      )
def get_similar_with_query(query):
    collection = client.get_or_create_collection('canvas')
    return collection.query(query_texts=query, n_results=10)["documents"][0]

def create_canvas_collection_for_assignment(assignment_id: str):
  assignments = get_all_assignments_for_assignment(assignment_id)
  try:
    client.delete_collection('canvas')
  except:
    pass
  collection = client.get_or_create_collection('canvas')


  for assignment in assignments:
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,  # Adjust as needed
        chunk_overlap=100,  # Ensures context is retained
        separators=["\n\n", "\n", " "],  # Prioritizes paragraph, then line, then word breaks
    )

    chunks = text_splitter.split_text(str({
      "assignment_name": assignment["assignment_name"],
      "assignment_description": assignment["assignment_description"],
      "course_name": assignment["course_name"]
  }))
    for chunk in chunks:
      collection.add(
          ids=[str(uuid.uuid4())],
          documents=chunk
      )
def get_similar_with_query(query):
    collection = client.get_or_create_collection('canvas')
    return collection.query(query_texts=query, n_results=10)["documents"][0]

def rag_specific_assignment(course_id: str, assignment_id: str):
  assignment = get_canvas_assignment_info(course_id, assignment_id)
  try:
    client.delete_collection('canvas')
  except:
    pass
  collection = client.get_or_create_collection('canvas')



  text_splitter = RecursiveCharacterTextSplitter(
      chunk_size=1000,  # Adjust as needed
      chunk_overlap=100,  # Ensures context is retained
      separators=["\n\n", "\n", " "],  # Prioritizes paragraph, then line, then word breaks
  )

  chunks = text_splitter.split_text(str({
      "assignment_name": assignment["name"],
      "assignment_description": assignment["description"],

  }))
  for chunk in chunks:
    collection.add(
        ids=[str(uuid.uuid4())],
        documents=chunk
    )
