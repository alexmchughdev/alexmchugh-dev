// import Nav from '@/components/Nav'; // disabled: Hero's `ls ~/` acts as the site index
import Hero from '@/components/Hero';
import About from '@/components/About';
// import Projects from '@/components/Projects'; // disabled: re-enable by uncommenting this and the <Projects /> tag below
import GitHub from '@/components/GitHub';
import Articles from '@/components/Articles';
import CV from '@/components/CV';
import Experience from '@/components/Experience';
import Certifications from '@/components/Certifications';
import Education from '@/components/Education';
import Footer from '@/components/Footer';
import RevealOnScroll from '@/components/RevealOnScroll';

export default function Home() {
  return (
    <>
      {/* <Nav /> */}
      <main className="relative overflow-hidden">
        <Hero />
        <About />
        <Experience />
        <Education />
        <Certifications />
        <GitHub />
        {/* <Projects /> */}
        <Articles />
        <CV />
      </main>
      <Footer />
      <RevealOnScroll />
    </>
  );
}
