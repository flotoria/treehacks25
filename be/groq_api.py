from groq import Groq
from dotenv import load_dotenv


load_dotenv()

client = Groq()



def determine_image_description(base64_image: str):
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "What's in this image? If you can transcribe the image, do it."},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"{base64_image}",
                        },
                    },
                ],
            }
        ],
        model="llama-3.2-11b-vision-preview",
    )

    return chat_completion.choices[0].message.content