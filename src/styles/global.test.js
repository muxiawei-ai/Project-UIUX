import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const cssText = readFileSync(join(process.cwd(), 'src/styles/global.css'), 'utf8');

function ruleBody(selector) {
  const lines = cssText.split('\n');
  const startIndex = lines.reduce((matchIndex, line, index) => {
    return line.trim() === `${selector} {` ? index : matchIndex;
  }, -1);

  if (startIndex === -1) {
    throw new Error(`Missing CSS rule for ${selector}`);
  }

  const bodyLines = [];

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    if (lines[index].trim() === '}') {
      break;
    }

    bodyLines.push(lines[index]);
  }

  return bodyLines.join('\n');
}

describe('Border Glow styles', () => {
  it('matches ReactBits cursor-directed mesh glow layers', () => {
    const cardRule = ruleBody('.border-glow-card');
    const borderRule = ruleBody('.border-glow-card::before');
    const fillRule = ruleBody('.border-glow-card::after');
    const edgeLightRule = ruleBody('.border-glow-card > .edge-light');

    expect(cardRule).toMatch(/--edge-proximity:\s*0/);
    expect(cardRule).toMatch(/--cursor-angle:\s*45deg/);
    expect(cardRule).toMatch(/isolation:\s*isolate/);
    expect(borderRule).toMatch(/var\(--gradient-one/);
    expect(borderRule).toMatch(/mask-image:[\s\S]*conic-gradient[\s\S]*var\(--cursor-angle/);
    expect(fillRule).toMatch(/mix-blend-mode:\s*soft-light/);
    expect(edgeLightRule).toMatch(/mix-blend-mode:\s*plus-lighter/);
  });
});

describe('layout overflow guards', () => {
  it('keeps grid columns and panels from expanding past the viewport', () => {
    const previewPanelRule = ruleBody('.preview-panel');
    const cardRule = ruleBody('.snippet-card');

    expect(previewPanelRule).toMatch(/min-width:\s*0/);
    expect(cardRule).toMatch(/min-width:\s*0/);
    expect(cssText).toMatch(/@media \(max-width: 960px\)[\s\S]*?\.effect-lab \{\s*grid-template-columns:\s*minmax\(0, 1fr\)/);
  });
});
