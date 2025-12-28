import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HomeProps {
  onStart: () => void;
}

const Home: React.FC<HomeProps> = ({ onStart }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-white text-center p-8">
      <div className="max-w-md w-full">
        <div className="w-16 h-16 bg-black mx-auto mb-12 flex items-center justify-center rounded-full">
            <span className="text-white font-serif text-2xl">日</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-light text-zinc-900 mb-8 tracking-tight">
          NihongoFlow
        </h1>
        
        <p className="text-zinc-500 text-lg font-light leading-relaxed mb-16">
          Focus. Breathe. Learn.<br/>
          Master the scripts in silence.
        </p>
        
        <button 
          onClick={onStart}
          className="group relative inline-flex items-center justify-center gap-4 px-12 py-4 bg-transparent border border-zinc-200 rounded-full text-zinc-900 transition-all hover:border-black hover:bg-black hover:text-white"
        >
          <span className="text-sm uppercase tracking-widest font-medium">Enter</span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default Home;