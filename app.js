/* ==========================================
   TejeMath - JavaScript Logic Engine
   Calculadora Experta de Tejido, Muestra y Canesú
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- STATE & DOM ELEMENTS ---
    let currentCraft = 'palitos';
    let currentMode = 'flat'; // 'flat' or 'yoke'

    // Preset data for yarn weights (gauge defaults per 10cm x 10cm)
    const YARN_PRESETS = {
        fingering: { stitches: 30, rows: 40, width: 10, height: 10 },
        sport:     { stitches: 25, rows: 34, width: 10, height: 10 },
        dk:        { stitches: 22, rows: 28, width: 10, height: 10 },
        worsted:   { stitches: 18, rows: 24, width: 10, height: 10 },
        chunky:    { stitches: 14, rows: 18, width: 10, height: 10 },
        superchunky:{ stitches: 9,  rows: 12, width: 10, height: 10 }
    };

    // Global Mode Tabs
    const modeTabs = document.querySelectorAll('.mode-tab');
    const flatCalculatorView = document.getElementById('flatCalculatorView');
    const yokeCalculatorView = document.getElementById('yokeCalculatorView');

    // Controls & Craft
    const craftBtns = document.querySelectorAll('.craft-btn');
    const yarnPresetSelect = document.getElementById('yarnPreset');
    const themeToggleBtn = document.getElementById('themeToggle');

    // Common Gauge Inputs
    const sampleWidthInput = document.getElementById('sampleWidth');
    const sampleStitchesInput = document.getElementById('sampleStitches');
    const sampleHeightInput = document.getElementById('sampleHeight');
    const sampleRowsInput = document.getElementById('sampleRows');
    const sampleWeightInput = document.getElementById('sampleWeight');

    // Mode 1: Flat Inputs & Outputs
    const targetWidthInput = document.getElementById('targetWidth');
    const targetHeightInput = document.getElementById('targetHeight');
    const easeSelect = document.getElementById('easeSelect');
    const customEaseGroup = document.getElementById('customEaseGroup');
    const customEaseInput = document.getElementById('customEase');
    const patternPresetSelect = document.getElementById('patternPreset');
    const customPatternInputs = document.getElementById('customPatternInputs');
    const multipleValueInput = document.getElementById('multipleValue');
    const edgeStitchesInput = document.getElementById('edgeStitches');

    const finalStitchesCountEl = document.getElementById('finalStitchesCount');
    const finalRowsCountEl = document.getElementById('finalRowsCount');
    const effectiveWidthDisplayEl = document.getElementById('effectiveWidthDisplay');
    const gaugeDensityEl = document.getElementById('gaugeDensity');
    const estimatedWeightEl = document.getElementById('estimatedWeight');
    const multipleAdjustmentNoticeEl = document.getElementById('multipleAdjustmentNotice');
    const fabricSvgEl = document.getElementById('fabricSvg');

    // Mode 2: Yoke (Canesú) Inputs & Outputs
    const yokeTypeSelect = document.getElementById('yokeType');
    const neckCircumferenceInput = document.getElementById('neckCircumference');
    const chestCircumferenceInput = document.getElementById('chestCircumference');
    const armCircumferenceInput = document.getElementById('armCircumference');
    const yokeDepthInput = document.getElementById('yokeDepth');
    const underarmStitchesInput = document.getElementById('underarmStitches');
    const raglanStitchesGroup = document.getElementById('raglanStitchesGroup');
    const raglanLineStitchesInput = document.getElementById('raglanLineStitches');

    const neckStitchesOutputEl = document.getElementById('neckStitchesOutput');
    const yokeDepthRowsNoticeEl = document.getElementById('yokeDepthRowsNotice');
    const frontStitchesDisplayEl = document.getElementById('frontStitchesDisplay');
    const backStitchesDisplayEl = document.getElementById('backStitchesDisplay');
    const rightSleeveDisplayEl = document.getElementById('rightSleeveDisplay');
    const leftSleeveDisplayEl = document.getElementById('leftSleeveDisplay');
    const totalYokeStitchesDisplayEl = document.getElementById('totalYokeStitchesDisplay');
    const totalBodyStitchesDisplayEl = document.getElementById('totalBodyStitchesDisplay');
    const totalIncreasesDisplayEl = document.getElementById('totalIncreasesDisplay');
    const increaseFrequencyRowEl = document.getElementById('increaseFrequencyRow');
    const increaseFrequencyDisplayEl = document.getElementById('increaseFrequencyDisplay');
    const yokeSvgEl = document.getElementById('yokeSvg');

    // Actions & Toast
    const copyRecipeBtn = document.getElementById('copyRecipeBtn');
    const printRecipeBtn = document.getElementById('printRecipeBtn');
    const copyYokeRecipeBtn = document.getElementById('copyYokeRecipeBtn');
    const printYokeBtn = document.getElementById('printYokeBtn');
    const toastEl = document.getElementById('toast');

    // --- INITIALIZATION ---
    initTheme();
    registerEventListeners();
    calculateAll();

    function registerEventListeners() {
        // Mode Tabs (Flat vs Yoke)
        modeTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                modeTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentMode = tab.dataset.mode;

                if (currentMode === 'flat') {
                    flatCalculatorView.classList.remove('hidden');
                    yokeCalculatorView.classList.add('hidden');
                } else {
                    flatCalculatorView.classList.add('hidden');
                    yokeCalculatorView.classList.remove('hidden');
                }
                calculateAll();
            });
        });

        // Craft Selector
        craftBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                craftBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentCraft = btn.dataset.craft;
                calculateAll();
            });
        });

        // Yarn Presets Dropdown
        yarnPresetSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            if (YARN_PRESETS[val]) {
                const preset = YARN_PRESETS[val];
                sampleWidthInput.value = preset.width;
                sampleStitchesInput.value = preset.stitches;
                sampleHeightInput.value = preset.height;
                sampleRowsInput.value = preset.rows;
                calculateAll();
            }
        });

        // Ease & Pattern Selectors
        easeSelect.addEventListener('change', () => {
            customEaseGroup.classList.toggle('hidden', easeSelect.value !== 'custom');
            calculateAll();
        });

        patternPresetSelect.addEventListener('change', () => {
            customPatternInputs.classList.toggle('hidden', patternPresetSelect.value !== 'custom');
            calculateAll();
        });

        // Yoke Type Selector
        yokeTypeSelect.addEventListener('change', () => {
            raglanStitchesGroup.classList.toggle('hidden', yokeTypeSelect.value !== 'raglan');
            calculateAll();
        });

        // Global Dynamic Inputs
        const inputsToListen = [
            sampleWidthInput, sampleStitchesInput, sampleHeightInput, sampleRowsInput, sampleWeightInput,
            targetWidthInput, targetHeightInput, customEaseInput, multipleValueInput, edgeStitchesInput,
            neckCircumferenceInput, chestCircumferenceInput, armCircumferenceInput, yokeDepthInput,
            underarmStitchesInput, raglanLineStitchesInput
        ];

        inputsToListen.forEach(input => {
            if (input) {
                input.addEventListener('input', () => {
                    if ([sampleWidthInput, sampleStitchesInput, sampleHeightInput, sampleRowsInput].includes(input)) {
                        yarnPresetSelect.value = 'custom';
                    }
                    calculateAll();
                });
            }
        });

        // Actions
        themeToggleBtn.addEventListener('click', toggleTheme);
        copyRecipeBtn.addEventListener('click', copyFlatRecipeToClipboard);
        printRecipeBtn.addEventListener('click', () => window.print());
        copyYokeRecipeBtn.addEventListener('click', copyYokeRecipeToClipboard);
        printYokeBtn.addEventListener('click', () => window.print());
    }

    // --- MAIN CALCULATION ROUTER ---
    function calculateAll() {
        // Parse Common Gauge
        const sampleW = parseFloat(sampleWidthInput.value) || 10;
        const sampleSts = parseFloat(sampleStitchesInput.value) || 20;
        const sampleH = parseFloat(sampleHeightInput.value) || 10;
        const sampleRws = parseFloat(sampleRowsInput.value) || 26;
        const sampleWt = parseFloat(sampleWeightInput.value) || 0;

        const stsPerCm = sampleSts / sampleW;
        const rwsPerCm = sampleRws / sampleH;

        if (currentMode === 'flat') {
            calculateFlatMode(stsPerCm, rwsPerCm, sampleW, sampleH, sampleWt);
        } else {
            calculateYokeMode(stsPerCm, rwsPerCm);
        }
    }

    // --- MODE 1: FLAT CALCULATOR ENGINE ---
    function calculateFlatMode(stsPerCm, rwsPerCm, sampleW, sampleH, sampleWt) {
        const targetW = parseFloat(targetWidthInput.value) || 50;
        const targetH = parseFloat(targetHeightInput.value) || 60;

        let easeCm = 0;
        switch (easeSelect.value) {
            case 'fitted': easeCm = -3; break;
            case 'exact': easeCm = 0; break;
            case 'relaxed': easeCm = 5; break;
            case 'oversize': easeCm = 12; break;
            case 'custom': easeCm = parseFloat(customEaseInput.value) || 0; break;
        }

        const effectiveWidth = Math.max(1, targetW + easeCm);
        const rawStitches = effectiveWidth * stsPerCm;
        let finalStitches = Math.round(rawStitches);
        let noticeText = `Exacto para ${effectiveWidth.toFixed(1)} cm de ancho`;

        const patternType = patternPresetSelect.value;
        if (patternType === 'rib1x1') {
            finalStitches = Math.round(rawStitches / 2) * 2;
            noticeText = `Ajustado a Múltiplo de 2 (Elástico 1x1)`;
        } else if (patternType === 'rib2x2') {
            finalStitches = Math.round(rawStitches / 4) * 4;
            noticeText = `Ajustado a Múltiplo de 4 (Elástico 2x2)`;
        } else if (patternType === 'rib2x2edge') {
            const k = Math.round((rawStitches - 2) / 4);
            finalStitches = (k * 4) + 2;
            noticeText = `Ajustado a Múltiplo de 4 + 2`;
        } else if (patternType === 'custom') {
            const mult = Math.max(1, parseInt(multipleValueInput.value) || 1);
            const edge = Math.max(0, parseInt(edgeStitchesInput.value) || 0);
            const k = Math.round((rawStitches - edge) / mult);
            finalStitches = Math.max(edge + mult, (k * mult) + edge);
            noticeText = `Ajustado a Múltiplo de ${mult} + ${edge}`;
        }

        const finalRows = Math.round(targetH * rwsPerCm);

        let weightNotice = '--';
        if (sampleWt > 0) {
            const sampleArea = sampleW * sampleH;
            const projectArea = effectiveWidth * targetH;
            const craftMultiplier = (currentCraft === 'crochet') ? 1.25 : 1.0;
            const totalGrams = (projectArea / sampleArea) * sampleWt * craftMultiplier;
            const skeins50g = Math.ceil(totalGrams / 50);
            const skeins100g = Math.ceil(totalGrams / 100);

            weightNotice = `~${Math.round(totalGrams)}g (${skeins50g} ovillos de 50g / ${skeins100g} de 100g)`;
        }

        // Update UI
        animateNumber(finalStitchesCountEl, finalStitches);
        finalRowsCountEl.textContent = `${finalRows} vts`;
        effectiveWidthDisplayEl.textContent = `${effectiveWidth.toFixed(1)} cm`;
        gaugeDensityEl.textContent = `${stsPerCm.toFixed(2)} pts/cm | ${rwsPerCm.toFixed(2)} vts/cm`;
        estimatedWeightEl.textContent = weightNotice;
        multipleAdjustmentNoticeEl.textContent = noticeText;

        renderFabricDiagram(sampleW, sampleH, effectiveWidth, targetH);
    }

    // --- MODE 2: YOKE (CANESÚ) ENGINE ---
    function calculateYokeMode(stsPerCm, rwsPerCm) {
        const neckCm = parseFloat(neckCircumferenceInput.value) || 44;
        const chestCm = parseFloat(chestCircumferenceInput.value) || 96;
        const armCm = parseFloat(armCircumferenceInput.value) || 32;
        const yokeDepthCm = parseFloat(yokeDepthInput.value) || 22;
        const underarmSts = parseInt(underarmStitchesInput.value) || 8;
        const raglanLineSts = parseInt(raglanLineStitchesInput.value) || 2;
        const yokeStyle = yokeTypeSelect.value;

        // 1. Initial Neck Cast-On Stitches
        let rawNeckStitches = Math.round(neckCm * stsPerCm);
        // Make even for symmetry
        if (rawNeckStitches % 2 !== 0) rawNeckStitches += 1;

        // 2. Yoke Depth Rows
        const yokeDepthRows = Math.round(yokeDepthCm * rwsPerCm);

        // 3. Body & Sleeve Target Stitches
        const totalChestStitches = Math.round(chestCm * stsPerCm);
        const singleSleeveStitches = Math.round(armCm * stsPerCm);

        // Stitches without underarm
        const bodySoloStitches = totalChestStitches - (underarmSts * 2);
        const sleeveSoloStitches = singleSleeveStitches - underarmSts;

        // Total Stitches at bottom of Yoke (before separation)
        const totalYokeBottomStitches = bodySoloStitches + (sleeveSoloStitches * 2);

        // 4. Initial Distribution at Neckline
        let frontSts = 0, backSts = 0, rightSleeveSts = 0, leftSleeveSts = 0;

        if (yokeStyle === 'raglan') {
            const totalRaglanSts = raglanLineSts * 4;
            const availableNeckSts = Math.max(8, rawNeckStitches - totalRaglanSts);

            frontSts = Math.round(availableNeckSts * 0.34);
            backSts = Math.round(availableNeckSts * 0.34);
            rightSleeveSts = Math.round(availableNeckSts * 0.16);
            leftSleeveSts = Math.round(availableNeckSts * 0.16);

            // Re-balance exact total
            const sum = frontSts + backSts + rightSleeveSts + leftSleeveSts + totalRaglanSts;
            const delta = rawNeckStitches - sum;
            frontSts += delta;
        } else {
            // Circular Yoke
            frontSts = Math.round(rawNeckStitches * 0.35);
            backSts = Math.round(rawNeckStitches * 0.35);
            rightSleeveSts = Math.round(rawNeckStitches * 0.15);
            leftSleeveSts = Math.round(rawNeckStitches * 0.15);
        }

        // 5. Increase Calculations
        const totalIncreasesNeeded = Math.max(0, totalYokeBottomStitches - rawNeckStitches);

        let increaseNotice = '';
        if (yokeStyle === 'raglan') {
            // 8 increases per increase round
            const increaseRounds = Math.ceil(totalIncreasesNeeded / 8);
            const roundFreq = Math.max(1, Math.round(yokeDepthRows / increaseRounds));
            increaseNotice = `1 aumento a cada lado de las 4 líneas raglán cada ${roundFreq} vueltas (${increaseRounds} veces total)`;
            increaseFrequencyRowEl.classList.remove('hidden');
        } else {
            increaseNotice = `Distribuye ${totalIncreasesNeeded} aumentos en 3 o 4 vueltas de aumento uniformes`;
            increaseFrequencyRowEl.classList.remove('hidden');
        }

        // Update UI
        animateNumber(neckStitchesOutputEl, rawNeckStitches);
        yokeDepthRowsNoticeEl.textContent = `Profundidad: ${yokeDepthRows} vueltas (${yokeDepthCm} cm)`;
        frontStitchesDisplayEl.textContent = `${frontSts} pts`;
        backStitchesDisplayEl.textContent = `${backSts} pts`;
        rightSleeveDisplayEl.textContent = `${rightSleeveSts} pts`;
        leftSleeveDisplayEl.textContent = `${leftSleeveSts} pts`;

        totalYokeStitchesDisplayEl.textContent = `${totalYokeBottomStitches} pts`;
        totalBodyStitchesDisplayEl.textContent = `${totalChestStitches} pts (${Math.round(totalChestStitches/2)} Del / ${Math.round(totalChestStitches/2)} Esp)`;
        totalIncreasesDisplayEl.textContent = `+${totalIncreasesNeeded} pts`;
        increaseFrequencyDisplayEl.textContent = increaseNotice;

        renderYokeDiagram(rawNeckStitches, totalYokeBottomStitches, yokeStyle);
    }

    // --- ANIMATED NUMBER COUNTER ---
    function animateNumber(element, targetNum) {
        const startNum = parseInt(element.textContent) || 0;
        if (startNum === targetNum) return;

        element.classList.add('pulse');
        setTimeout(() => element.classList.remove('pulse'), 200);

        let current = startNum;
        const diff = targetNum - startNum;
        const steps = 10;
        const increment = diff / steps;
        let stepCount = 0;

        const timer = setInterval(() => {
            stepCount++;
            current += increment;
            element.textContent = Math.round(current);
            if (stepCount >= steps) {
                element.textContent = targetNum;
                clearInterval(timer);
            }
        }, 15);
    }

    // --- SVG SIMULATION RENDERING ---
    function renderFabricDiagram(sW, sH, pW, pH) {
        const svgW = 400, svgH = 180, padding = 20;
        const maxRealW = Math.max(pW, 40);
        const maxRealH = Math.max(pH, 30);
        const scale = Math.min((svgW - padding * 2) / maxRealW, (svgH - padding * 2) / maxRealH);

        const projectSvgW = pW * scale;
        const projectSvgH = pH * scale;
        const sampleSvgW = sW * scale;
        const sampleSvgH = sH * scale;

        const startX = (svgW - projectSvgW) / 2;
        const startY = (svgH - projectSvgH) / 2;

        let svgHtml = `
            <defs>
                <pattern id="knitPattern" width="8" height="8" patternUnits="userSpaceOnUse">
                    <path d="M 0 4 Q 2 0 4 4 T 8 4" fill="none" stroke="rgba(200, 109, 81, 0.25)" stroke-width="1.2"/>
                    <path d="M 0 8 Q 2 4 4 8 T 8 8" fill="none" stroke="rgba(200, 109, 81, 0.25)" stroke-width="1.2"/>
                </pattern>
            </defs>
            <rect x="${startX}" y="${startY}" width="${projectSvgW}" height="${projectSvgH}" 
                  rx="6" fill="url(#knitPattern)" stroke="var(--accent-primary)" stroke-width="2" stroke-dasharray="4 2"/>
            <text x="${startX + projectSvgW / 2}" y="${startY + 16}" fill="var(--text-secondary)" font-size="11" font-weight="600" text-anchor="middle">
                Tejido Final: ${pW.toFixed(1)} cm × ${pH.toFixed(1)} cm
            </text>
            <rect x="${startX}" y="${startY + projectSvgH - sampleSvgH}" width="${sampleSvgW}" height="${sampleSvgH}" 
                  rx="4" fill="rgba(131, 197, 190, 0.35)" stroke="#0F3835" stroke-width="2"/>
            <text x="${startX + sampleSvgW / 2}" y="${startY + projectSvgH - sampleSvgH / 2 + 4}" fill="#0F3835" font-size="10" font-weight="700" text-anchor="middle">
                Muestra (${sW}×${sH} cm)
            </text>
        `;
        fabricSvgEl.innerHTML = svgHtml;
    }

    function renderYokeDiagram(neckSts, totalSts, yokeStyle) {
        const svgW = 400, svgH = 200;
        const centerX = svgW / 2, centerY = 90;

        let svgHtml = '';

        if (yokeStyle === 'raglan') {
            svgHtml = `
                <!-- Neck Ring -->
                <ellipse cx="${centerX}" cy="45" rx="55" ry="25" fill="none" stroke="var(--accent-primary)" stroke-width="3"/>
                <text x="${centerX}" y="49" fill="var(--text-primary)" font-size="11" font-weight="700" text-anchor="middle">Cuello: ${neckSts} pts</text>

                <!-- Raglan Expansion Lines -->
                <line x1="${centerX - 35}" y1="62" x2="${centerX - 120}" y2="155" stroke="var(--accent-secondary)" stroke-width="2.5" stroke-dasharray="4 2"/>
                <line x1="${centerX + 35}" y1="62" x2="${centerX + 120}" y2="155" stroke="var(--accent-secondary)" stroke-width="2.5" stroke-dasharray="4 2"/>
                <line x1="${centerX - 20}" y1="68" x2="${centerX - 60}" y2="165" stroke="var(--accent-secondary)" stroke-width="2.5" stroke-dasharray="4 2"/>
                <line x1="${centerX + 20}" y1="68" x2="${centerX + 60}" y2="165" stroke="var(--accent-secondary)" stroke-width="2.5" stroke-dasharray="4 2"/>

                <!-- Bottom Body Curve -->
                <path d="M ${centerX - 120} 155 Q ${centerX} 190 ${centerX + 120} 155" fill="none" stroke="var(--badge-bg)" stroke-width="3"/>
                <text x="${centerX}" y="150" fill="var(--text-secondary)" font-size="11" font-weight="600" text-anchor="middle">Sisa / Pecho: ${totalSts} pts totales</text>
            `;
        } else {
            // Circular Yoke Concentric Rings
            svgHtml = `
                <circle cx="${centerX}" cy="${centerY}" r="35" fill="none" stroke="var(--accent-primary)" stroke-width="3"/>
                <circle cx="${centerX}" cy="${centerY}" r="55" fill="none" stroke="var(--accent-secondary)" stroke-width="2" stroke-dasharray="3 3"/>
                <circle cx="${centerX}" cy="${centerY}" r="75" fill="none" stroke="var(--badge-bg)" stroke-width="3"/>

                <text x="${centerX}" y="${centerY - 5}" fill="var(--text-primary)" font-size="11" font-weight="700" text-anchor="middle">Cuello: ${neckSts} pts</text>
                <text x="${centerX}" y="${centerY + 85}" fill="var(--text-secondary)" font-size="11" font-weight="600" text-anchor="middle">Separación: ${totalSts} pts totales</text>
            `;
        }

        yokeSvgEl.innerHTML = svgHtml;
    }

    // --- COPY RECIPES TO CLIPBOARD ---
    function copyFlatRecipeToClipboard() {
        const craftName = currentCraft === 'palitos' ? 'Dos Agujas / Palitos 🥢' : 'Crochet / Ganchillo 🪡';
        const recipeText = 
`🧶 FICHA TÉCNICA TEJEMATH (TEJIDO PLANO) 🧶
---------------------------------
Técnica: ${craftName}
Muestra: ${sampleStitchesInput.value} pts × ${sampleRowsInput.value} vts en ${sampleWidthInput.value}×${sampleHeightInput.value} cm
Densidad: ${gaugeDensityEl.textContent}

📌 RESULTADO:
- PUNTOS A MONTAR: ${finalStitchesCountEl.textContent} pts
- Vueltas a tejer: ${finalRowsCountEl.textContent}
- Ancho efectivo: ${effectiveWidthDisplayEl.textContent}
- Ajuste: ${multipleAdjustmentNoticeEl.textContent}
- Estimación Lana: ${estimatedWeightEl.textContent}
---------------------------------
Calculado con TejeMath ✨`;

        navigator.clipboard.writeText(recipeText).then(() => {
            showToast('¡Ficha técnica plana copiada! 🧶');
        }).catch(() => showToast('Ficha técnica copiada.'));
    }

    function copyYokeRecipeToClipboard() {
        const craftName = currentCraft === 'palitos' ? 'Dos Agujas / Palitos 🥢' : 'Crochet / Ganchillo 🪡';
        const yokeStyle = yokeTypeSelect.value === 'raglan' ? 'Canesú Raglán' : 'Canesú Circular';

        const recipeText = 
`👚 FICHA TÉCNICA DE CANESÚ TOP-DOWN TEJEMATH 👚
---------------------------------
Técnica: ${craftName} | Estilo: ${yokeStyle}
Muestra Base: ${sampleStitchesInput.value} pts × ${sampleRowsInput.value} vts en ${sampleWidthInput.value}×${sampleHeightInput.value} cm

📌 MONTAJE E INICIO (CUELLO):
- Puntos Totales a Montar: ${neckStitchesOutputEl.textContent} pts
- Profundidad: ${yokeDepthRowsNoticeEl.textContent}

📌 DISTRIBUCIÓN INICIAL DEL CUELLO:
- Delantero: ${frontStitchesDisplayEl.textContent}
- Espalda: ${backStitchesDisplayEl.textContent}
- Manga Derecha: ${rightSleeveDisplayEl.textContent}
- Manga Izquierda: ${leftSleeveDisplayEl.textContent}

📌 FINAL DEL CANESÚ (SEPARACIÓN SISA):
- Puntos en Aguja Totales: ${totalYokeStitchesDisplayEl.textContent}
- Puntos Pecho / Cuerpo: ${totalBodyStitchesDisplayEl.textContent}
- Puntos a aumentar: ${totalIncreasesDisplayEl.textContent}
- Frecuencia: ${increaseFrequencyDisplayEl.textContent}
---------------------------------
Calculado con TejeMath ✨`;

        navigator.clipboard.writeText(recipeText).then(() => {
            showToast('¡Ficha de Canesú copiada! 👚');
        }).catch(() => showToast('Ficha de Canesú copiada.'));
    }

    function showToast(msg) {
        toastEl.textContent = msg;
        toastEl.classList.remove('hidden');
        setTimeout(() => toastEl.classList.add('hidden'), 3000);
    }

    // --- THEME MANAGEMENT ---
    function initTheme() {
        const savedTheme = localStorage.getItem('tejemath_theme') || 'light';
        if (savedTheme === 'dark') {
            document.body.classList.add('theme-dark');
            themeToggleBtn.querySelector('.theme-icon').textContent = '☀️';
        }
    }

    function toggleTheme() {
        document.body.classList.toggle('theme-dark');
        const isDark = document.body.classList.contains('theme-dark');
        themeToggleBtn.querySelector('.theme-icon').textContent = isDark ? '☀️' : '🌙';
        localStorage.setItem('tejemath_theme', isDark ? 'dark' : 'light');
    }
});
