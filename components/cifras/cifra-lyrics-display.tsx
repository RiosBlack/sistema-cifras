import { cn } from "@/lib/utils"

type CifraLyricsDisplayProps = {
  lyrics: string
  className?: string
}

/**
 * Tokens to colorize:
 * - ` / ` (spaces on both sides) → black
 * - `→` and `Nx` → blue
 * - `(`, `)` → blue · `-` alone → black (chords around them stay orange)
 * - textos com mais de 3 palavras → black
 * Slash chords like `C/E` stay orange.
 */
const TOKEN_SPLIT = /(\s+\/\s+|\s*→\s*|\s*\d+x\b|[()\-])/

function isLongText(seg: string): boolean {
  return seg.trim().split(/\s+/).filter(Boolean).length > 3
}

/** Colorize separators and punctuation inside a chord/lyric segment. */
function renderWithSeparators(text: string, keyPrefix: string | number) {
  return text.split(TOKEN_SPLIT).map((seg, i) => {
    if (!seg) return null

    if (seg.match(/^\s+\/\s+$/) || seg === "-") {
      return (
        <span key={`${keyPrefix}-sep-${i}`} className="text-black">
          {seg}
        </span>
      )
    }
    if (
      seg === "(" ||
      seg === ")" ||
      seg.match(/^\s*→\s*$/) ||
      seg.match(/^\s*\d+x$/)
    ) {
      return (
        <span key={`${keyPrefix}-blue-${i}`} className="text-blue-600">
          {seg}
        </span>
      )
    }
    if (isLongText(seg)) {
      return (
        <span key={`${keyPrefix}-txt-${i}`} className="text-black font-normal">
          {seg}
        </span>
      )
    }
    return <span key={`${keyPrefix}-chord-${i}`}>{seg}</span>
  })
}

/**
 * Renders cifra lyrics with styled chords, section labels and separators.
 * ` / ` → black · slash chords (`C/E`) → orange · `→`/`Nx`/`()` → blue ·
 * `-` → black · textos >3 palavras → black · section labels → black
 */
export function CifraLyricsDisplay({ lyrics, className }: CifraLyricsDisplayProps) {
  return (
    <div
      className={cn(
        "whitespace-pre-wrap font-mono leading-relaxed font-bold text-orange-500",
        className
      )}
    >
      {lyrics.split(/(\[[^\]]+\]|^[^:]+:)/gm).map((part, index) => {
        if (part.match(/^\[[^\]]+\]$/)) {
          return (
            <span key={index} className="text-primary font-bold bg-primary/10 px-1 rounded">
              {part.slice(1, -1)}
            </span>
          )
        }
        if (part.match(/^[^:]+:$/)) {
          return (
            <span key={index} className="text-black font-normal">
              {part}
            </span>
          )
        }
        return <span key={index}>{renderWithSeparators(part, index)}</span>
      })}
    </div>
  )
}

/** HTML string version for print windows (same colors). */
export function formatCifraLyricsHtml(lyrics: string): string {
  return lyrics
    .split(/(\[[^\]]+\]|^[^:]+:)/gm)
    .map((part) => {
      if (part.match(/^\[[^\]]+\]$/)) {
        return `<span class="chord">${part.slice(1, -1)}</span>`
      }
      if (part.match(/^[^:]+:$/)) {
        return `<span class="section-label">${part}</span>`
      }
      return part
        .split(TOKEN_SPLIT)
        .map((seg) => {
          if (!seg) return ""
          if (seg.match(/^\s+\/\s+$/) || seg === "-") {
            return `<span class="sep-slash">${seg}</span>`
          }
          if (
            seg === "(" ||
            seg === ")" ||
            seg.match(/^\s*→\s*$/) ||
            seg.match(/^\s*\d+x$/)
          ) {
            return `<span class="sep-arrow">${seg}</span>`
          }
          if (isLongText(seg)) {
            return `<span class="annotation">${seg}</span>`
          }
          return seg
        })
        .join("")
    })
    .join("")
}

export const CIFRA_LYRICS_PRINT_STYLES = `
  .chord {
    background-color: #f0f0f0;
    padding: 3px 6px;
    border-radius: 4px;
    font-weight: bold;
    color: #f97316;
  }
  .section-label {
    color: #000;
    font-weight: normal;
  }
  .sep-slash {
    color: #000;
  }
  .sep-arrow {
    color: #2563eb;
  }
  .annotation {
    color: #000;
    font-weight: normal;
  }
  @media print {
    html, body, .cifra-content, .chord, .section-label, .sep-slash, .sep-arrow, .annotation {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
  }
`
