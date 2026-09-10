import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingNews from '../components/FloatingNews';
import AnimatedOutlet from '../components/AnimatedOutlet';

const PublicLayout: React.FC = () => (
  <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
    <Navbar />
    <main className="flex-1">
      <AnimatedOutlet />
    </main>
    <FloatingNews />
    <Footer />
  </div>
);

export default PublicLayout;
