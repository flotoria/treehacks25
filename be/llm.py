from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from dotenv import load_dotenv
import os
import json
from chroma import get_similar_with_query

load_dotenv()

chat = ChatGroq(temperature=0, groq_api_key=os.getenv("GROQ_API_KEY"), model_name="mixtral-8x7b-32768")

def do_query(query: str):
    # Load existing history
    history = []
    history_file = "history.json"
    if os.path.exists(history_file):
        try:
            with open(history_file, 'r') as f:
                history = json.load(f)
        except json.JSONDecodeError:
            history = []

    system_message = """You are to help direct the user on how to do certain course materials. You are to provide information on how to complete the assignment.
                    You are to be as concise as possible. 
                    You are to not repeat any of the assignment name or description without being asked to.
                    You need to use the context provided by the user in order to help acquire your answer.
                    Format your answers in markdown, and bold the relevant keywords.
                    If the query the user provided is irrelevant to the context, ignore the context provided.
                    Do not say anything such as 'The user query "hey" is quite general, so I'll provide a response based on the most recent context provided.'
                    If the user query is general, DO NOT ANSWER IT WITH THE CONTEXT. Answer it alone. The context may not provide
                    everything you need, so make sure to only use the context as a supplementary aid. Also, the user did not 
                    provide the context, the user does not know there was context provided, so do not mention any of the contexts directly.
                    Do not mention anything about a user query being provided by the way or repeat the user query!!"""

    context = get_similar_with_query(query)
    user_message = """
    The user query is: {query}

    Remember, if the user query is irrelevant to the context, ignore the context provided. 
    The context needed to provide the proper answer is: {context}
    """

    # Format history into messages for the prompt
    messages = [("system", system_message)]
    for msg in history:
        role = "assistant" if msg["type"] == "assistant" else "user"
        messages.append((role, msg["message"]))
    messages.append(("user", user_message))

    prompt = ChatPromptTemplate.from_messages(messages)

    chain = prompt | chat
    message = chain.invoke({"query": query, "context": "\n".join(context)})
    
    # Add messages to history
    history.extend([
        {"type": "human", "message": query},
        {"type": "assistant", "message": message.content}
    ])

    # Save updated history
    with open(history_file, 'w') as f:
        json.dump(history, f, indent=2)

    return message.content

