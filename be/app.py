from typing import Union
from fastapi import FastAPI
from canvas_api import get_all_assignments, get_all_available_canvas_courses, get_canvas_assignments

app = FastAPI()


@app.get('/course')
def get_courses():
    return get_all_assignments()