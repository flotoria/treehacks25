from typing import Union
from fastapi import FastAPI
from pydantic import BaseModel
from chroma import create_canvas_collection, rag_specific_assignment
from canvas_api import get_all_assignments, get_all_available_canvas_courses, get_canvas_assignment_info, get_canvas_assignment_names, get_canvas_assignments, get_all_course_with_ids_and_names
import os
from llm import do_query
import json
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Query(BaseModel):
    query: str

class CourseID(BaseModel):
    course_id: str
class CourseIDAndAssignmentID(BaseModel):
    course_id: str
    assignment_id: str

@app.post('/canvas')
def get_courses(query: Query):
    return do_query(query.query)

@app.get('/delete')
def delete_history():
    try:
        os.remove("history.json")
        return {"message": "History deleted"}
    except FileNotFoundError:
        pass

@app.get('/message')
def get_message_history():
    history_file = "history.json"
    if os.path.exists(history_file):
        try:
            with open(history_file, 'r') as f:
                history = json.load(f)
                return history
        except json.JSONDecodeError:
            history = []
            return history

@app.get('/courses')
def get_courses():
    return get_all_course_with_ids_and_names()

@app.get('/rag')
def rag():
    try:
        os.remove("history.json")
    except FileNotFoundError:
        pass
    create_canvas_collection()
    return "RAG created"

@app.post('/assignments')
def get_assignment_ids(obj: CourseID):
    return get_canvas_assignment_names(obj.course_id)

@app.post('/rag-specific')
def rag_specific(obj: CourseIDAndAssignmentID):
    try:
        os.remove("history.json")
    except FileNotFoundError:
        pass
    rag_specific_assignment(obj.course_id, obj.assignment_id)
    return "cool"
        