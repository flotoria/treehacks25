"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";

interface Course {
  id: number;
  name: string;
}

interface Assignment {
  id: number;
  name: string;
  description: string;
}

interface Message {
  type: 'human' | 'assistant' | 'loading';
  message: string;
}

export default function LeftSidebarContainer({
  setMessageState,
  setParentLoading
}: {
  setMessageState: (messages: Message[]) => void,
  setParentLoading: (loading: boolean) => void
}) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("http://localhost:8000/courses");
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!selectedCourseId || selectedCourseId === "general") return;
      
      try {
        const response = await fetch("http://localhost:8000/assignments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ course_id: selectedCourseId }),
        });
        const data = await response.json();
        setAssignments(data);
      } catch (error) {
        console.error("Error fetching assignments:", error);
      }
    };
    fetchAssignments();
  }, [selectedCourseId]);

  const handleClearHistory = async () => {
    try {
      await fetch("http://localhost:8000/delete");
      setMessageState([]);
    } catch (error) {
      console.error("Error clearing history:", error);
    }
  };

  const handleRAG = async () => {
    try {
      setIsLoading(true);
      setParentLoading(true);
      await fetch("http://localhost:8000/rag");
      setMessageState([]);
    } catch (error) {
      console.error("Error updating data:", error);
      setMessageState([{ type: 'assistant', message: 'Error: Failed to get response. Please try again.' }]);
    } finally {
      setIsLoading(false);
      setParentLoading(false);
    }
  };

  const handleAssignmentClick = async (assignmentId: string) => {
    setSelectedAssignmentId(assignmentId);
    if (!assignmentId) return;
    
    try {
      setIsLoading(true);
      setParentLoading(true);
      await fetch("http://localhost:8000/rag-specific", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course_id: selectedCourseId,
          assignment_id: assignmentId,
        }),
      });
      setMessageState([]);
    } catch (error) {
      console.error("Error fetching rag-specific data:", error);
      setMessageState([{ type: 'assistant', message: 'Error: Failed to get response. Please try again.' }]);
    } finally {
      setIsLoading(false);
      setParentLoading(false);
    }
  };

  const handleCourseSelect = async (courseId: string) => {
    setSelectedCourseId(courseId);
    if (courseId === "general") {
      await handleRAG();
    }
  };

  return (
    <div className="w-64 bg-gray-100 p-4 flex flex-col h-full">
      <div className="flex flex-col flex-grow space-y-4 overflow-hidden">
        <Image src="/logo.png" alt="logo" width={200} height={100} />
        <Select onValueChange={handleCourseSelect} value={selectedCourseId}>
          <SelectTrigger className="w-full" disabled={isLoading}>
            <SelectValue placeholder="Select a course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id.toString()}>
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isLoading && (
          <div className="flex justify-center items-center py-4">
            <Spinner className="h-6 w-6" />
          </div>
        )}

        {selectedCourseId && selectedCourseId !== "general" && assignments.length > 0 && !isLoading && (
          <ScrollArea className="flex-grow rounded-md">
            <div className="space-y-2 pr-4">
              {assignments.map((assignment) => (
                <Button
                  key={assignment.id}
                  variant={selectedAssignmentId === assignment.id.toString() ? "default" : "outline"}
                  className="w-full justify-start font-normal whitespace-normal text-left h-auto"
                  onClick={() => handleAssignmentClick(assignment.id.toString())}
                >
                  {assignment.name}
                </Button>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <Button
          onClick={handleRAG}
          variant="default"
          className="flex-1 bg-green-500"
          disabled={isLoading}
        >
          Update
        </Button>
        <Button
          onClick={handleClearHistory}
          variant="destructive"
          className="flex-1 bg-red-500"
          disabled={isLoading}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}