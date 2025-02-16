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

interface Message {
  type: string;
  message: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDrawingModalOpen, setIsDrawingModalOpen] = useState(false);

  const fetchMessages = async () => {
    const response = await fetch("http://localhost:8000/message");
    const data = await response.json();
    setMessages(data);
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

  const handleDrawingSave = (imageData: string) => {
    // Here you can handle the drawing data
    console.log('Drawing saved:', imageData);
    setIsDrawingModalOpen(false);
  };

  return (
    <div className="flex h-screen">
      <LeftSidebarContainer setMessageState={setMessages} setParentLoading={setLoading} />
      <main className="flex-1 p-4 flex flex-col">
        <div className="flex-1 p-5 overflow-y-auto mb-4 space-y-4">
          {loading ? (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Skeleton className="h-8 w-8" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[80%]" />
                  <Skeleton className="h-4 w-[60%]" />
                  <Skeleton className="h-4 w-[70%]" />
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Skeleton className="h-8 w-8" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[75%]" />
                  <Skeleton className="h-4 w-[65%]" />
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Skeleton className="h-8 w-8" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[70%]" />
                  <Skeleton className="h-4 w-[50%]" />
                  <Skeleton className="h-4 w-[60%]" />
                </div>
              </div>
            </div>
          ) : (
            messages && messages.map((message, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg max-w-[80%] ${
                  message.type === "human"
                    ? "bg-blue-100 ml-auto"
                    : "bg-gray-100"
                }`}
              >
                <Markdown>
                  {message.message}
                </Markdown>
              </div>
            ))
          )}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Dialog open={isDrawingModalOpen} onOpenChange={setIsDrawingModalOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                className="p-2 text-gray-500 rounded-lg hover:bg-gray-100"
                disabled={loading}
              >
                <Pencil className="h-5 w-5" />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] sm:max-h-[800px]">
              <DialogHeader>
                <DialogTitle>Whiteboard</DialogTitle>
              </DialogHeader>
              <div className="w-full h-[600px] bg-white rounded-lg">
                <DrawingCanvas onSave={handleDrawingSave} />
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