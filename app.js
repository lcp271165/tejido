/* ==========================================
   TejeMath - JavaScript Logic Engine
   Calculadora Experta de Tejido a Palitos y Crochet
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- STATE & DOM ELEMENTS ---
    let currentCraft = 'palitos';

    // Preset data for yarn weights (gauge defaults per 10cm x 10cm)
    const YARN_PRESETS = {
        fingering: { stitches: 30, rows: 40, width: 10, height: 10 },
        sport:     { stitches: 25, rows: 34, width: 10, height: 10 },
        dk:        { stitches: 22, rows: 28, width: 10, height: 10 },
        worsted:   { stitches: 18, rows: 24, width: 10, height: 10 },
        chunky:    { stitches: 14, rows: 18, width: 10, height: 10 },
        superchunky:{ stitches: 9,  rows: 12, width: 10, height: 10 }
    };

    // Inputs
    const craftBtns = document.querySelectorAll('.craft-btn');
    const yarnPresetSelect = document.getElementById('yarnPreset');
    const themeToggleBtn = document.getElementById('themeToggle');

    const sampleWidthInput = document.getElementById('sampleWidth');
    const sampleStitchesInput = document.getElementById('sampleStitches');
    const sampleHeightInput = document.getElementById('sampleHeight');
    const sampleRowsInput = document.getElementById('sampleRows');
    const sampleWeightInput = document.getElementById('sampleWeight');

    const targetWidthInput = document.getElementById('targetWidth');
    const targetHeightInput = document.getElementById('targetHeight');

    const easeSelect = document.getElementById('easeSelect');
    const customEaseGroup = document.getElementById('customEaseGroup');
    const customEaseInput = document.getElementById('customEase');

    const patternPresetSelect = document.getElementById('patternPreset');
    const customPatternInputs = document.getElementById('customPatternInputs');
    const multipleValueInput = document.getElementById('multipleValue');
    const edgeStitchesInput = document.getElementById('edgeStitches');

    // Outputs
    const finalStitchesCountEl = document.getElementById('finalStitchesCount');
    const finalRowsCountEl = document.getElementById('finalRowsCount');
    const effectiveWidthDisplayEl = document.getElementById('effectiveWidthDisplay');
    const gaugeDensityEl = document.getElementById('gaugeDensity');
    const estimatedWeightEl = document.getElementById('estimatedWeight');
    const multipleAdjustmentNoticeEl = document.getElementById('multipleAdjustmentNotice');
    const fabricSvgEl = document.getElementById('fabricSvg');

    // Actions
    const copyRecipeBtn = document.getElementById('copyRecipeBtn');
    const printRecipeBtn = document.getElementById('printRecipeBtn');
    const toastEl = document.getElementById('toast');

    // --- INITIALIZATION & EVENT LISTENERS ---
    initTheme();
    registerEventListeners();
    calculateAll();

    function registerEventListeners() {
        // Craft selector buttons
        craftBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                craftBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentCraft = btn.dataset.craft;
                calculateAll();
            });
        });

        // Yarn presets dropdown
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

        // Ease selection logic
        easeSelect.addEventListener('change', () => {
            if (easeSelect.value === 'custom') {
                customEaseGroup.classList.remove('hidden');
            } else {
                customEaseGroup.classList.add('hidden');
            }
            calculateAll();
        });

        // Pattern repeat / multiple selection logic
        patternPresetSelect.addEventListener('change', () => {
            if (patternPresetSelect.value === 'custom') {
                customPatternInputs.classList.remove('hidden');
            } else {
                customPatternInputs.classList.add('hidden');
            }
            calculateAll();
        });

        // Dynamic calculation on any input change
        const allInputs = [
            sampleWidthInput, sampleStitchesInput, sampleHeightInput, sampleRowsInput, sampleWeightInput,
            targetWidthInput, targetHeightInput, customEaseInput, multipleValueInput, edgeStitchesInput
        ];

        allInputs.forEach(input => {
            input.addEventListener('input', () => {
                // Reset preset selector if user manually modifies sample inputs
                if ([sampleWidthInput, sampleStitchesInput, sampleHeightInput, sampleRowsInput].includes(input)) {
                    yarnPresetSelect.value = 'custom';
                }
                calculateAll();
            });
        });

        // Actions
        themeToggleBtn.addEventListener('click', toggleTheme);
        copyRecipeBtn.addEventListener('click', copyRecipeToClipboard);
        printRecipeBtn.addEventListener('click', () => window.print());
    }

    // --- CORE CALCULATION ENGINE ---
    function calculateAll() {
        // 1. Parse Gauge Inputs
        const sampleW = parseFloat(sampleWidthInput.value) || 10;
        const sampleSts = parseFloat(sampleStitchesInput.value) || 20;
        const sampleH = parseFloat(sampleHeightInput.value) || 10;
        const sampleRws = parseFloat(sampleRowsInput.value) || 26;
        const sampleWt = parseFloat(sampleWeightInput.value) || 0;

        // Density per cm
        const stsPerCm = sampleSts / sampleW;
        const rwsPerCm = sampleRws / sampleH;

        // 2. Target Dimensions & Ease
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

        // 3. Raw Stitches calculation
        const rawStitches = effectiveWidth * stsPerCm;
        let finalStitches = Math.round(rawStitches);
        let noticeText = `Calculado para ${effectiveWidth.toFixed(1)} cm de ancho`;

        // 4. Multiples & Pattern Repeats Adjustment
        const patternType = patternPresetSelect.value;
        if (patternType === 'rib1x1') {
            // Multiple of 2
            finalStitches = Math.round(rawStitches / 2) * 2;
            noticeText = `Ajustado a Múltiplo de 2 (Elástico 1x1)`;
        } else if (patternType === 'rib2x2') {
            // Multiple of 4
            finalStitches = Math.round(rawStitches / 4) * 4;
            noticeText = `Ajustado a Múltiplo de 4 (Elástico 2x2)`;
        } else if (patternType === 'rib2x2edge') {
            // Multiple of 4 + 2
            const k = Math.round((rawStitches - 2) / 4);
            finalStitches = (k * 4) + 2;
            noticeText = `Ajustado a Múltiplo de 4 + 2 (Simétrico)`;
        } else if (patternType === 'custom') {
            const mult = Math.max(1, parseInt(multipleValueInput.value) || 1);
            const edge = Math.max(0, parseInt(edgeStitchesInput.value) || 0);
            const k = Math.round((rawStitches - edge) / mult);
            finalStitches = Math.max(edge + mult, (k * mult) + edge);
            noticeText = `Ajustado a Múltiplo de ${mult} + ${edge}`;
        }

        // 5. Total Rows Calculation
        const finalRows = Math.round(targetH * rwsPerCm);

        // 6. Yarn Weight Estimation
        let weightNotice = '--';
        if (sampleWt > 0) {
            const sampleArea = sampleW * sampleH;
            const projectArea = effectiveWidth * targetH;
            const craftMultiplier = (currentCraft === 'crochet') ? 1.25 : 1.0; // Crochet uses ~25% more yarn
            const totalGrams = (projectArea / sampleArea) * sampleWt * craftMultiplier;

            const skeins50g = Math.ceil(totalGrams / 50);
            const skeins100g = Math.ceil(totalGrams / 100);

            weightNotice = `~${Math.round(totalGrams)}g (${skeins50g} ovillos de 50g / ${skeins100g} de 100g)`;
        }

        // --- UPDATE UI ELEMENTS ---
        animateNumber(finalStitchesCountEl, finalStitches);
        finalRowsCountEl.textContent = `${finalRows} vts`;
        effectiveWidthDisplayEl.textContent = `${effectiveWidth.toFixed(1)} cm`;
        gaugeDensityEl.textContent = `${stsPerCm.toFixed(2)} pts/cm | ${rwsPerCm.toFixed(2)} vts/cm`;
        estimatedWeightEl.textContent = weightNotice;
        multipleAdjustmentNoticeEl.textContent = noticeText;

        // Render SVG Diagram
        renderFabricDiagram(sampleW, sampleH, effectiveWidth, targetH, stsPerCm, rwsPerCm);
    }

    // --- ANIMATED NUMBER COUNTER ---
    function animateNumber(element, targetNum) {
        const startNum = parseInt(element.textContent) || 0;
        if (startNum === targetNum) return;

        element.classList.add('pulse');
        setTimeout(() => element.classList.remove('pulse'), 200);

        let current = startNum;
        const diff = targetNum - startNum;
        const steps = 12;
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

    // --- SVG FABRIC & GAUGE DIAGRAM SIMULATION ---
    function renderFabricDiagram(sW, sH, pW, pH, stsPerCm, rwsPerCm) {
        const svgW = 400;
        const svgH = 180;
        const padding = 20;

        // Calculate proportions to fit within SVG bounds
        const maxRealW = Math.max(pW, 40);
        const maxRealH = Math.max(pH, 30);
        const scale = Math.min((svgW - padding * 2) / maxRealW, (svgH - padding * 2) / maxRealH);

        const projectSvgW = pW * scale;
        const projectSvgH = pH * scale;
        const sampleSvgW = sW * scale;
        const sampleSvgH = sH * scale;

        const startX = (svgW - projectSvgW) / 2;
        const startY = (svgH - projectSvgH) / 2;

        // SVG Content Builder
        let svgHtml = `
            <defs>
                <pattern id="knitPattern" width="8" height="8" patternUnits="userSpaceOnUse">
                    <path d="M 0 4 Q 2 0 4 4 T 8 4" fill="none" stroke="rgba(200, 109, 81, 0.25)" stroke-width="1.2"/>
                    <path d="M 0 8 Q 2 4 4 8 T 8 8" fill="none" stroke="rgba(200, 109, 81, 0.25)" stroke-width="1.2"/>
                </pattern>
            </defs>
            
            <!-- Project Outer Boundary -->
            <rect x="${startX}" y="${startY}" width="${projectSvgW}" height="${projectSvgH}" 
                  rx="6" fill="url(#knitPattern)" stroke="var(--accent-primary)" stroke-width="2" stroke-dasharray="4 2"/>
            <text x="${startX + projectSvgW / 2}" y="${startY + 16}" fill="var(--text-secondary)" font-size="11" font-weight="600" text-anchor="middle">
                Tejido Final: ${pW.toFixed(1)} cm × ${pH.toFixed(1)} cm
            </text>

            <!-- Sample Square Overlay -->
            <rect x="${startX}" y="${startY + projectSvgH - sampleSvgH}" width="${sampleSvgW}" height="${sampleSvgH}" 
                  rx="4" fill="rgba(131, 197, 190, 0.35)" stroke="#0F3835" stroke-width="2"/>
            <text x="${startX + sampleSvgW / 2}" y="${startY + projectSvgH - sampleSvgH / 2 + 4}" fill="#0F3835" font-size="10" font-weight="700" text-anchor="middle">
                Muestra (${sW}×${sH} cm)
            </text>
        `;

        fabricSvgEl.innerHTML = svgHtml;
    }

    // --- COPY RECIPE TO CLIPBOARD ---
    function copyRecipeToClipboard() {
        const craftName = currentCraft === 'palitos' ? 'Dos Agujas / Palitos 🥢' : 'Crochet / Ganchillo 🪡';
        const finalPts = finalStitchesCountEl.textContent;
        const finalRws = finalRowsCountEl.textContent;
        const widthEff = effectiveWidthDisplayEl.textContent;
        const density = gaugeDensityEl.textContent;
        const yarnEst = estimatedWeightEl.textContent;
        const notice = multipleAdjustmentNoticeEl.textContent;

        const recipeText = 
`🧶 FICHA TÉCNICA TEJEMATH 🧶
---------------------------------
Técnica: ${craftName}
Muestra: ${sampleStitchesInput.value} pts × ${sampleRowsInput.value} vts en ${sampleWidthInput.value}×${sampleHeightInput.value} cm
Densidad: ${density}

📌 RESULTADO DEL CÁLCULO:
- PUNTOS A MONTAR: ${finalPts} pts
- Vueltas a tejer: ${finalRws}
- Ancho efectivo (con holgura): ${widthEff}
- Ajuste: ${notice}
- Estimación Lana: ${yarnEst}
---------------------------------
Calculado con TejeMath ✨`;

        navigator.clipboard.writeText(recipeText).then(() => {
            showToast('¡Ficha técnica copiada al portapapeles! 🧶');
        }).catch(err => {
            showToast('Copiaste la ficha técnica exitosamente.');
        });
    }

    function showToast(msg) {
        toastEl.textContent = msg;
        toastEl.classList.remove('hidden');
        setTimeout(() => {
            toastEl.classList.add('hidden');
        }, 3000);
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
