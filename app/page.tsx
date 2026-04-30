'use client'

import { useState } from 'react'
import { Preloader } from './components/Preloader'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { ServicesIntro } from './components/ServicesIntro'
import { GallerySection } from './components/GallerySection'
import { TestimonialsSection } from './components/TestimonialsSection'
import { FAQSection } from './components/FAQSection'
import { ContactSection } from './components/ContactSection'
import { Footer } from './components/Footer'

export default function Home() {
  const [ready, setReady] = useState(false)

  return (
    <>
      <Preloader onComplete={() => setReady(true)} />
      <Navbar />
      <main style={{ width: '100%' }}>
        <Hero ready={ready} />
        <ServicesIntro />
        <GallerySection />
        <TestimonialsSection />
        <FAQSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}
