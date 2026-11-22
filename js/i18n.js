// All user-facing text: English (en) and Uzbek Latin (uz).
// In missions, <b>…</b> marks the thing to do (shown in the accent colour).

export const STR = {
  en: {
    scenes: 'Scenes', tutorial: 'Tutorial', theory: 'Formulas',
    tipMove: 'Move points', tipAdd: 'Add points', tipCentre: 'Place centre O', tipUndo: 'Remove last point', tipClear: 'Clear figure',
    tipTop: 'Top view', tipIso: '3D view', tipFit: 'Fit to screen', tipOrbit: 'Auto-rotate',
    centre: 'Centre O', point: 'Point', rule: 'Rule', ratios: 'Ratios', show: 'Show',
    noSel: 'Click a point', noFig: 'No figure. Pick the + tool and click on the grid.',
    dist: 'Distance from O', sides: 'Sides', edges: 'Edges', perim: 'Perimeter', area: 'Area', angles: 'Angles', surface: 'Surface', volume: 'Volume',
    details: 'values', hide: 'hide', del: 'Delete',
    rays: 'Rays', labels: 'Labels', fill: 'Fill', grid: 'Grid', image: 'Image', ghost: 'Steps',
    kZero: 'k = 0 is not allowed', kId: 'identity', kSym: 'central symmetry', kEn: 'enlargement', kRe: 'reduction', kNeg: 'flipped through O',
    // settings
    sTheme: 'Theme', paper: 'Paper', night: 'Night', sSnap: 'Snap', off: 'off', sKStep: 'k step', sDec: 'Decimals', sSpeed: 'Speed', sName: 'Image names', sReset: 'Reset app',
    // coach
    step: 'TASK', skip: 'Exit tutorial', next: 'Next', gotIt: 'Got it', finish: 'Finish', doIt: 'do it to continue',
    challenge: 'CHALLENGE',
    // theory sheet
    thDef: 'Definition', thCoord: 'Coordinates', thProps: 'Under homothety with ratio k',
    thLen: 'length', thArea: 'area', thVol: 'volume', thAng: 'angle', thLine: 'line',
    thPar: 'parallel line', thKinds: 'Cases',
  },
  uz: {
    scenes: 'Sahnalar', tutorial: 'Oʻrgatish', theory: 'Formulalar',
    tipMove: 'Nuqtalarni surish', tipAdd: 'Nuqta qoʻshish', tipCentre: 'O markazni qoʻyish', tipUndo: 'Oxirgi nuqtani oʻchirish', tipClear: 'Shaklni tozalash',
    tipTop: 'Yuqoridan', tipIso: '3D koʻrinish', tipFit: 'Ekranga moslash', tipOrbit: 'Avto-aylantirish',
    centre: 'Markaz O', point: 'Nuqta', rule: 'Qoida', ratios: 'Nisbatlar', show: 'Koʻrsatish',
    noSel: 'Nuqtani bosing', noFig: 'Shakl yoʻq. + asbobini tanlab, toʻrga bosing.',
    dist: 'O gacha masofa', sides: 'Tomonlar', edges: 'Qirralar', perim: 'Perimetr', area: 'Yuza', angles: 'Burchaklar', surface: 'Sirt', volume: 'Hajm',
    details: 'qiymatlar', hide: 'yashirish', del: 'Oʻchirish',
    rays: 'Nurlar', labels: 'Belgilar', fill: 'Boʻyash', grid: 'Toʻr', image: 'Tasvir', ghost: 'Qadamlar',
    kZero: 'k = 0 boʻlishi mumkin emas', kId: 'ayniy', kSym: 'markaziy simmetriya', kEn: 'kattalashtirish', kRe: 'kichraytirish', kNeg: 'O orqali agʻdarilgan',
    sTheme: 'Mavzu', paper: 'Qogʻoz', night: 'Tun', sSnap: 'Yopishish', off: 'yoʻq', sKStep: 'k qadami', sDec: 'Kasr', sSpeed: 'Tezlik', sName: 'Tasvir nomi', sReset: 'Qayta tiklash',
    step: 'VAZIFA', skip: 'Chiqish', next: 'Keyingi', gotIt: 'Tushundim', finish: 'Tugatish', doIt: 'davom etish uchun bajaring',
    challenge: 'SINOV',
    thDef: 'Ta’rif', thCoord: 'Koordinatalar', thProps: 'Koeffitsiyenti k boʻlgan gomotetiyada',
    thLen: 'uzunlik', thArea: 'yuza', thVol: 'hajm', thAng: 'burchak', thLine: 'toʻgʻri chiziq',
    thPar: 'parallel chiziq', thKinds: 'Holatlar',
  },
};

// Tutorial missions. Logic for each id lives in main.js (MISSIONS).
export const MISSION_TEXT = {
  en: {
    k2:      ['Drag the ruler to <b>k = 2</b>', 'The red triangle is the image. Every vertex is now twice as far from O.'],
    moveO:   ['Drag the centre <b>O</b>', 'O is the centre. The image always grows from it.'],
    play:    ['Press <b>Play</b>', 'Each vertex slides along its own ray from O.'],
    half:    ['Set <b>k = ½</b>', '|k| < 1 makes the figure smaller. The image is between O and the figure.'],
    neg:     ['Make <b>k negative</b>', 'k < 0: the image jumps through O to the other side.'],
    sym:     ['Set <b>k = −1</b>', 'k = −1 is central symmetry: OA′ = OA.'],
    dragImg: ['Drag the red point <b>A′</b>', 'k follows your hand: OA′ = |k| · OA, always.'],
    ratios:  ['Read the <b>Ratios</b> panel', 'Sides ×|k|. Area ×k². Angles do not change.'],
    tool:    ['Pick the <b>+ tool</b>', ''],
    build:   ['Click <b>4 times</b> on the grid', 'Any polygon works the same way.'],
    inside:  ['Use the <b>O tool</b> and click <b>inside</b> your shape', 'O inside: the image surrounds the figure.'],
    orbit:   ['Drag empty space to <b>turn the camera</b>', 'It is all happening on a plane in 3D space.'],
    cube:    ['Open <b>Scenes</b> and load the <b>Cube</b>', 'In space it works too. Volume ×|k|³: here 2³ = 8.'],
    ch1:     ['Land the red triangle on the <b>dashed target</b>', 'k = 3. Sides ×3, area ×9.'],
    ch2:     ['Hit the target again', 'k = −½. Half the size, other side of O.'],
    ch3:     ['<b>Move O</b> until the image hits the target. Hint: where do the thin lines cross?', 'The lines AA′, BB′, CC′ meet at O. That is how you find the centre.'],
    end:     ['Done. You know homothety.', 'Explore the Scenes, or build your own figure.'],
  },
  uz: {
    k2:      ['Chizgʻichni <b>k = 2</b> ga suring', 'Qizil uchburchak — tasvir. Har bir uch endi O dan ikki marta uzoqda.'],
    moveO:   ['<b>O</b> markazni suring', 'O — markaz. Tasvir doim undan oʻsadi.'],
    play:    ['<b>Play</b> tugmasini bosing', 'Har bir uch O dan chiqqan oʻz nuri boʻylab siljiydi.'],
    half:    ['<b>k = ½</b> qiling', '|k| < 1 shaklni kichraytiradi. Tasvir O bilan shakl orasida.'],
    neg:     ['<b>k ni manfiy</b> qiling', 'k < 0: tasvir O orqali narigi tomonga oʻtadi.'],
    sym:     ['<b>k = −1</b> qiling', 'k = −1 — markaziy simmetriya: OA₁ = OA.'],
    dragImg: ['Qizil <b>A₁</b> nuqtani suring', 'k qoʻlingizga ergashadi: doim OA₁ = |k| · OA.'],
    ratios:  ['<b>Nisbatlar</b> panelini oʻqing', 'Tomonlar ×|k|. Yuza ×k². Burchaklar oʻzgarmaydi.'],
    tool:    ['<b>+ asbobini</b> tanlang', ''],
    build:   ['Toʻrga <b>4 marta</b> bosing', 'Har qanday koʻpburchak xuddi shunday ishlaydi.'],
    inside:  ['<b>O asbobi</b> bilan shaklingiz <b>ichiga</b> bosing', 'O ichkarida: tasvir shaklni oʻrab oladi.'],
    orbit:   ['Kamerani <b>aylantirish</b> uchun boʻsh joyni suring', 'Hammasi 3D fazodagi tekislikda sodir boʻlmoqda.'],
    cube:    ['<b>Sahnalar</b>ni oching va <b>Kub</b>ni yuklang', 'Fazoda ham ishlaydi. Hajm ×|k|³: bu yerda 2³ = 8.'],
    ch1:     ['Qizil uchburchakni <b>uzuq chiziqli nishonga</b> tushiring', 'k = 3. Tomonlar ×3, yuza ×9.'],
    ch2:     ['Yana nishonga tushiring', 'k = −½. Ikki marta kichik, O ning narigi tomonida.'],
    ch3:     ['Tasvir nishonga tushguncha <b>O ni suring</b>. Maslahat: ingichka chiziqlar qayerda kesishadi?', 'AA₁, BB₁, CC₁ chiziqlari O da kesishadi. Markaz shunday topiladi.'],
    end:     ['Tayyor. Siz gomotetiyani bilasiz.', 'Sahnalarni koʻring yoki oʻz shaklingizni yasang.'],
  },
};

export const PRESET_TEXT = {
  en: {
    enlarge: 'Triangle, k = 2', reduce: 'Reduction, k = ½', triple: 'k = 3',
    symmetry: 'Central symmetry', neg2: 'k = −2', neghalf: 'k = −½',
    vertex: 'O at a vertex', inside: 'O inside', findcentre: 'Find the centre',
    house: 'Pentagon', star: 'Star, k = −1.5', quad: 'Quadrilateral',
    cube: 'Cube', hourglass: 'Hourglass', pyramid: 'Pyramid, k = ½', stella: 'Two tetrahedra',
  },
  uz: {
    enlarge: 'Uchburchak, k = 2', reduce: 'Kichraytirish, k = ½', triple: 'k = 3',
    symmetry: 'Markaziy simmetriya', neg2: 'k = −2', neghalf: 'k = −½',
    vertex: 'O uchda', inside: 'O ichkarida', findcentre: 'Markazni toping',
    house: 'Beshburchak', star: 'Yulduz, k = −1.5', quad: 'Toʻrtburchak',
    cube: 'Kub', hourglass: 'Qum soati', pyramid: 'Piramida, k = ½', stella: 'Ikki tetraedr',
  },
};

export const GROUP_TEXT = {
  en: { basics: 'Basics', neg: 'Negative k', centre: 'Centre', shapes: 'Shapes', space: '3D' },
  uz: { basics: 'Asoslar', neg: 'Manfiy k', centre: 'Markaz', shapes: 'Shakllar', space: '3D' },
};
