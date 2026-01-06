# Vazirmatn Font

**Version:** v16  
**Source:** Google Fonts  
**License:** OFL (Open Font License)  
**Format:** WOFF2 (optimized for web)

## About

Vazirmatn is a modern Arabic font that supports both Arabic and English text. It's the **only font** used across the entire Nasneh platform.

## Weights Included

| Weight | File | Use Case |
|--------|------|----------|
| 400 (Regular) | `Vazirmatn-Regular.woff2` | Body text, paragraphs |
| 500 (Medium) | `Vazirmatn-Medium.woff2` | Buttons, labels |
| 600 (SemiBold) | `Vazirmatn-SemiBold.woff2` | Headings (H2, H3, H4) |
| 700 (Bold) | `Vazirmatn-Bold.woff2` | Headings (H1), emphasis |

## File Sizes

- Regular: 43 KB
- Medium: 44 KB
- SemiBold: 44 KB
- Bold: 44 KB
- **Total:** 175 KB

## Usage

### Import in your app

```typescript
// In your root layout or globals.css
import '@nasneh/ui/fonts/vazirmatn/font.css';
```

### Use in CSS

```css
body {
  font-family: var(--font-family-primary);
  /* or directly: */
  font-family: 'Vazirmatn', system-ui, -apple-system, sans-serif;
}
```

### Font weights

```css
.regular { font-weight: 400; }  /* var(--font-weight-regular) */
.medium { font-weight: 500; }   /* var(--font-weight-medium) */
.semibold { font-weight: 600; } /* var(--font-weight-semibold) */
.bold { font-weight: 700; }     /* var(--font-weight-bold) */
```

## Why Self-Hosted?

1. **Performance:** No external requests to Google Fonts
2. **Privacy:** No tracking or data collection
3. **Reliability:** Works offline and in restricted networks
4. **Control:** Version locked, no unexpected changes

## License

This font is licensed under the [SIL Open Font License (OFL)](https://scripts.sil.org/OFL).

You are free to:
- Use the font commercially
- Modify the font
- Distribute the font

## Links

- [Vazirmatn on Google Fonts](https://fonts.google.com/specimen/Vazirmatn)
- [OFL License](https://scripts.sil.org/OFL)
