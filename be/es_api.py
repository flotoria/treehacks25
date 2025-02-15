from elasticsearch import Elasticsearch, helpers
from dotenv import load_dotenv
import os
from canvas_api import get_all_assignments

load_dotenv()

client = Elasticsearch(
    "https://my-elasticsearch-project-a1c094.es.us-west-2.aws.elastic.cloud:443",
    api_key=os.getenv("ELASTICSEARCH_API_KEY"),
)

index_name = "testgpt"

mappings = {
    "mappings":{
        "properties": {
            "assignment_name": {
                "type": "text"
            },
            "assignment_description": {
                "type": "text"
            },
            "course_name": {
                "type": "text"
            }
        }
    }
}

client.indices.delete(index=index_name)
mapping_response = client.indices.create(index=index_name, body=mappings)
print(mapping_response)

assignments = get_all_assignments()

bulk_response = helpers.bulk(client, assignments, index=index_name)
print(bulk_response)

resp = client.search(
    index="my-index-000001",
    query={
        "match": {
            "user.id": "kimchy"
        }
    },
)
print(resp)