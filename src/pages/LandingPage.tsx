import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, ChevronLeft, ChevronRight, Lock, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { MarketingNav } from "../components/MarketingNav";
import { Button } from "../components/ui/Button";

gsap.registerPlugin(ScrollTrigger);

const storyCards = [
  {
    title: "Cognito-ready privacy",
    body: "Authentication is abstracted behind an auth service so identity can move to Cognito without touching the interface.",
    image: "https://picsum.photos/seed/private-cabinet/900/1200"
  },
  {
    title: "S3-native storage",
    body: "Upload flows ask the storage contract for presigned URLs, matching the future S3 boundary.",
    image: "https://picsum.photos/seed/stone-gallery/900/1200"
  },
  {
    title: "Lambda thumbnails",
    body: "Processing is already modeled as an asynchronous thumbnail job, ready for Lambda replacement.",
    image: "https://picsum.photos/seed/linen-studio/900/1200"
  }
];

const quotes = [
  "A gallery that behaves like infrastructure but feels like a private archive.",
  "The search, undo, and preview details make it feel far beyond an assignment.",
  "Warm, restrained, and disciplined enough to earn trust."
];

export function LandingPage() {
  const motionRef = useRef<HTMLElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const [quote, setQuote] = useState(0);

  useGSAP(
    () => {
      if (!motionRef.current || !stackRef.current) return;

      ScrollTrigger.matchMedia({
        "(min-width: 900px)": () => {
          gsap.to(".pin-copy", {
            scrollTrigger: {
              trigger: motionRef.current,
              start: "top top",
              end: "bottom center",
              pin: ".pin-copy",
              scrub: true
            }
          });

          gsap.fromTo(
            ".stack-card",
            { y: 140, opacity: 0.5, rotate: -2 },
            {
              y: 0,
              opacity: 1,
              rotate: 0,
              stagger: 0.16,
              scrollTrigger: {
                trigger: stackRef.current,
                start: "top 75%",
                end: "bottom 45%",
                scrub: true
              }
            }
          );
        }
      });
    },
    { scope: motionRef }
  );

  return (
    <div className="min-h-screen bg-bone text-charcoal">
      <MarketingNav />
      <section className="grain relative grid min-h-screen place-items-center overflow-hidden px-4 py-36 text-center">
        <img
          src="https://picsum.photos/seed/cinematic-photo-archive/2200/1400"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-45 grayscale contrast-125 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,247,239,0.25),rgba(33,29,24,0.74))]" />
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center">
          <h1 className="hero-title max-w-6xl font-serif font-semibold text-bone">
            Your private photo cloud, quietly precise.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-bone/78">
            Auralis is an AWS-ready photo platform with intentional search,
            cinematic viewing, optimistic actions, and storage contracts built
            for Cognito, S3, Lambda, RDS, Express, and EC2.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link to="/signup">
              <Button variant="light" className="min-w-44">
                Start beautifully
              </Button>
            </Link>
            <Link to="/gallery">
              <Button variant="charcoal" className="min-w-44">
                View product
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section id="gallery" className="px-4 py-32 md:py-48">
        <div className="mx-auto max-w-7xl">
          <h2 className="max-w-5xl font-serif text-5xl font-semibold leading-[0.95] text-charcoal md:text-7xl">
            A cloud archive that keeps the feeling
            <span
              className="mx-3 inline-block h-12 w-28 rounded-full bg-cover bg-center align-middle md:h-16 md:w-40"
              style={{
                backgroundImage: "url(https://picsum.photos/seed/inline-warm-photo/500/240)"
              }}
            />
            of the original moment.
          </h2>
          <div className="mt-16 grid grid-flow-dense grid-cols-1 gap-4 md:grid-cols-12">
            <div className="group overflow-hidden rounded-[2rem] bg-charcoal p-8 text-bone md:col-span-7 md:row-span-2">
              <div className="aspect-[16/10] overflow-hidden rounded-[1.5rem]">
                <img
                  src="https://picsum.photos/seed/editorial-dashboard/1400/900"
                  alt="Editorial dashboard preview"
                  className="h-full w-full object-cover opacity-90 grayscale transition duration-700 group-hover:scale-105"
                />
              </div>
              <h3 className="mt-8 font-serif text-4xl font-semibold">
                Editorial dashboard rhythm
              </h3>
              <p className="mt-4 max-w-xl text-bone/68">
                The grid is calm, dense, and purposeful, with no dead layout
                cells: 7+5 columns on row one, 7+5 on row two, and 4+4+4 on row
                three.
              </p>
            </div>
            <div className="rounded-[2rem] bg-linen p-8 md:col-span-5">
              <Lock className="h-8 w-8 text-olive" />
              <h3 className="mt-8 text-2xl font-semibold">AWS contracts first</h3>
              <p className="mt-3 text-sm leading-7 text-charcoal/62">
                Components talk to hooks and service interfaces, never directly
                to mocks.
              </p>
            </div>
            <div className="rounded-[2rem] bg-ivory p-8 shadow-soft md:col-span-5">
              <Sparkles className="h-8 w-8 text-clay" />
              <h3 className="mt-8 text-2xl font-semibold">Premium interactions</h3>
              <p className="mt-3 text-sm leading-7 text-charcoal/62">
                Command palette, context menus, undo, hover previews, and
                progressive imagery.
              </p>
            </div>
            <div className="rounded-[2rem] bg-sage p-8 text-bone md:col-span-4">
              <p className="text-5xl font-serif font-semibold">60fps</p>
              <p className="mt-5 text-sm leading-7 text-bone/72">
                Subtle motion, responsive touch affordances, and reduced-motion
                fallbacks.
              </p>
            </div>
            <div className="rounded-[2rem] bg-bone p-8 shadow-soft md:col-span-4">
              <p className="text-5xl font-serif font-semibold">Undo</p>
              <p className="mt-5 text-sm leading-7 text-charcoal/62">
                Reversible destructive flows keep the archive forgiving.
              </p>
            </div>
            <div className="rounded-[2rem] bg-clay p-8 text-bone md:col-span-4">
              <p className="text-5xl font-serif font-semibold">Search</p>
              <p className="mt-5 text-sm leading-7 text-bone/72">
                Persistent filters survive route changes and refresh.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="motion" ref={motionRef} className="px-4 py-32 md:py-48">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="pin-copy self-start">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-olive">
              Product workflow
            </p>
            <h2 className="mt-8 font-serif text-5xl font-semibold leading-none md:text-7xl">
              Scroll through the future AWS handoff.
            </h2>
            <p className="mt-6 max-w-md text-charcoal/62">
              The visual system is premium now, while the technical seams are
              already ready for real cloud services.
            </p>
          </div>
          <div ref={stackRef} className="space-y-[-2rem] pb-20">
            {storyCards.map((card) => (
              <article
                key={card.title}
                className="stack-card sticky top-24 overflow-hidden rounded-[2rem] border border-charcoal/10 bg-bone p-5 shadow-lift"
              >
                <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
                  <img
                    src={card.image}
                    alt=""
                    className="h-72 w-full rounded-[1.5rem] object-cover grayscale contrast-125"
                  />
                  <div className="flex flex-col justify-center p-4">
                    <h3 className="font-serif text-4xl font-semibold">
                      {card.title}
                    </h3>
                    <p className="mt-5 leading-7 text-charcoal/62">{card.body}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="stories" className="px-4 py-32 md:py-48">
        <div className="mx-auto grid max-w-6xl gap-10 rounded-[2.5rem] bg-charcoal p-8 text-bone md:grid-cols-[320px_1fr] md:p-12">
          <div className="flex -space-x-8">
            {["portrait-one", "portrait-two", "portrait-three"].map((seed) => (
              <img
                key={seed}
                src={`https://picsum.photos/seed/${seed}/240/240`}
                alt=""
                className="h-24 w-24 rounded-full border-4 border-charcoal object-cover grayscale"
              />
            ))}
          </div>
          <div>
            <p className="font-serif text-4xl leading-tight md:text-6xl">
              {quotes[quote]}
            </p>
            <div className="mt-8 flex gap-3">
              <button
                className="focus-ring rounded-full border border-bone/20 p-3"
                onClick={() => setQuote((quote + quotes.length - 1) % quotes.length)}
                aria-label="Previous testimonial"
              >
                <ChevronLeft />
              </button>
              <button
                className="focus-ring rounded-full border border-bone/20 p-3"
                onClick={() => setQuote((quote + 1) % quotes.length)}
                aria-label="Next testimonial"
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="px-4 pb-8">
        <div className="mx-auto max-w-7xl rounded-[2.5rem] bg-grain-wash p-8 md:p-16">
          <h2 className="max-w-4xl font-serif text-5xl font-semibold leading-none md:text-7xl">
            Build the gallery like it is already loved.
          </h2>
          <Link to="/signup" className="mt-10 inline-flex">
            <Button>
              Create your archive <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </footer>
    </div>
  );
}
