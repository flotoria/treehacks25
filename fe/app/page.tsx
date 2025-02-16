"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");

  const handleSubmit = () => {
    if (!apiKey.trim()) {
      alert("Please enter an API key");
      return;
    }
    // Store API key in localStorage
    localStorage.setItem("apiKey", apiKey);
    router.push('/chat');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 gap-8">
      <div className="relative w-[500px] h-[300px]">
        <Image
          src="/logo.png"
          alt="Calvin"
          fill
          className="object-contain rounded-xl"
          priority
        />
      </div>
      <div className="flex flex-col items-center gap-4 w-full max-w-md">
        <Input
          type="password"
          placeholder="Enter your API key"
          value={apiKey}
          onChange={(e: any) => setApiKey(e.target.value)}
          className="text-lg p-6"
        />
        <Button 
          onClick={handleSubmit}
          size="lg"
          disabled={!apiKey}
          className="text-lg px-8 py-6 w-full"
        >
          main page please
        </Button>
      </div>
    </main>
  );
}
