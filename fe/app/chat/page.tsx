"use client";

import { useEffect, useState } from "react";
import Markdown from 'react-markdown'
import LeftSidebarContainer from "@/components/sidebar/LeftSidebarContainer";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DrawingCanvas } from "@/components/DrawingCanvas";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Message {
  type: string;
  message: string;
}

const isBase64PNG = (str: string): boolean => {
  const pngBase64Prefix = "data:image/png;base64,";
  return str.trim().startsWith(pngBase64Prefix);
};

export default function ChatPage() {
  const initialGreeting = {
    type: "assistant",
    message: "How can I help you?"
  };

  const [messages, setMessages] = useState<Message[]>([initialGreeting]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDrawingModalOpen, setIsDrawingModalOpen] = useState(false);
  const [isImageSaving, setIsImageSaving] = useState(false);

  const setMessagesWithGreeting = (newMessages: Message[]) => {
    setMessages([initialGreeting, ...newMessages]);
  };

  const fetchMessages = async () => {
    const response = await fetch("http://localhost:8000/message");
    const data = await response.json();
    setMessagesWithGreeting(data);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/canvas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: input }),
      });

      if (!response.ok) throw new Error("Failed to send message");
      
      const data = await response.text();
      setInput("");
      await fetchMessages(); // Refresh messages after sending
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrawingSave = async (imageData: string) => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/image-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ base64_image: imageData }),
      });

      if (!response.ok) {
        throw new Error("Failed to process image");
      }

      await fetchMessages();
      setIsDrawingModalOpen(false);  
    } catch (error) {
      console.error("Error processing drawing:", error);
      alert("Failed to process image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <LeftSidebarContainer 
        setMessageState={setMessagesWithGreeting} 
        setParentLoading={setLoading} 
      />
      <main className="flex-1 p-4 flex flex-col">
        <div className="flex-1 p-5 overflow-y-auto mb-4 space-y-4">
          {loading ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                <div className="space-y-2 flex-1 self-start">
                  <Skeleton className="h-4 w-[80%]" />
                  <Skeleton className="h-4 w-[60%]" />
                  <Skeleton className="h-4 w-[70%]" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                <div className="space-y-2 flex-1 self-start">
                  <Skeleton className="h-4 w-[75%]" />
                  <Skeleton className="h-4 w-[65%]" />
                </div>
              </div>
            </div>
          ) : (
            messages && messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-center gap-4 ${
                  message.type === "human"
                    ? "flex-row-reverse"
                    : "flex-row"
                }`}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  {message.type === "human" ? (
                    <>
                      <AvatarImage src="/tvman.jpg" />
                      <AvatarFallback>U</AvatarFallback>
                    </>
                  ) : (
                    <>
                      <AvatarImage src="/calvin.jpg" />
                      <AvatarFallback>A</AvatarFallback>
                    </>
                  )}
                </Avatar>
                <div
                  className={`p-4 rounded-lg self-start ${
                    message.type === "human"
                      ? "bg-blue-100"
                      : "bg-gray-100"
                  } ${isBase64PNG(message.message) ? 'w-fit' : 'max-w-[80%]'}`}
                >
                  {isBase64PNG(message.message) ? (
                    <img 
                      src={message.message} 
                      alt="Generated content"
                      className="max-w-full h-auto rounded-lg"
                    />
                  ) : (
                    <Markdown>
                      {message.message}
                    </Markdown>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2 p-2 bg-white rounded-xl shadow-md border">
          <Dialog open={isDrawingModalOpen} onOpenChange={setIsDrawingModalOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 border border-gray-200"
                disabled={loading}
              >
                <Pencil className="h-5 w-5" />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>
                  {isImageSaving ? "Processing Image..." : "Whiteboard"}
                </DialogTitle>
              </DialogHeader>
              <div className="w-full bg-white rounded-lg">
                {loading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Skeleton className="w-[500px] h-[400px] rounded-lg" />
                    <div className="flex gap-4 mb-2">
                      <Skeleton className="w-20 h-10 rounded-lg" />
                      <Skeleton className="w-20 h-10 rounded-lg" />
                    </div>
                  </div>
                ) : (
                  <DrawingCanvas 
                    onSave={handleDrawingSave} 
                    onSavingChange={setIsImageSaving}
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-lg"
            disabled={loading}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !input.trim()}
          >
            Send
          </button>
        </form>
      </main>
    </div>
  );
}