export class SmartPalette {
  private r: number;
  private g: number;
  private b: number;

  // ключи палитры в порядке увеличения "темноты"
  private readonly keys = [25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

  constructor(color: string) {
    const { r, g, b } = this.parseColor(color);
    this.r = r;
    this.g = g;
    this.b = b;
  }

  private parseColor(color: string) {
    if (color.startsWith("#")) {
      const hex = color.slice(1);
      const full =
        hex.length === 3
          ? hex
              .split("")
              .map((c) => c + c)
              .join("")
          : hex;
      const int = parseInt(full, 16);
      return {
        r: (int >> 16) & 255,
        g: (int >> 8) & 255,
        b: int & 255,
      };
    }
    const [r, g, b] = color.split(",").map((v) => parseInt(v.trim(), 10));
    return { r, g, b };
  }

  private rgbToHsl(r: number, g: number, b: number) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return { h, s, l };
  }

  private hslToHex(h: number, s: number, l: number) {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    let r: number, g: number, b: number;
    if (s === 0) r = g = b = l;
    else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    const toHex = (x: number) =>
      Math.round(x * 255)
        .toString(16)
        .padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  public generate(): Record<number, string> {
    const { h, s, l } = this.rgbToHsl(this.r, this.g, this.b);

    // стандартные светлоты Material для палитры
    const materialLightness = {
      25: 0.98,
      50: 0.95,
      100: 0.9,
      200: 0.8,
      300: 0.7,
      400: 0.6,
      500: 0.5,
      600: 0.4,
      700: 0.3,
      800: 0.2,
      900: 0.1,
    };

    // Найти ключ, где базовый цвет наиболее близок по светлоте
    let closestKey = this.keys[0];
    let minDiff = Infinity;
    for (const key of this.keys) {
      const diff = Math.abs(l - materialLightness[key as keyof typeof materialLightness]);
      if (diff < minDiff) {
        minDiff = diff;
        closestKey = key;
      }
    }

    // Смещение всех светлот относительно базового цвета
    const palette: Record<number, string> = {};
    const baseL = l;
    const baseLightnessValue = materialLightness[closestKey as keyof typeof materialLightness];

    for (const key of this.keys) {
      const delta = materialLightness[key as keyof typeof materialLightness] - baseLightnessValue;
      const newL = Math.min(Math.max(baseL + delta, 0), 1); // обрезаем 0–1
      palette[key] = this.hslToHex(h, s, newL);
    }

    return palette;
  }
}
