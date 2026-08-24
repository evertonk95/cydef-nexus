import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { ArrowRight, Play, Check, Shield, ScanLine, Lock, Sparkles, Quote } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const Index = () => {
  useScrollReveal();
  const [activeStep, setActiveStep] = useState(1);

  // Auto-rotate steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev % 3) + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-white font-sans antialiased overflow-x-hidden selection:bg-orange-500/30 flex flex-col min-h-screen relative">
      <Navigation />

      {/* background-image-overlay */}
      <div className="fixed top-0 right-0 bottom-0 left-0 pointer-events-none -z-20">
        <img alt="Centro de Operações de Segurança" className="w-full h-full object-cover opacity-65" src="/assets/cydef-hero-bg.webp" fetchPriority="high" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/60 via-[#050505]/45 to-[#050505]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-900/10 via-[#050505]/0 to-[#050505]/0"></div>
      </div>

      {/* aura-background */}
      <div 
        className="fixed top-0 w-full h-screen -z-10 hue-rotate-0 saturate-100 mix-blend-screen opacity-50"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent, black 0%, black 80%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 0%, black 80%, transparent)'
        }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-orange-500/20 blur-[120px] rounded-full pointer-events-none"></div>
      </div>

      {/* vertical-grid-with-beams */}
      <div className="fixed inset-0 z-0 pointer-events-none flex w-full max-w-7xl mx-auto border-r border-white/5 opacity-60">
        <div className="flex-1 border-l border-white/5 h-full relative overflow-hidden">
          <span className="absolute bottom-8 left-4 text-white/10 text-xs font-mono">01</span>
        </div>
        <div className="flex-1 border-l border-white/5 h-full relative overflow-hidden">
          <div className="absolute top-0 -left-[1px] w-[1px] h-64 bg-gradient-to-b from-transparent via-orange-500/60 to-transparent animate-beam-1"></div>
          <span className="absolute bottom-8 left-4 text-white/10 text-xs font-mono">02</span>
        </div>
        <div className="flex-1 border-l border-white/5 h-full flex justify-center relative overflow-hidden">
          <div className="absolute top-0 -left-[1px] w-[1px] h-96 bg-gradient-to-b from-transparent via-orange-500/80 to-transparent animate-beam-2"></div>
          <div className="h-full border-r border-dashed border-orange-500/20 w-px"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-64 bg-gradient-to-b from-transparent via-orange-500 to-transparent animate-beam-1" style={{ animationDelay: '1.5s' }}></div>
          <span className="absolute bottom-8 text-orange-500/30 text-xs font-mono">03</span>
        </div>
        <div className="flex-1 border-l border-white/5 h-full relative overflow-hidden">
          <div className="absolute top-0 -left-[1px] w-[1px] h-48 bg-gradient-to-b from-transparent via-orange-500/60 to-transparent animate-beam-3"></div>
          <span className="absolute bottom-8 left-4 text-white/10 text-xs font-mono">04</span>
        </div>
        <div className="flex-1 border-l border-white/5 h-full relative overflow-hidden">
          <span className="absolute bottom-8 left-4 text-white/10 text-xs font-mono">05</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col w-full max-w-7xl mr-auto ml-auto relative z-10 pt-20">
        
        {/* hero */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 pt-24 pb-10 gap-x-4 gap-y-4 items-center">
          <div className="col-span-1 lg:col-span-6 pl-6 md:pl-10 pt-10 lg:pt-0 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 text-orange-500 mb-8 animate-on-scroll">
              <span className="flex h-2 w-2 rounded-full bg-orange-500"></span>
              <span className="text-xs font-bold tracking-widest uppercase text-orange-500/80">Cybersecurity 2.0</span>
            </div>
            <h1 className="text-6xl md:text-7xl lg:text-8xl leading-[0.9] tracking-tighter text-white font-medium mb-6 animate-on-scroll">
              Segurança que
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-orange-600 block mt-2">evolui com você.</span>
            </h1>
            <p className="leading-relaxed text-lg font-medium text-white/60 max-w-lg animate-on-scroll">
              Protegemos sua organização com serviços avançados de SOC, Blue Team e educação em cibersegurança de classe mundial. A CyDef automatiza a defesa para que você possa focar no seu negócio.
            </p>
            <div className="mt-10 flex flex-wrap gap-6 items-center animate-on-scroll">
              <Link className="group isolate inline-flex cursor-pointer overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_50px_10px_rgba(249,115,22,0.45)] bg-gradient-to-b from-white/20 via-white/0 to-white/5 rounded-full relative shadow-[0_0_25px_rgba(249,115,22,0.3),0_8px_40px_rgba(249,115,22,0.15)]" to="/contato">
                <div className="absolute inset-0 overflow-hidden rounded-full">
                  <div className="absolute inset-[-100%] w-[300%] h-[300%] left-[-100%] top-[-100%] animate-[spin_3s_linear_infinite]" style={{ background: 'conic-gradient(from 0deg, transparent 0deg, transparent 80deg, rgba(253,186,116,0.8) 180deg, transparent 280deg, transparent 360deg)' }}></div>
                </div>
                <div className="absolute inset-[1px] rounded-full backdrop-blur-xl z-0 bg-neutral-950/90"></div>
                <div className="z-10 flex gap-3 sm:w-auto overflow-hidden text-sm font-medium text-white w-full rounded-full pt-3 pr-5 pb-3 pl-4 relative items-center">
                  <div className="relative z-20 w-7 h-7 rounded-full bg-gradient-to-b from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30 ring-1 ring-white/20 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="whitespace-nowrap relative z-10 font-medium tracking-tight text-base text-white/95 group-hover:text-white transition-colors">Solicitar Proposta</span>
                  <span className="inline-flex items-center justify-center z-10 bg-white/10 w-6 h-6 rounded-full ml-1 relative group-hover:translate-x-0.5 transition-transform text-white/80 group-hover:text-white">
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
              <div className="flex items-center gap-2 text-xs font-medium text-neutral-400">
                <Check className="w-3.5 h-3.5 text-orange-500" />
                <span>Análise de risco gratuita</span>
              </div>
            </div>
          </div>
          
          <div className="col-span-1 lg:col-span-6 md:pr-10 flex flex-col lg:pt-20 h-full pt-10 pr-6 items-end justify-center">
            {/* stacked-cards-preview */}
            <div className="relative mb-12 mr-4 w-64 md:w-72 aspect-video group perspective-1000 animate-on-scroll">
              <div className="absolute -inset-8 bg-orange-500/20 blur-3xl -z-10 opacity-50 group-hover:opacity-70 transition-opacity duration-700"></div>
              <div className="relative w-full h-full transform-style-3d">
                <div className={`card-stack-item absolute inset-0 rounded-lg overflow-hidden border border-white/10 shadow-2xl origin-bottom bg-neutral-900 transition-all duration-500 ${activeStep === 3 ? 'translate-y-0 scale-100 z-30 opacity-100' : activeStep === 1 ? 'translate-y-6 scale-90 z-10 opacity-40' : 'translate-y-3 scale-95 z-20 opacity-60'}`}>
                  <img alt="Resposta Imediata" className="w-full h-full object-cover opacity-60" src="/assets/cydef-card-resposta.webp" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Lock className="w-12 h-12 text-orange-500/50" />
                  </div>
                  <div className="absolute top-3 right-3 px-2 py-1 bg-orange-500 text-black text-[10px] font-bold rounded uppercase">Blindado</div>
                </div>
                <div className={`card-stack-item absolute inset-0 rounded-lg overflow-hidden border border-white/10 shadow-2xl origin-bottom bg-neutral-900 transition-all duration-500 ${activeStep === 2 ? 'translate-y-0 scale-100 z-30 opacity-100' : activeStep === 3 ? 'translate-y-6 scale-90 z-10 opacity-40' : 'translate-y-3 scale-95 z-20 opacity-60'}`}>
                  <img alt="Detecção por IA" className="w-full h-full object-cover opacity-70" src="/assets/cydef-card-deteccao.webp" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <ScanLine className="w-12 h-12 text-orange-400/50" />
                  </div>
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-mono text-white/80">Analisando ameaças...</span>
                  </div>
                </div>
                <div className={`card-stack-item absolute inset-0 rounded-lg overflow-hidden border border-white/10 shadow-2xl origin-bottom bg-neutral-900 transition-all duration-500 ${activeStep === 1 ? 'translate-y-0 scale-100 z-30 opacity-100' : activeStep === 2 ? 'translate-y-6 scale-90 z-10 opacity-40' : 'translate-y-3 scale-95 z-20 opacity-60'}`}>
                  <img alt="Monitoramento Ativo" className="w-full h-full object-cover opacity-90" src="/assets/cydef-card-monitoramento.webp" />
                  <div className="flex absolute top-0 right-0 bottom-0 left-0 items-center justify-center bg-black/60">
                    <div className="flex transition-transform hover:scale-110 bg-gradient-to-br from-white/10 via-white/0 to-white/10 w-12 h-12 rounded-full shadow-2xl backdrop-blur-md items-center justify-center border border-white/20">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* interactive-steps */}
            <div className="flex flex-col gap-3 w-full max-w-xs mr-0 lg:mr-8">
              <div className={`step-item ${activeStep === 1 ? 'translate-x-[-10px] bg-white/10 ring-1 ring-orange-500/50' : ''} animate-on-scroll`} onClick={() => setActiveStep(1)}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors duration-300 ${activeStep === 1 ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20' : 'bg-transparent text-neutral-400'}`}>01</div>
                <span className={`text-sm font-medium transition-colors duration-300 ${activeStep === 1 ? 'text-white' : 'text-neutral-400'}`}>Monitoramento Ativo</span>
                <Shield className={`w-3 h-3 ml-auto transition-all duration-300 ${activeStep === 1 ? 'text-orange-500 opacity-100' : 'opacity-0'}`} />
              </div>
              <div className={`step-item ${activeStep === 2 ? 'translate-x-[-10px] bg-white/10 ring-1 ring-orange-500/50' : ''} animate-on-scroll`} onClick={() => setActiveStep(2)}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors duration-300 ${activeStep === 2 ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20' : 'bg-transparent text-neutral-400'}`}>02</div>
                <span className={`text-sm font-medium transition-colors duration-300 ${activeStep === 2 ? 'text-white' : 'text-neutral-400'}`}>Detecção por IA</span>
                <ScanLine className={`w-3 h-3 ml-auto transition-all duration-300 ${activeStep === 2 ? 'text-orange-500 opacity-100' : 'opacity-0'}`} />
              </div>
              <div className={`step-item ${activeStep === 3 ? 'translate-x-[-10px] bg-white/10 ring-1 ring-orange-500/50' : ''} animate-on-scroll`} onClick={() => setActiveStep(3)}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors duration-300 ${activeStep === 3 ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20' : 'bg-transparent text-neutral-400'}`}>03</div>
                <span className={`text-sm font-medium transition-colors duration-300 ${activeStep === 3 ? 'text-white' : 'text-neutral-400'}`}>Resposta Imediata</span>
                <Lock className={`w-3 h-3 ml-auto transition-all duration-300 ${activeStep === 3 ? 'text-orange-500 opacity-100' : 'opacity-0'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* testimonial-and-headline */}
        <div className="md:px-10 mt-32 pt-4 pb-10 border-t border-white/5 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="col-span-1 lg:col-span-4 relative group animate-on-scroll">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="flex flex-col min-h-[180px] transition-transform hover:-translate-y-1 duration-300 text-black bg-gradient-to-b from-orange-400 to-orange-600 rounded-xl p-8 relative shadow-2xl justify-between">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full border-2 border-orange-400 bg-neutral-800"></div>
                    <div className="w-8 h-8 rounded-full border-2 border-orange-400 bg-neutral-900"></div>
                    <div className="w-8 h-8 rounded-full border-2 border-orange-400 bg-black text-white flex items-center justify-center text-[10px] font-bold">+50</div>
                  </div>
                  <Quote className="w-5 h-5 text-black/40 fill-black/20" />
                </div>
                <div>
                  <p className="text-lg font-semibold leading-snug tracking-tight max-w-[80%]">"A CyDef mudou todo o nosso fluxo de segurança e compliance."</p>
                  <div className="mt-4 pt-4 border-t border-black/10 flex items-center gap-2 text-xs font-medium uppercase tracking-wide opacity-70">
                    <span>CISO Verificado</span>
                    <span className="w-1 h-1 bg-black rounded-full"></span>
                    <span>Avaliação 5.0</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden lg:block col-span-2"></div>
            <div className="col-span-1 lg:col-span-6 flex flex-col justify-end text-right lg:text-left">
              <div className="flex items-center gap-2 lg:justify-start justify-end mb-3 text-orange-400 text-xs font-medium uppercase tracking-wider animate-on-scroll">
                <Sparkles className="w-3 h-3" />
                <span>Blue Team & SOC</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-normal tracking-tighter text-white animate-on-scroll">
                Proteção inteligente de
                <span className="text-white/60 block">próxima geração.</span>
              </h2>
            </div>
          </div>
        </div>

        {/* stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8 mt-24 pt-12 border-t border-white/5 pb-24 relative z-20">
          <div className="flex flex-col gap-2 animate-on-scroll">
            <div className="md:text-7xl lg:text-8xl leading-none text-6xl font-light text-white tracking-tighter">24/7</div>
            <div className="text-xl font-medium pl-1 text-neutral-400">Monitoramento SOC</div>
          </div>
          <div className="flex flex-col gap-2 animate-on-scroll">
            <div className="md:text-7xl lg:text-8xl leading-none text-6xl font-light text-white tracking-tighter">99%</div>
            <div className="text-xl font-medium pl-1 text-neutral-400">Mitigação Automática</div>
          </div>
          <div className="flex flex-col gap-2 animate-on-scroll">
            <div className="md:text-7xl lg:text-8xl leading-none text-6xl font-light text-white tracking-tighter">500+</div>
            <div className="text-xl font-medium pl-1 text-neutral-400">Alunos Formados</div>
          </div>
          <div className="flex flex-col gap-2 animate-on-scroll">
            <div className="md:text-7xl lg:text-8xl leading-none text-6xl font-light text-white tracking-tighter">0</div>
            <div className="text-xl font-medium pl-1 text-neutral-400">Falhas Críticas</div>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
};

export default Index;
