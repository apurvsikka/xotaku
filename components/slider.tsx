"use client";

import React, { useState } from "react";
import Image from "next/image";
import styled from "styled-components";
import { ChevronLeft, ChevronRight, Play, Info } from "lucide-react";

interface Slide {
  id: string;
  title: string;
  description: string;
  image: string;
  latestChapter?: string;
  dominantColors: {
    gradient: string;
  };
}

interface SliderProps {
  slides: Slide[];
  primaryActionLabel: string;
  secondaryActionLabel: string;
}

const SliderContainer = styled.div`
  position: relative;
  width: 100%;
  max-height: 600px;
  overflow: hidden;
  background: #111;
  user-select: none;
`;

const SliderTrack = styled.div<{ current: number }>`
  position: absolute;
  inset: 0;
  display: flex;
  transform: ${({ current }) => `translateX(-${current * 100}%)`};
  transition: transform 0.6s ease-in-out;
`;

const SlideItem = styled.div`
  position: relative;
  flex-shrink: 0;
  width: 100%;
  height: 100%;
`;

const Overlay = styled.div<{ gradient: string }>`
  position: absolute;
  inset: 0;
  background: ${({ gradient }) => gradient};
  opacity: 0.6;
  mix-blend-mode: multiply;
`;

const GradientLeft = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, black, rgba(0, 0, 0, 0.8), transparent);
`;

const GradientBottom = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
`;

const NavButton = styled.button`
  background: rgba(0, 0, 0, 0.4);
  color: white;
  padding: 0.5rem;
  border-radius: 0.25rem;
  backdrop-filter: blur(6px);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: scale(1.05);
    background: rgba(0, 0, 0, 0.6);
  }
`;

const Dot = styled.button<{ active: boolean }>`
  width: ${({ active }) => (active ? "10px" : "8px")};
  height: ${({ active }) => (active ? "10px" : "8px")};
  border-radius: 50%;
  background: ${({ active }) => (active ? "white" : "rgba(255,255,255,0.4)")};
  transition: all 0.3s;
`;

const ActionButton = styled.button<{ variant?: "solid" | "outline" }>`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;

  ${({ variant }) =>
    variant === "outline"
      ? `
    background: transparent;
    border: 1px solid white;
    color: white;
    &:hover { background: rgba(255,255,255,0.1); }
  `
      : `
    background: white;
    color: black;
    border: none;
    &:hover { background: #ddd; }
  `}
`;

export const Slider: React.FC<SliderProps> = ({
  slides,
  primaryActionLabel,
  secondaryActionLabel,
}) => {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <SliderContainer className="h-[45vh] lg:rounded-md md:h-[60vh]">
      <SliderTrack current={current}>
        {slides.map((s, i) => (
          <SlideItem key={s.id}>
            <Image src={s.image} alt={s.title} fill className="object-cover" />
            <Overlay gradient={s.dominantColors.gradient} />
            <GradientLeft />
            <GradientBottom />
            {i === current && (
              <div style={{ position: "absolute", bottom: "15%", left: "5%", color: "white" }}>
                <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>{s.title}</h1>
                <p style={{ maxWidth: "500px", marginTop: "0.5rem", opacity: 0.8 }}>
                  {s.description}
                </p>
                <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                  <ActionButton>
                    <Play size={16} /> {primaryActionLabel}
                  </ActionButton>
                  <ActionButton variant="outline">
                    <Info size={16} /> {secondaryActionLabel}
                  </ActionButton>
                </div>
              </div>
            )}
          </SlideItem>
        ))}
      </SliderTrack>

      {/* Navigation */}
      <div
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          display: "flex",
          gap: "0.5rem",
        }}
      >
        <NavButton onClick={prevSlide}>
          <ChevronLeft size={20} />
        </NavButton>
        <NavButton onClick={nextSlide}>
          <ChevronRight size={20} />
        </NavButton>
      </div>

      {/* Dots */}
      <div
        style={{
          position: "absolute",
          bottom: "1rem",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "0.5rem",
        }}
      >
        {slides.map((_, i) => (
          <Dot key={i} active={i === current} onClick={() => setCurrent(i)} />
        ))}
      </div>
    </SliderContainer>
  );
};
