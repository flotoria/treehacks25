"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 gap-8">
      <div className="relative w-[500px] h-[300px]">
        <Image
          src="/logo.jpg"
          alt="Calvin"
          fill
          className="object-contain rounded-xl"
          priority
        />
      </div>
      <Button 
        onClick={() => router.push('/chat')}
        size="lg"
        className="text-lg px-8 py-6"
      >
        main page please
      </Button>
    </main>
  );
}
