import Hero from '@/components/Hero';
import About from '@/components/About';
import GitHub from '@/components/GitHub';
import Articles from '@/components/Articles';
import Experience from '@/components/Experience';
import Certifications from '@/components/Certifications';
import Education from '@/components/Education';
import Footer from '@/components/Footer';
import RevealOnScroll from '@/components/RevealOnScroll';

export default function Home() {
  return (
    <>
      <main className="relative overflow-hidden">
        <Hero />
        <About />
        <Experience />
        <Education />
        <Certifications />
        <GitHub />
        <Articles />
      </main>
      <Footer />
      <RevealOnScroll />
    </>
  );
}
