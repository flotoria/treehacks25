from langgraph.graph import StateGraph, END, START
from typing import TypedDict
from groq_api import determine_image_description
from chroma import get_similar_with_query
from llm import do_query_with_image_description


class DrawingState(TypedDict):
    base64_image: str
    image_description: str
    rag_result: str
    response: str


def generate_image_description(state: DrawingState):
    state["image_description"] = determine_image_description(state["base64_image"])
    return state

def get_similarities(state: DrawingState):
    state["rag_result"] = get_similar_with_query(state["image_description"])
    return state

def final_response(state: DrawingState):
    state["response"] = do_query_with_image_description(state["image_description"], state["rag_result"], state["base64_image"])
    return state
    
def create_graph():
    workflow = StateGraph(DrawingState)

    workflow.add_node("image_description_agent", generate_image_description)
    workflow.add_node("rag_agent", get_similarities)
    workflow.add_node("final_response_agent", final_response)

    workflow.add_edge(START, "image_description_agent")
    workflow.add_edge("image_description_agent", "rag_agent")
    workflow.add_edge("rag_agent", "final_response_agent")
    workflow.add_edge("final_response_agent", END)

    app = workflow.compile()
    return app

def invoke_graph(base64_image: str):
    graph = create_graph()

    inputs = {
        "base64_image": base64_image
    }

    # Run the graph with the inputs
    result = graph.invoke(input=inputs)
    return result["response"]
