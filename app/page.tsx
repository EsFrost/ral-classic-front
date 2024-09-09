"use client";
import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import Link from "next/link";

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Color[]>([]);
  const [displayColors, setDisplayColors] = useState<Color[]>([]);

  useEffect(() => {
    const fetchColors = async () => {
      try {
        const storedColors = localStorage.getItem("colors");
        if (storedColors) {
          const parsedColors = JSON.parse(storedColors);
          setColors(parsedColors);
          setDisplayColors(parsedColors);
          setIsLoading(false);
          return;
        }
        const res = await fetch("http://192.168.1.190:4000/api/colors", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          mode: "cors",
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setColors(data);
        setDisplayColors(data);
        localStorage.setItem("colors", JSON.stringify(data));
      } catch (err) {
        console.error("Error fetching colors: ", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchColors();
  }, []);

  const handleNavigation = (dir: "next" | "prev") => {
    if (isAnimating) return;
    setDirection(dir);
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => {
        if (dir === "next") {
          return prevIndex + 4 >= displayColors.length ? 0 : prevIndex + 4;
        } else {
          return prevIndex - 4 < 0 ? displayColors.length - 4 : prevIndex - 4;
        }
      });
      if (searchResults.length > 0) {
        setDisplayColors(colors);
        setSearchResults([]);
        setSearchTerm("");
      }
      setIsAnimating(false);
    }, 500);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchTerm) {
      resetSearch();
      return;
    }
    const results = colors.filter(
      (color) =>
        color.RAL.toLowerCase().includes(searchTerm.toLowerCase()) ||
        color.English.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (results.length > 0) {
      const index = colors.findIndex((color) => color.RAL === results[0].RAL);
      const displayResults = colors.slice(index, index + 4);
      setSearchResults(displayResults);
      setDisplayColors(displayResults);
      setCurrentIndex(0);
    } else {
      setSearchResults([]);
    }
  };

  const resetSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setDisplayColors(colors);
    setCurrentIndex(0);
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => handleNavigation("next"),
    onSwipedRight: () => handleNavigation("prev"),
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center mt-8 items-center">
        <div className="w-80">
          <div className="flex">
            <div className="flex-shrink-0 w-80">
              <div className="border border-white rounded-tl-md rounded-tr-md relative h-[calc(100vh-96px)] mt-6 justify-center items-center flex">
                <h3 className="p-4 text-lg">RAL colors - By Sigmund Frost</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentColors = displayColors.slice(currentIndex, currentIndex + 4);

  return (
    <>
      <div className="flex flex-col items-center mt-8">
        <form onSubmit={handleSearch} className="mb-4 flex">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search based on RAL or name"
            className="px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-white text-gray-800 w-[268px]"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-black border border-white text-white rounded-r-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
          >
            <Search size={20} />
          </button>
        </form>
        <div className="flex items-center">
          <ArrowLeft
            className="mr-8 cursor-pointer hidden md:block"
            onClick={() => handleNavigation("prev")}
          />
          <div {...handlers} className="relative overflow-hidden w-80">
            <div
              className={`flex transition-all duration-500 ease-in-out ${
                isAnimating
                  ? direction === "next"
                    ? "-translate-x-full opacity-0"
                    : "translate-x-full opacity-0"
                  : "translate-x-0 opacity-100"
              }`}
            >
              <div className="flex-shrink-0 w-80">
                <div className="border border-white rounded-tl-md rounded-tr-md relative">
                  {currentColors.map((color) => (
                    <div key={color.RAL}>
                      <h3 className="p-4">
                        {color.RAL} - {color.English}
                      </h3>
                      <div
                        className="w-full h-32"
                        style={{ backgroundColor: color.HEX }}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <ArrowRight
            className="ml-8 cursor-pointer hidden md:block"
            onClick={() => handleNavigation("next")}
          />
        </div>
      </div>
      <div className="mt-6 text-center">
        <Link href={`/allcolors`}>Show all colors</Link>
      </div>
    </>
  );
}
