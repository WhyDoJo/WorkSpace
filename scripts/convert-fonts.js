import {
  readdirSync,
  existsSync,
  mkdirSync,
  writeFileSync,
  statSync,
  readFileSync,
  copyFileSync,
} from "fs";
import { resolve, extname, basename, join, relative, dirname } from "path";
import ttf2woff from "ttf2woff";
import ttf2woff2 from "ttf2woff2";

const FONTS_DIR = "src/assets/fonts";
const OUTPUT_DIR = "public/fonts";

// Создаем output директорию если не существует
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Рекурсивный поиск шрифтов с сохранением структуры
function findFontFiles(dir) {
  let fontFiles = [];
  if (!existsSync(dir)) return fontFiles;
  const items = readdirSync(dir);
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      // Рекурсивно ищем в подпапках
      fontFiles = fontFiles.concat(findFontFiles(fullPath));
    } else if (/\.(ttf|otf|woff2?)$/i.test(item)) {
      fontFiles.push(fullPath);
    }
  }
  return fontFiles;
}

function getFontMeta(inputPath) {
  const fileName = basename(inputPath, extname(inputPath));
  const extension = extname(inputPath).toLowerCase();
  // Получаем относительный путь от src/assets/fonts
  const relativePath = relative(FONTS_DIR, dirname(inputPath));

  // === ОПРЕДЕЛЕНИЕ WEIGHT И STYLE ПО ИМЕНИ ФАЙЛА ===
  let fontWeight = "400";
  let fontStyle = "normal";

  const lowerName = fileName.toLowerCase();

  if (lowerName.includes("thin")) fontWeight = "100";
  else if (lowerName.includes("extralight")) fontWeight = "200";
  else if (lowerName.includes("light")) fontWeight = "300";
  else if (lowerName.includes("medium")) fontWeight = "500";
  else if (lowerName.includes("semibold")) fontWeight = "600";
  else if (lowerName.includes("bold")) fontWeight = "700";
  else if (lowerName.includes("extrabold")) fontWeight = "800";
  else if (lowerName.includes("black")) fontWeight = "900";

  if (lowerName.includes("italic") || lowerName.includes("oblique")) {
    fontStyle = "italic";
  }

  return {
    fileName,
    extension,
    relativePath,
    path: relativePath ? `${relativePath}/${fileName}` : fileName,
    family: relativePath || "Default",
    weight: fontWeight,
    style: fontStyle,
  };
}

function convertFont(inputPath, outputBaseDir) {
  const meta = getFontMeta(inputPath);
  const { fileName, extension, relativePath } = meta;
  const outputDir = relativePath
    ? join(outputBaseDir, relativePath)
    : outputBaseDir;

  // Создаем выходную директорию если не существует
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  try {
    console.log(`Обработка файла: ${inputPath}`);

    if (extension === ".ttf" || extension === ".otf") {
      // Читаем исходный шрифт
      const fontBuffer = readFileSync(inputPath);

      // Конвертация в WOFF2
      const woff2Output = resolve(outputDir, `${fileName}.woff2`);
      const woff2 = ttf2woff2(fontBuffer);
      writeFileSync(woff2Output, Buffer.from(woff2));
      console.log(
        `✅ Converted: ${relativePath ? relativePath + "/" : ""}${fileName}.woff2`
      );

      // Конвертация в WOFF
      const woffOutput = resolve(outputDir, `${fileName}.woff`);
      const woff = ttf2woff(fontBuffer).buffer;
      writeFileSync(woffOutput, Buffer.from(woff));
      console.log(
        `✅ Converted: ${relativePath ? relativePath + "/" : ""}${fileName}.woff`
      );
    } else if (extension === ".woff" || extension === ".woff2") {
      const outputPath = resolve(outputDir, `${fileName}${extension}`);
      copyFileSync(inputPath, outputPath);
      console.log(
        `✅ Copied: ${relativePath ? relativePath + "/" : ""}${fileName}${extension}`
      );
    }

    return {
      ...meta,
      hasWoff: extension === ".woff",
      hasWoff2: extension === ".woff2",
    };
  } catch (error) {
    console.error(`❌ Error converting ${fileName}:`, error.message);
    return null;
  }
}

function generateFontCSS(convertedFonts) {
  const groupedFonts = new Map();

  for (const font of convertedFonts.filter(Boolean)) {
    const key = `${font.path}-${font.weight}-${font.style}-${font.family}`;
    if (!groupedFonts.has(key)) {
      groupedFonts.set(key, {
        ...font,
        hasWoff: false,
        hasWoff2: false,
      });
    }

    const item = groupedFonts.get(key);
    if (font.extension === ".ttf" || font.extension === ".otf") {
      item.hasWoff = true;
      item.hasWoff2 = true;
    }
    if (font.extension === ".woff") item.hasWoff = true;
    if (font.extension === ".woff2") item.hasWoff2 = true;
  }

  const fontFaces = Array.from(groupedFonts.values())
    .map((font) => {
      const srcParts = [];
      if (font.hasWoff2) {
        srcParts.push(`url('/fonts/${font.path}.woff2') format('woff2')`);
      }
      if (font.hasWoff) {
        srcParts.push(`url('/fonts/${font.path}.woff') format('woff')`);
      }

      return `@font-face {
  font-family: '${font.family}';
  src: ${srcParts.join(",\n       ")};
  font-weight: ${font.weight};
  font-style: ${font.style};
  font-display: swap;
}`;
    })
    .join("\n\n");

  return fontFaces;
}

// Основная функция
function convertFonts() {
  if (!existsSync(FONTS_DIR)) {
    console.log("📁 Creating fonts directory...");
    mkdirSync(FONTS_DIR, { recursive: true });
    console.log("Put your .ttf or .otf files in src/assets/fonts/ directory");
    return;
  }

  const fontFiles = findFontFiles(FONTS_DIR);

  if (fontFiles.length === 0) {
    console.log(
      "No font files found in src/assets/fonts/ (supported: .ttf, .otf, .woff, .woff2)"
    );
    return;
  }

  console.log(`🔄 Converting ${fontFiles.length} font(s)...`);
  console.log(
    "Found fonts:",
    fontFiles.map((f) => basename(f))
  );

  const convertedFonts = fontFiles.map((file) => {
    return convertFont(file, OUTPUT_DIR);
  });

  // Автоматически генерируем и сохраняем _fonts.css
  if (convertedFonts.some((f) => f)) {
    const cssContent = generateFontCSS(convertedFonts);
    const fontsCssPath = "src/css/_fonts.css";
    mkdirSync(dirname(fontsCssPath), { recursive: true });
    writeFileSync(fontsCssPath, cssContent + "\n");
    console.log("📝 Автоматически обновлён src/css/_fonts.css");
  }

  console.log("🎉 Font conversion completed!");
}

convertFonts();
