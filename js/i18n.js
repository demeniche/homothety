// All user-facing text. English (en) and Uzbek Latin (uz).
// Tutorial bodies are HTML. Keep the math notation identical in both languages.

export const STR = {
  en: {
    appTitle: 'Homothety',
    appSub: 'An interactive 3D guide · Geometry, grade 9',
    tabLearn: 'Learn', tabPlay: 'Playground', tabPresets: 'Presets', tabSettings: 'Settings',
    prev: '← Back', next: 'Next →', stepOf: 'Step {a} of {b}', tryIt: 'Try it',
    play: 'Play', replay: 'Replay',
    viewTop: 'Top', view3d: '3D', viewFit: 'Fit', viewRotate: 'Rotate',
    measurements: 'Measurements', formula: 'The rule',
    kLabel: 'Ratio k',
    // classification
    kIdentity: 'k = 1 · identity: every point stays in place',
    kSym: 'k = −1 · central symmetry about O',
    kZero: 'k = 0 is not allowed: all points would collapse into O',
    kEnlarge: '|k| > 1 · enlargement',
    kReduce: '|k| < 1 · reduction',
    kNegNote: 'k < 0 · image is on the opposite side of O',
    // playground
    tools: 'Tool',
    toolMove: 'Move', toolAdd: 'Add points', toolCentre: 'Place centre O',
    hintMove: 'Drag a blue point to move it, the gold point O to move the centre, or a red point along its line to change k.',
    hintAdd: 'Click on the grid to add vertices. They are connected in the order you add them.',
    hintCentre: 'Click anywhere on the grid to put the centre O there.',
    shape: 'Shape', clear: 'Clear', removeLast: 'Remove last point',
    centreQuick: 'Put the centre…', cOrigin: 'at (0, 0)', cCentroid: 'inside the figure', cVertex: 'at vertex A', cOutside: 'outside',
    show: 'Show', showImage: 'Image', showRays: 'Rays through O', showLabels: 'Labels', showFill: 'Fill', showMeasure: 'Measurements', showCoords: 'Coordinates card',
    selected: 'Selected', nothingSelected: 'Click a point to select it.', del: 'Delete point',
    pointsCount: '{n} points', solidNote: 'This is a 3D solid. Edit its vertices by selecting them, or load a flat shape from Presets.',
    backFlat: 'Back to a flat triangle',
    emptyShape: 'No figure yet. Choose “Add points” and click on the grid, or pick a preset.',
    // measurements
    mDist: 'Distances from O', mSides: 'Sides', mEdges: 'Edges', mArea: 'Area', mPerim: 'Perimeter', mAngles: 'Angles',
    mSurface: 'Surface area', mVolume: 'Volume', ratio: 'ratio',
    mCheck: 'expected',
    // settings
    sLang: 'Language', sTheme: 'Theme', themeDark: 'Dark', themeLight: 'Light (projector)',
    sSnap: 'Snap points to grid', snapOff: 'Off', sKStep: 'Step of k', sDecimals: 'Decimal places',
    sSpeed: 'Animation speed', speedSlow: 'Slow', speedNormal: 'Normal', speedFast: 'Fast',
    sPrime: 'Name of image points', sGrid: 'Grid and axes', on: 'On', off: 'Off',
    sReset: 'Reset everything',
    // presets
    gBasics: 'Basics', gNeg: 'Negative ratio', gCentre: 'Where is the centre?', gShapes: 'Other figures', g3d: '3D · beyond the textbook',
    load: 'Load',
    // quiz
    check: 'Check', correct: 'Correct!', wrong: 'Not quite. Correct answer: ',
    score: 'Score: {a} / {b}',
    goPlay: 'Open the Playground', goPresets: 'Browse presets',
    footer: 'School geometry project · built with Three.js',
  },
  uz: {
    appTitle: 'Gomotetiya',
    appSub: 'Interaktiv 3D qoʻllanma · Geometriya, 9-sinf',
    tabLearn: 'Oʻrganish', tabPlay: 'Tajriba', tabPresets: 'Namunalar', tabSettings: 'Sozlamalar',
    prev: '← Orqaga', next: 'Keyingi →', stepOf: '{a}-qadam / {b}', tryIt: 'Sinab koʻring',
    play: 'Boshlash', replay: 'Qayta',
    viewTop: 'Yuqoridan', view3d: '3D', viewFit: 'Moslash', viewRotate: 'Aylantirish',
    measurements: 'Oʻlchovlar', formula: 'Qoida',
    kLabel: 'Koeffitsiyent k',
    kIdentity: 'k = 1 · ayniy almashtirish: hamma nuqtalar joyida qoladi',
    kSym: 'k = −1 · O nuqtaga nisbatan markaziy simmetriya',
    kZero: 'k = 0 boʻlishi mumkin emas: hamma nuqtalar O ga tushib qoladi',
    kEnlarge: '|k| > 1 · kattalashtirish',
    kReduce: '|k| < 1 · kichraytirish',
    kNegNote: 'k < 0 · tasvir O ning qarama-qarshi tomonida',
    tools: 'Asbob',
    toolMove: 'Surish', toolAdd: 'Nuqta qoʻshish', toolCentre: 'O markazni qoʻyish',
    hintMove: 'Koʻk nuqtani surib siljiting, oltin rang O nuqtani surib markazni oʻzgartiring yoki qizil nuqtani toʻgʻri chiziq boʻylab surib k ni oʻzgartiring.',
    hintAdd: 'Uchlarni qoʻshish uchun toʻr ustiga bosing. Ular qoʻshilgan tartibda tutashtiriladi.',
    hintCentre: 'O markazni qoʻyish uchun toʻrning istalgan joyiga bosing.',
    shape: 'Shakl', clear: 'Tozalash', removeLast: 'Oxirgi nuqtani oʻchirish',
    centreQuick: 'Markazni qoʻyish…', cOrigin: '(0, 0) nuqtaga', cCentroid: 'shakl ichiga', cVertex: 'A uchga', cOutside: 'tashqariga',
    show: 'Koʻrsatish', showImage: 'Tasvir', showRays: 'O orqali nurlar', showLabels: 'Belgilar', showFill: 'Boʻyash', showMeasure: 'Oʻlchovlar', showCoords: 'Koordinatalar kartasi',
    selected: 'Tanlangan', nothingSelected: 'Tanlash uchun nuqtani bosing.', del: 'Nuqtani oʻchirish',
    pointsCount: '{n} ta nuqta', solidNote: 'Bu fazoviy jism. Uchlarini tanlab tahrirlang yoki Namunalardan tekis shakl yuklang.',
    backFlat: 'Tekis uchburchakka qaytish',
    emptyShape: 'Hali shakl yoʻq. “Nuqta qoʻshish”ni tanlab toʻrga bosing yoki namuna tanlang.',
    mDist: 'O gacha masofalar', mSides: 'Tomonlar', mEdges: 'Qirralar', mArea: 'Yuza', mPerim: 'Perimetr', mAngles: 'Burchaklar',
    mSurface: 'Sirt yuzasi', mVolume: 'Hajm', ratio: 'nisbat',
    mCheck: 'kutilgan',
    sLang: 'Til', sTheme: 'Mavzu', themeDark: 'Qorongʻi', themeLight: 'Yorugʻ (proyektor)',
    sSnap: 'Nuqtalarni toʻrga yopishtirish', snapOff: 'Yoʻq', sKStep: 'k qadami', sDecimals: 'Kasr xonalari',
    sSpeed: 'Animatsiya tezligi', speedSlow: 'Sekin', speedNormal: 'Oddiy', speedFast: 'Tez',
    sPrime: 'Tasvir nuqtalari nomi', sGrid: 'Toʻr va oʻqlar', on: 'Ha', off: 'Yoʻq',
    sReset: 'Hammasini qayta tiklash',
    gBasics: 'Asoslar', gNeg: 'Manfiy koeffitsiyent', gCentre: 'Markaz qayerda?', gShapes: 'Boshqa shakllar', g3d: '3D · darslikdan tashqari',
    load: 'Yuklash',
    check: 'Tekshirish', correct: 'Toʻgʻri!', wrong: 'Notoʻgʻri. Toʻgʻri javob: ',
    score: 'Natija: {a} / {b}',
    goPlay: 'Tajriba maydonini ochish', goPresets: 'Namunalarni koʻrish',
    footer: 'Maktab geometriya loyihasi · Three.js asosida',
  },
};

// Tutorial: text only. The scene for each step lives in main.js (STEP_SCENES), same order.
export const TUTORIAL = {
  en: [
    {
      title: 'What is a homothety?',
      body: `<p>A <b>homothety</b> is a transformation that <b>enlarges or reduces</b> a figure from one fixed point. The figure keeps its shape; only its size (and maybe its direction) changes.</p>
<p>A homothety is given by two things:</p>
<ul><li>a <b>centre</b> <span class="c-centre">O</span> — a fixed point;</li><li>a <b>ratio</b> <b>k</b> — a number, k ≠ 0.</li></ul>
<p>In the picture, the <span class="c-orig">blue</span> triangle is the original figure and the <span class="c-img">red</span> triangle is its image under a homothety with centre O and k = 2.</p>`,
      tryIt: 'Drag the empty space to turn the camera. Scroll (or pinch) to zoom. Press “Top” to look from above.',
    },
    {
      title: 'The centre O',
      body: `<p>The centre <span class="c-centre">O</span> is the point the homothety “grows” from. It is the only point that stays where it is: <b>O maps to O</b> (when k ≠ 1).</p>
<p>Every other point moves <b>along the straight line through O</b>. Think of a lamp at O shining on the figure: the image is like its shadow on a wall.</p>`,
      tryIt: 'Drag the gold point O. See how the image moves and changes position, but always stays twice as big.',
    },
    {
      title: 'The rule for one point',
      body: `<p>Take a point A. Its image A′ is found like this:</p>
<ol><li>Draw the line through O and A.</li><li>Put A′ on that line so that</li></ol>
<div class="formula">OA′ = |k| · OA</div>
<p>If <b>k &gt; 0</b>, A′ is on the <b>ray OA</b> (same side of O as A). If <b>k &lt; 0</b>, A′ is on the <b>opposite side</b> of O.</p>
<p>Both cases fit in one vector equation:</p>
<div class="formula"><span class="vec">OA′</span> = k · <span class="vec">OA</span></div>`,
      tryIt: 'Drag the red point A′ along the line. k changes, and the card in the top-left corner shows that OA′ = |k| · OA every time.',
    },
    {
      title: 'The image of a figure',
      body: `<p>To find the image of a polygon, apply the rule to <b>each vertex</b>: A → A′, B → B′, C → C′. Then join the image points in the same order.</p>
<p>With coordinates, if O = (x₀, y₀), then a point (x, y) goes to</p>
<div class="formula">x′ = x₀ + k(x − x₀)<br>y′ = y₀ + k(y − y₀)</div>
<p>The image A′B′C′ is <b>similar</b> to ABC: same shape, different size.</p>`,
      tryIt: 'Press ▶ Play below the scene. Watch every vertex slide along its own ray from O at the same time.',
    },
    {
      title: 'Enlarge or reduce?',
      body: `<p>The size of |k| decides what happens:</p>
<ul><li><b>|k| &gt; 1</b> — enlargement: the image is bigger.</li><li><b>|k| &lt; 1</b> — reduction: the image is smaller, and (for 0 &lt; k &lt; 1) it lies between O and the figure.</li><li><b>k = 1</b> — nothing moves (identity).</li></ul>`,
      tryIt: 'Click the chips ½, 1, 2 and 3 under the scene, or move the slider slowly.',
    },
    {
      title: 'Negative ratio',
      body: `<p>When <b>k &lt; 0</b>, every point jumps <b>through O</b> to the other side. The image is turned by 180°, but it is still similar to the figure.</p>
<p>Important special case: <b>k = −1</b> is the <b>central symmetry</b> about O. Then OA′ = OA, so O is the midpoint of AA′.</p>
<p class="note">Why k ≠ 0? With k = 0 every point would go to O, and the figure would disappear into one point. That is not a homothety.</p>`,
      tryIt: 'Move the slider from 2 down to −2. Watch the image shrink into O and come out on the other side.',
    },
    {
      title: 'Properties',
      body: `<p>Under a homothety with ratio k:</p>
<ul>
<li>every length is multiplied by |k|: <b>A′B′ = |k| · AB</b>;</li>
<li>the area is multiplied by k²: <b>S′ = k² · S</b>;</li>
<li>angles do not change: <b>∠A′ = ∠A</b>;</li>
<li>a line goes to a <b>parallel</b> line (or to itself if it passes through O): <b>A′B′ ∥ AB</b>.</li>
</ul>
<p>So a homothety is a <b>similarity</b> with similarity ratio |k|.</p>`,
      tryIt: 'Look at the Measurements card. Change k or drag points: the ratios are always |k| for sides and k² for area.',
    },
    {
      title: 'How to find the centre',
      body: `<p>Suppose you are given a figure and its image, but not the centre. Draw lines through <b>corresponding points</b>: AA′, BB′, CC′.</p>
<p>All these lines meet at <b>one point</b> — that is the centre O.</p>
<p>Then k = OA′ / OA, with a minus sign if A and A′ are on opposite sides of O.</p>`,
      tryIt: 'Watch the lines appear and meet at O. Then drag a blue vertex: the lines still meet at one point.',
    },
    {
      title: 'Beyond the textbook: space',
      body: `<p>The same rule <span class="vec">OA′</span> = k · <span class="vec">OA</span> works in <b>3D space</b>. A pyramid becomes a pyramid, a cube becomes a cube.</p>
<ul><li>edges are multiplied by |k|;</li><li>surface area by k²;</li><li><b>volume by |k|³</b>.</li></ul>
<p>Here a pyramid is enlarged with k = 2 from a centre O on the floor. Thin dashed lines drop from the top vertices to the floor to show their height.</p>`,
      tryIt: 'Press “Rotate” to orbit around the solids. In Presets you can find a cube, an hourglass and a star made of two tetrahedra.',
    },
    {
      title: 'Check yourself',
      body: '',
      quiz: true,
      tryIt: '',
    },
  ],
  uz: [
    {
      title: 'Gomotetiya nima?',
      body: `<p><b>Gomotetiya</b> — bu shaklni bitta qoʻzgʻalmas nuqtadan <b>kattalashtiradigan yoki kichraytiradigan</b> almashtirish. Shaklning koʻrinishi saqlanadi, faqat uning oʻlchami (va balki yoʻnalishi) oʻzgaradi.</p>
<p>Gomotetiya ikki narsa bilan beriladi:</p>
<ul><li><b>markaz</b> <span class="c-centre">O</span> — qoʻzgʻalmas nuqta;</li><li><b>koeffitsiyent</b> <b>k</b> — son, k ≠ 0.</li></ul>
<p>Rasmda <span class="c-orig">koʻk</span> uchburchak — berilgan shakl, <span class="c-img">qizil</span> uchburchak esa markazi O va k = 2 boʻlgan gomotetiyadagi uning tasviri.</p>`,
      tryIt: 'Kamerani aylantirish uchun boʻsh joyni suring. Yaqinlashtirish uchun gʻildirakni aylantiring. Yuqoridan qarash uchun “Yuqoridan”ni bosing.',
    },
    {
      title: 'Markaz O',
      body: `<p><span class="c-centre">O</span> markaz — gomotetiya shu nuqtadan “oʻsadi”. Faqat shu nuqta joyida qoladi: <b>O nuqta O ga oʻtadi</b> (k ≠ 1 boʻlganda).</p>
<p>Qolgan har bir nuqta <b>O orqali oʻtuvchi toʻgʻri chiziq boʻylab</b> siljiydi. O nuqtada chiroq turibdi deb tasavvur qiling: tasvir — shaklning devordagi soyasiga oʻxshaydi.</p>`,
      tryIt: 'Oltin rang O nuqtani suring. Tasvir joyini oʻzgartiradi, lekin doim ikki marta katta boʻlib qoladi.',
    },
    {
      title: 'Bitta nuqta uchun qoida',
      body: `<p>A nuqtani olaylik. Uning tasviri A₁ quyidagicha topiladi:</p>
<ol><li>O va A orqali toʻgʻri chiziq oʻtkazamiz.</li><li>A₁ ni shu chiziqda shunday qoʻyamizki,</li></ol>
<div class="formula">OA₁ = |k| · OA</div>
<p>Agar <b>k &gt; 0</b> boʻlsa, A₁ <b>OA nurida</b> yotadi (O ning A bilan bir tomonida). Agar <b>k &lt; 0</b> boʻlsa, A₁ O ning <b>qarama-qarshi tomonida</b> boʻladi.</p>
<p>Ikkala holat bitta vektor tenglikka sigʻadi:</p>
<div class="formula"><span class="vec">OA₁</span> = k · <span class="vec">OA</span></div>`,
      tryIt: 'Qizil A₁ nuqtani chiziq boʻylab suring. k oʻzgaradi, chap yuqori burchakdagi karta esa har safar OA₁ = |k| · OA ekanini koʻrsatadi.',
    },
    {
      title: 'Shaklning tasviri',
      body: `<p>Koʻpburchakning tasvirini topish uchun qoidani <b>har bir uchiga</b> qoʻllaymiz: A → A₁, B → B₁, C → C₁. Soʻng tasvir nuqtalarini shu tartibda tutashtiramiz.</p>
<p>Koordinatalarda, agar O = (x₀, y₀) boʻlsa, (x, y) nuqta quyidagi nuqtaga oʻtadi:</p>
<div class="formula">x′ = x₀ + k(x − x₀)<br>y′ = y₀ + k(y − y₀)</div>
<p>A₁B₁C₁ tasvir ABC ga <b>oʻxshash</b>: shakli bir xil, oʻlchami boshqa.</p>`,
      tryIt: 'Sahna ostidagi ▶ Boshlash tugmasini bosing. Har bir uch bir vaqtda O dan chiqqan oʻz nuri boʻylab siljiydi.',
    },
    {
      title: 'Kattalashtirishmi yoki kichraytirish?',
      body: `<p>Nima boʻlishini |k| ning qiymati hal qiladi:</p>
<ul><li><b>|k| &gt; 1</b> — kattalashtirish: tasvir kattaroq.</li><li><b>|k| &lt; 1</b> — kichraytirish: tasvir kichikroq va (0 &lt; k &lt; 1 da) O bilan shakl orasida yotadi.</li><li><b>k = 1</b> — hech narsa siljimaydi (ayniy almashtirish).</li></ul>`,
      tryIt: 'Sahna ostidagi ½, 1, 2 va 3 tugmalarini bosing yoki slayderni sekin suring.',
    },
    {
      title: 'Manfiy koeffitsiyent',
      body: `<p><b>k &lt; 0</b> boʻlganda har bir nuqta <b>O orqali</b> narigi tomonga oʻtadi. Tasvir 180° ga burilgan boʻladi, lekin shaklga baribir oʻxshash.</p>
<p>Muhim xususiy hol: <b>k = −1</b> — bu O nuqtaga nisbatan <b>markaziy simmetriya</b>. Bunda OA₁ = OA, ya'ni O nuqta AA₁ kesmaning oʻrtasi.</p>
<p class="note">Nega k ≠ 0? k = 0 boʻlsa, hamma nuqtalar O ga tushadi va shakl bitta nuqtaga aylanib qoladi. Bu gomotetiya emas.</p>`,
      tryIt: 'Slayderni 2 dan −2 gacha suring. Tasvir O ga qisqarib, narigi tomondan chiqishini kuzating.',
    },
    {
      title: 'Xossalari',
      body: `<p>Koeffitsiyenti k boʻlgan gomotetiyada:</p>
<ul>
<li>har bir uzunlik |k| ga koʻpayadi: <b>A₁B₁ = |k| · AB</b>;</li>
<li>yuza k² ga koʻpayadi: <b>S₁ = k² · S</b>;</li>
<li>burchaklar oʻzgarmaydi: <b>∠A₁ = ∠A</b>;</li>
<li>toʻgʻri chiziq <b>parallel</b> toʻgʻri chiziqqa oʻtadi (O orqali oʻtsa, oʻziga): <b>A₁B₁ ∥ AB</b>.</li>
</ul>
<p>Demak, gomotetiya — oʻxshashlik koeffitsiyenti |k| boʻlgan <b>oʻxshash almashtirish</b>.</p>`,
      tryIt: 'Oʻlchovlar kartasiga qarang. k ni oʻzgartiring yoki nuqtalarni suring: tomonlar nisbati doim |k|, yuzalar nisbati k².',
    },
    {
      title: 'Markazni qanday topish mumkin',
      body: `<p>Faraz qilaylik, shakl va uning tasviri berilgan, markazi esa noma'lum. <b>Mos nuqtalar</b> orqali toʻgʻri chiziqlar oʻtkazamiz: AA₁, BB₁, CC₁.</p>
<p>Bu chiziqlarning hammasi <b>bitta nuqtada</b> kesishadi — bu O markaz.</p>
<p>Soʻng k = OA₁ / OA, agar A va A₁ O ning har xil tomonida boʻlsa, minus ishora bilan.</p>`,
      tryIt: 'Chiziqlar paydo boʻlib, O da kesishishini kuzating. Keyin koʻk uchni suring: chiziqlar baribir bitta nuqtada kesishadi.',
    },
    {
      title: 'Darslikdan tashqari: fazo',
      body: `<p><span class="vec">OA₁</span> = k · <span class="vec">OA</span> qoidasi <b>fazoda</b> ham ishlaydi. Piramida piramidaga, kub kubga oʻtadi.</p>
<ul><li>qirralar |k| ga koʻpayadi;</li><li>sirt yuzasi k² ga;</li><li><b>hajm |k|³ ga</b>.</li></ul>
<p>Bu yerda piramida poldagi O markazdan k = 2 bilan kattalashtirilgan. Ingichka uzuq chiziqlar uchlarning balandligini koʻrsatish uchun polga tushirilgan.</p>`,
      tryIt: 'Jismlar atrofida aylanish uchun “Aylantirish”ni bosing. Namunalarda kub, qum soati va ikki tetraedrdan iborat yulduz bor.',
    },
    {
      title: 'Oʻzingizni tekshiring',
      body: '',
      quiz: true,
      tryIt: '',
    },
  ],
};

// answer = index of the correct option
export const QUIZ = {
  en: [
    { q: 'A side of a triangle is AB = 4 cm. The homothety has k = 3. What is A′B′?', options: ['4 cm', '7 cm', '12 cm', '36 cm'], answer: 2 },
    { q: 'A figure has area S = 5 cm². The homothety has k = −2. What is the area of the image?', options: ['−10 cm²', '10 cm²', '20 cm²', '−20 cm²'], answer: 2 },
    { q: 'A homothety with k = −1 is the same as…', options: ['a rotation by 90°', 'a central symmetry', 'an axial symmetry', 'a translation'], answer: 1 },
    { q: 'O = (0, 0), A = (2, 3), k = 2. Where is A′?', options: ['(4, 6)', '(4, 3)', '(2, 6)', '(−4, −6)'], answer: 0 },
    { q: 'Under a homothety, the line AB (not through O) goes to a line A′B′ that is…', options: ['perpendicular to AB', 'parallel to AB', 'always shorter than AB', 'the same line AB'], answer: 1 },
    { q: 'Under a homothety, an angle of 40° goes to an angle of…', options: ['40°', '40° · k', '40° · k²', 'it depends on O'], answer: 0 },
  ],
  uz: [
    { q: 'Uchburchakning tomoni AB = 4 sm. Gomotetiya koeffitsiyenti k = 3. A₁B₁ nechaga teng?', options: ['4 sm', '7 sm', '12 sm', '36 sm'], answer: 2 },
    { q: 'Shaklning yuzasi S = 5 sm². Gomotetiya koeffitsiyenti k = −2. Tasvirning yuzasi qancha?', options: ['−10 sm²', '10 sm²', '20 sm²', '−20 sm²'], answer: 2 },
    { q: 'k = −1 boʻlgan gomotetiya bu…', options: ['90° ga burish', 'markaziy simmetriya', 'oʻq simmetriyasi', 'parallel koʻchirish'], answer: 1 },
    { q: 'O = (0, 0), A = (2, 3), k = 2. A₁ qayerda?', options: ['(4, 6)', '(4, 3)', '(2, 6)', '(−4, −6)'], answer: 0 },
    { q: 'Gomotetiyada AB toʻgʻri chiziq (O orqali oʻtmaydigan) A₁B₁ chiziqqa oʻtadi, u…', options: ['AB ga perpendikulyar', 'AB ga parallel', 'doim AB dan qisqa', 'AB ning oʻzi'], answer: 1 },
    { q: 'Gomotetiyada 40° li burchak … burchakka oʻtadi', options: ['40°', '40° · k', '40° · k²', 'O ga bogʻliq'], answer: 0 },
  ],
};

// [name, description]
export const PRESET_TEXT = {
  en: {
    enlarge: ['Enlargement, k = 2', 'A triangle doubled from a centre outside it.'],
    reduce: ['Reduction, k = ½', 'The image is half the size and lies between O and the figure.'],
    triple: ['k = 3', 'Sides ×3, area ×9. Compare in the Measurements card.'],
    symmetry: ['Central symmetry, k = −1', 'The image is the same size, turned 180° around O.'],
    neg2: ['k = −2', 'Twice as big, on the other side of O.'],
    neghalf: ['k = −½', 'Half the size, on the other side of O.'],
    vertex: ['Centre at a vertex', 'O = A, so A stays in place and the two squares share a corner.'],
    inside: ['Centre inside', 'O is the centre of the square: the squares are nested.'],
    findcentre: ['Find the centre', 'Lines AA′, BB′, CC′ all pass through one point — O.'],
    house: ['House, k = 1.5', 'A pentagon. Every angle stays the same.'],
    star: ['Star, k = −1.5', 'A non-convex shape works too.'],
    quad: ['Any quadrilateral', 'Drag its vertices to make your own shape.'],
    cube: ['Cube, k = 2', 'Edges ×2, surface ×4, volume ×8.'],
    hourglass: ['Hourglass, k = −1', 'Centre at the apex of a pyramid: central symmetry in space.'],
    stella: ['Star of two tetrahedra', 'A tetrahedron and its image with k = −1 about its centre.'],
    pyramid: ['Pyramid, k = ½', 'Centre at the apex: cutting off the top of a pyramid.'],
  },
  uz: {
    enlarge: ['Kattalashtirish, k = 2', 'Uchburchak tashqaridagi markazdan ikki marta kattalashtirilgan.'],
    reduce: ['Kichraytirish, k = ½', 'Tasvir ikki marta kichik va O bilan shakl orasida yotadi.'],
    triple: ['k = 3', 'Tomonlar ×3, yuza ×9. Oʻlchovlar kartasida solishtiring.'],
    symmetry: ['Markaziy simmetriya, k = −1', 'Tasvir oʻsha oʻlchamda, O atrofida 180° ga burilgan.'],
    neg2: ['k = −2', 'Ikki marta katta, O ning narigi tomonida.'],
    neghalf: ['k = −½', 'Ikki marta kichik, O ning narigi tomonida.'],
    vertex: ['Markaz uchda', 'O = A, shuning uchun A joyida qoladi va kvadratlar umumiy uchga ega.'],
    inside: ['Markaz ichkarida', 'O — kvadrat markazi: kvadratlar ichma-ich joylashgan.'],
    findcentre: ['Markazni toping', 'AA₁, BB₁, CC₁ chiziqlari bitta nuqtadan — O dan oʻtadi.'],
    house: ['Uycha, k = 1.5', 'Beshburchak. Har bir burchak oʻzgarmaydi.'],
    star: ['Yulduz, k = −1.5', 'Botiq shakl uchun ham ishlaydi.'],
    quad: ['Ixtiyoriy toʻrtburchak', 'Oʻz shaklingizni yasash uchun uchlarini suring.'],
    cube: ['Kub, k = 2', 'Qirralar ×2, sirt ×4, hajm ×8.'],
    hourglass: ['Qum soati, k = −1', 'Markaz piramida uchida: fazodagi markaziy simmetriya.'],
    stella: ['Ikki tetraedr yulduzi', 'Tetraedr va uning markaziga nisbatan k = −1 dagi tasviri.'],
    pyramid: ['Piramida, k = ½', 'Markaz uchda: piramidaning uchini kesib olish.'],
  },
};
