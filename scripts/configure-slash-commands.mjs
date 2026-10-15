import fs from 'node:fs';
import path from 'node:path';

const baseDir = 'C:/Users/LENOVO/.gemini/config/skills';
const srcDir = path.join(baseDir, 'using-superpowers');

const targetSkillNames = [
  'using-superpower',
  'using-superpowers',
  'superpower',
  'superpowers'
];

for (const name of targetSkillNames) {
  const destDir = path.join(baseDir, name);
  if (!fs.existsSync(destDir)) {
    fs.cpSync(srcDir, destDir, { recursive: true });
  }

  const skillPath = path.join(destDir, 'SKILL.md');
  let content = fs.readFileSync(skillPath, 'utf8');

  const newFrontmatter = `---
name: ${name}
description: Use when starting any conversation - establishes how to find and use skills, requiring skill invocation before ANY response including clarifying questions. Accessible via /${name}, /using-superpower, /using-superpowers, /superpower, or /superpowers slash command.
---`;

  content = content.replace(/^---[\s\S]*?---/, newFrontmatter);
  fs.writeFileSync(skillPath, content, 'utf8');
  console.log(`Configured skill and slash command: /${name}`);
}

console.log('All superpower slash commands successfully configured!');
