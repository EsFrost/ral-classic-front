"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUp } from "lucide-react";

interface Color {
  RAL: string;
  RGB: string;
  HEX: string;
  CMYK: string;
  LRV: number | null;
  English: string;
  German: string;
  French: string;
  Spanish: string;
  Italian: string;
  Dutch: string;
}

export default function Home() {
  const [colors, setColors] = useState<Color[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showGoToTop, setShowGoToTop] = useState(false);

  useEffect(() => {
    const fetchColors = async () => {
      try {
        const storedColors = localStorage.getItem("colors");
        if (storedColors) {
          setColors(JSON.parse(storedColors));
          setIsLoading(false);
          return;
        }
        const res = await fetch("http://192.168.1.190:4000/api/colors");
        const data = await res.json();
        setColors(data);
        localStorage.setItem("colors", JSON.stringify(data));
      } catch (err) {
        console.error("Error fetching colors: ", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchColors();

    const handleScroll = () => {
      setShowGoToTop(window.scrollY > window.innerHeight);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <h3 className="text-lg">Loading RAL colors...</h3>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h3 className="text-xl mb-6 text-center">RAL Color Grid</h3>
      <div className="mb-6 text-center">
        <Link href={"/"}>Go back</Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {colors.map((color) => (
          <div
            key={color.RAL}
            className="border border-gray-200 rounded-md overflow-hidden"
          >
            <div
              className="h-32 w-full"
              style={{ backgroundColor: color.HEX }}
            ></div>
            <div className="p-4">
              <h3 className="font-semibold">{color.RAL}</h3>
              <p>{color.English}</p>
            </div>
          </div>
        ))}
      </div>
      {showGoToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 bg-black text-white p-2 rounded-full shadow-lg hover:bg-gray-800 transition-colors duration-300"
          aria-label="Go to top"
        >
          <ArrowUp size={24} />
        </button>
      )}
    </div>
  );
}
