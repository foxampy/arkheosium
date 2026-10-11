import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Globe, Vote, Play, Rocket } from 'lucide-react';

const WelcomeBanner: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="border border-primary/10 bg-card/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 lg:mb-8 relative overflow-hidden">
      <div className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full bg-primary/5 animate-pulse-slow"></div>
      <div className="relative z-10">
        <h1 className="font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-3 tracking-tight">
          {t('dashboard.welcome.title', 'Добро пожаловать в')} <span className="text-primary">VODECO</span>
        </h1>
        <p className="text-foreground/80 max-w-2xl text-sm sm:text-base">
          {t('dashboard.welcome.description', 'Децентрализованная Web3 платформа для управления водными ресурсами на основе DAO VOD ECO. Присоединяйтесь к нашей экосистеме для мониторинга, голосования и участия в инициативах по сохранению водных ресурсов.')}
        </p>
        <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-3">
          <Link href="/">
            <Button className="font-medium px-4 sm:px-5 py-2 rounded-xl transition-all flex items-center text-sm sm:text-base text-black"
              style={{ background: "linear-gradient(135deg, #00e6c8, #00a0ff)", boxShadow: "0 0 16px rgba(0,200,220,0.3)" }}>
              <Rocket className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Главная
            </Button>
          </Link>
          <Link href="/map">
            <Button className="bg-gradient-to-r from-cyan-700/80 to-blue-700/80 hover:from-cyan-700 hover:to-blue-700 text-white font-medium px-4 sm:px-5 py-2 rounded-xl transition-all flex items-center text-sm sm:text-base border border-cyan-500/30">
              <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Презентация
            </Button>
          </Link>
          <Link href="/map">
            <Button className="bg-primary/80 hover:bg-primary/90 text-black font-medium px-4 sm:px-5 py-2 rounded-xl transition-all flex items-center text-sm sm:text-base">
              <Globe className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              {t('dashboard.welcome.explore', 'Исследовать')}
            </Button>
          </Link>
          <Link href="/hub">
            <Button variant="outline" className="border border-primary/40 hover:bg-primary/10 text-foreground font-medium px-4 sm:px-5 py-2 rounded-xl transition-all flex items-center text-sm sm:text-base">
              <Vote className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              {t('dashboard.welcome.joinDao', 'Присоединиться к DAO')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
