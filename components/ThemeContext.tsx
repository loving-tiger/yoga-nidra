import React, { createContext, useContext, useState, useMemo } from 'react';
import tinycolor from 'tinycolor2';

interface ThemeContextProps {
  themeColor: string; // Hex string, e.g. '#7C3AED'
  setThemeColor: (color: string) => void;
  lightness: number; // 0 (dark) to 1 (light)
  setLightness: (value: number) => void;
  colors: {
    background: string;
    text: string;
    button: string;
    buttonText: string;
    card: string;
    border: string;
  };
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default: purple
  const [themeColor, setThemeColorState] = useState('#7C3AED');
  const [lightness, setLightness] = useState(0.5);

  const setThemeColor = (color: string) => {
    try {
      setThemeColorState(tinycolor(color).toHexString());
    } catch {
      setThemeColorState('#7C3AED');
    }
  };

  // Helper to adjust lightness of a hex color
  function adjustLightness(hex: string, l: number) {
    const hsl = tinycolor(hex).toHsl();
    hsl.l = l;
    return tinycolor(hsl).toHexString();
  }

  // Helper to get best contrast color (black or white)
  function getContrastColor(bg: string) {
    const c = tinycolor(bg);
    return c.isLight() ? '#222' : '#fff';
  }

  const colors = useMemo(() => {
    const background = adjustLightness(themeColor, Math.max(0.97, lightness + 0.4));
    const button = adjustLightness(themeColor, lightness);
    const card = adjustLightness(themeColor, Math.max(0.95, lightness + 0.3));
    const border = adjustLightness(themeColor, Math.max(0.7, lightness - 0.1));
    return {
      background,
      text: getContrastColor(background),
      button,
      buttonText: getContrastColor(button),
      card,
      border,
    };
  }, [themeColor, lightness]);

  return (
    <ThemeContext.Provider value={{ themeColor, setThemeColor, lightness, setLightness, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
} 