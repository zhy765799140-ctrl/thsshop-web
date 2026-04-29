import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface Banner {
  image: string;
}

interface BannerContextType {
  banner: Banner;
  updateBanner: (banner: Banner) => void;
  payQrCode: string;
  updatePayQrCode: (code: string) => void;
}

const defaultBanner: Banner = {
  image: '',
};

const BannerContext = createContext<BannerContextType | undefined>(undefined);

export function BannerProvider({ children }: { children: ReactNode }) {
  const [banner, setBanner] = useState<Banner>(() => {
    const saved = localStorage.getItem('banner');
    return saved ? JSON.parse(saved) : defaultBanner;
  });

  const [payQrCode, setPayQrCode] = useState<string>(() => {
    return localStorage.getItem('payQrCode') || '';
  });

  useEffect(() => {
    localStorage.setItem('banner', JSON.stringify(banner));
  }, [banner]);

  useEffect(() => {
    localStorage.setItem('payQrCode', payQrCode);
  }, [payQrCode]);

  const updateBanner = (newBanner: Banner) => {
    setBanner(newBanner);
  };

  const updatePayQrCode = (code: string) => {
    setPayQrCode(code);
  };

  return (
    <BannerContext.Provider value={{ banner, updateBanner, payQrCode, updatePayQrCode }}>
      {children}
    </BannerContext.Provider>
  );
}

export function useBanner() {
  const context = useContext(BannerContext);
  if (!context) {
    throw new Error('useBanner must be used within a BannerProvider');
  }
  return context;
}
