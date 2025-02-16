from dotenv import load_dotenv
import requests
import os

load_dotenv()

# canvas api helper functions here
def get_all_available_canvas_courses():
    try:
        response = requests.get("https://canvas.instructure.com/api/v1/courses?per_page=100", headers={"Authorization": f"{os.getenv('CANVAS_TOKEN')}"})
        response_json = response.json()
        cleaned_up_response = []
        for course in response_json:
            if "access_restricted_by_date" not in course:
                cleaned_up_response.append(course)
        return cleaned_up_response
    except Exception as e:
        print(f"Error getting courses: {e}")
        return []


def get_canvas_assignments(course_id: int):
    try:
        response = requests.get(f"https://canvas.instructure.com/api/v1/courses/{course_id}/assignments", headers={"Authorization": f"{os.getenv('CANVAS_TOKEN')}"})
        response_json = response.json()
    
        return response_json
    except Exception as e:
        print(f"Error getting courses: {e}")
        return []

def get_all_assignments():
    all_course_ids = []
    course_id_to_name = {} 
    all_courses = get_all_available_canvas_courses()
    all_assignment_info = []

    # set course id to name 
    for course in all_courses:
        course_id_to_name[course['id']] = course['name']
        all_course_ids.append(course['id'])
        

    # here we append all the assignments to the list and just return the list
    for course_id in all_course_ids:
        canvas_assignments = get_canvas_assignments(course_id)
        for assignment in canvas_assignments:
            cleaned_up_assignment_info = {}
            cleaned_up_assignment_info["assignment_id"] = assignment["id"]
            cleaned_up_assignment_info["course_id"] = assignment["course_id"]
            cleaned_up_assignment_info["assignment_name"] = assignment["name"]
            cleaned_up_assignment_info["assignment_description"] = assignment["description"]
            cleaned_up_assignment_info["course_name"] = course_id_to_name[assignment["course_id"]]  
            all_assignment_info.append(cleaned_up_assignment_info)
            
    return all_assignment_info


def get_all_course_with_ids_and_names():
    try:
        response = requests.get("https://canvas.instructure.com/api/v1/courses?per_page=100", headers={"Authorization": f"{os.getenv('CANVAS_TOKEN')}"})
        response_json = response.json()
        cleaned_up_response = []
        for course in response_json:
            if "access_restricted_by_date" not in course:
                cleaned_up_response.append({"id": course["id"], "name": course["name"]})
        return cleaned_up_response
    except Exception as e:
        print(f"Error getting courses: {e}")
        return []

def get_canvas_assignment_names(course_id: int):
    try:
        response = requests.get(f"https://canvas.instructure.com/api/v1/courses/{course_id}/assignments", headers={"Authorization": f"{os.getenv('CANVAS_TOKEN')}"})
        response_json = response.json()
        
        cleaned_assignments = []
        for assignment in response_json:
            cleaned_assignments.append({
                "id": assignment["id"],
                "name": assignment["name"],
                "description": assignment.get("description", "")
            })
    
        return cleaned_assignments
    except Exception as e:
        print(f"Error getting assignments: {e}")
        return []

def get_canvas_assignment_info(course_id: str, assignment_id: str):
    try:
        response = requests.get(f"https://canvas.instructure.com/api/v1/courses/{course_id}/assignments/{assignment_id}", headers={"Authorization": f"{os.getenv('CANVAS_TOKEN')}"})
        response_json = response.json()
        
        cleaned_assignment = []
        cleaned_assignment.append({
            "id": response_json["id"],
            "name": response_json["name"],
            "description": response_json.get("description", "")
        })
    
        return cleaned_assignment[0]
    except Exception as e:
        print(f"Error getting assignment: {e}")
        return {}