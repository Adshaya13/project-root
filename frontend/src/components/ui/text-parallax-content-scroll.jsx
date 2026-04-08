import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export const TextParallaxContentExample = () => {
  return (
    <div className="bg-white">
      <TextParallaxContent
        imgUrl="/images/hero1.png"
        subheading="Smart Campus"
        heading="Manage campus. Simplify operations."
      >
        <ExampleContent title="The Future of University Operations" showImage />
      </TextParallaxContent>
      <TextParallaxContent
        imgUrl="/images/hero2.png"
        subheading="Facilities"
        heading="Book spaces instantly."
      >
        <ExampleContent title="Seamless Facility Management" />
      </TextParallaxContent>
      <TextParallaxContent
        imgUrl="/images/hero3.png"
        subheading="Maintenance"
        heading="Report issues faster."
      >
        <ExampleContent title="Efficient Issue Resolution" />
      </TextParallaxContent>
    </div>
  );
};

const IMG_PADDING = 12;

const TextParallaxContent = ({ imgUrl, subheading, heading, children }) => {
  return (
    <div
      style={{
        paddingLeft: IMG_PADDING,
        paddingRight: IMG_PADDING,
      }}
    >
      <div className="relative h-[150vh]">
        <StickyImage imgUrl={imgUrl} />
        <OverlayCopy heading={heading} subheading={subheading} />
      </div>
      {children}
    </div>
  );
};

const StickyImage = ({ imgUrl }) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["end end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <motion.div
      style={{
        backgroundImage: `url(${imgUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: `calc(100vh - ${IMG_PADDING * 2}px)`,
        top: IMG_PADDING,
        scale,
      }}
      ref={targetRef}
      className="sticky z-0 overflow-hidden rounded-3xl"
    >
      <motion.div
        className="absolute inset-0 bg-neutral-950/70"
        style={{
          opacity,
        }}
      />
    </motion.div>
  );
};

const OverlayCopy = ({ subheading, heading }) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [250, -250]);
  const opacity = useTransform(scrollYProgress, [0.25, 0.5, 0.75], [0, 1, 0]);

  return (
    <motion.div
      style={{
        y,
        opacity,
      }}
      ref={targetRef}
      className="absolute left-0 top-0 flex h-screen w-full flex-col items-center justify-center text-white"
    >
      <p className="mb-2 text-center text-xl md:mb-4 md:text-3xl">
        {subheading}
      </p>
      <p className="text-center text-4xl font-bold md:text-7xl">{heading}</p>
    </motion.div>
  );
};

const ExampleContent = ({ title, showImage = false }) => (
  <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 pb-24 pt-12 md:grid-cols-12">
    <h2 className="col-span-1 text-3xl font-bold md:col-span-4 font-['Cabinet_Grotesk'] text-slate-900">
      {title}
    </h2>
    <div className="col-span-1 md:col-span-8">
      <p className="mb-4 text-xl text-slate-600 md:text-2xl font-['Manrope']">
        Campus Hub provides a centralized platform to manage facility bookings, 
        equipment reservations, and maintenance requests. Students and staff can 
        easily request resources, report issues, and track updates in real-time.
      </p>
      <p className="mb-8 text-xl text-slate-600 md:text-2xl font-['Manrope']">
        The system improves campus productivity by reducing manual processes and 
        ensuring smooth communication between users and administrators.
      </p>
      
      {showImage && (
        <div className="mb-8 rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
          <img 
            src="/images/section.png" 
            alt="Students using digital dashboard" 
            className="w-full object-cover h-[300px]"
          />
        </div>
      )}

      <button className="w-full rounded-xl bg-orange-500 px-9 py-4 text-xl font-semibold text-white transition-colors hover:bg-orange-600 md:w-fit flex items-center justify-center gap-2">
        Get Started <ArrowUpRight className="w-5 h-5" />
      </button>
    </div>
  </div>
);
