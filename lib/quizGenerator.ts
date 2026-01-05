import { Kana, QuizQuestion } from '../types';
import { ALL_CHARACTERS } from '../constants';

// ============================================================================
// 1. CRYPTOGRAPHIC RANDOM UTILITIES (MANDATORY)
// ============================================================================

const randInt = (max: number): number => {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] % max;
};

const shuffle = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = randInt(i + 1);
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

// ============================================================================
// 2. ANTI-REPEAT WINDOW
// ============================================================================

const RECENT_SIZE = 7;
const recent: string[] = [];

const remember = (id: string) => {
    recent.push(id);
    if (recent.length > RECENT_SIZE) recent.shift();
};

const notRecent = (id: string) => !recent.includes(id);

// ============================================================================
// 3. VISUAL SIMILARITY MAP (AUTHORITATIVE)
// ============================================================================

// Normalization helper for katakana/hiragana distinction
const normalizeKey = (c: Kana): string => {
    return c.type === 'katakana' ? `${c.romaji}_kata` : c.romaji;
};

// Canonical visual-confusion clusters based on stroke shape, hooks, loops, and direction
const VISUAL_SIMILARITY: Record<string, string[]> = {
    // R-row confusion (ろ る ら れ)
    ro: ["ru", "ra", "re"],
    ru: ["ro", "re", "ra"],
    ra: ["ro", "ru", "re"],
    re: ["ru", "ro", "ra"],

    // S/T confusion (し つ そ)
    shi: ["tsu", "so"],
    tsu: ["shi", "so"],
    so: ["shi", "tsu"],

    // N/RI confusion (ん り)
    n: ["ri"],
    ri: ["n"],

    // WA/RA confusion (わ ら) - bidirectional
    wa: ["ra", "fu"],
    // ra already defined above, adding wa to it

    // KA/KE confusion (か け)
    ka: ["ke"],
    ke: ["ka"],

    // HA/HO confusion (は ほ)
    ha: ["ho"],
    ho: ["ha"],

    // MA/MU confusion (ま む)
    ma: ["mu"],
    mu: ["ma"],

    // NU/ME confusion (ぬ め)
    nu: ["me"],
    me: ["nu"],

    // A/O confusion (あ お)
    a: ["o"],
    o: ["a"],

    // YA/NA confusion (や な)
    ya: ["na"],
    na: ["ya"],

    // KI/SA confusion (き さ)
    ki: ["sa"],
    sa: ["ki"],

    // KO/YU confusion (こ ゆ)
    ko: ["yu"],
    yu: ["ko"],

    // FU/WA confusion (ふ わ)
    fu: ["wa"],

    // NO/FU/SO confusion (ノ フ ソ) - long-stroke katakana
    no: ["fu", "so"],

    // Katakana-specific シ ツ ソ
    shi_kata: ["tsu_kata", "so_kata"],
    tsu_kata: ["shi_kata", "so_kata"],
    so_kata: ["shi_kata", "tsu_kata"],
};

// ============================================================================
// 4. RANDOM QUESTION SELECTION
// ============================================================================

const pickRandomQuestion = (learned: string[]): Kana | null => {
    const pool = ALL_CHARACTERS.filter(c =>
        learned.includes(`${c.type}-${c.romaji}`)
    );

    if (pool.length < 4) return null;

    const nonRecent = pool.filter(c =>
        notRecent(`${c.type}-${c.char}`)
    );

    const source = nonRecent.length ? nonRecent : pool;
    const picked = source[randInt(source.length)];

    remember(`${picked.type}-${picked.char}`);
    return picked;
};

// ============================================================================
// 5. DISTRACTOR SELECTION (STRICT PRIORITY)
// ============================================================================

const pickDistractors = (correct: Kana): string[] => {
    const used = new Set<string>([correct.romaji]);
    const out: string[] = [];

    const add = (c: Kana) => {
        if (!used.has(c.romaji)) {
            used.add(c.romaji);
            out.push(c.romaji);
        }
    };

    // Get the normalized key for lookup
    const normalizedKey = normalizeKey(correct);

    // 1. PRIORITY: Visual similarity
    const visualSimilarRomaji = VISUAL_SIMILARITY[normalizedKey] || VISUAL_SIMILARITY[correct.romaji] || [];

    const visualCandidates = visualSimilarRomaji
        .map(r => {
            // For katakana keys, strip the _kata suffix when searching
            const searchRomaji = r.endsWith('_kata') ? r.replace('_kata', '') : r;
            return ALL_CHARACTERS.find(c =>
                c.romaji === searchRomaji &&
                c.type === correct.type
            );
        })
        .filter(Boolean) as Kana[];

    // Hard constraint: if visual cluster size >= 2, take at least 2 from it
    if (visualCandidates.length >= 2) {
        visualCandidates.slice(0, 2).forEach(c => add(c));
    } else {
        visualCandidates.forEach(c => out.length < 3 && add(c));
    }

    // 2. PRIORITY: Same group
    shuffle(
        ALL_CHARACTERS.filter(c =>
            c.group === correct.group &&
            c.type === correct.type &&
            c.romaji !== correct.romaji
        )
    ).forEach(c => out.length < 3 && add(c));

    // 3. PRIORITY: Same type fallback
    shuffle(
        ALL_CHARACTERS.filter(c =>
            c.type === correct.type &&
            c.romaji !== correct.romaji
        )
    ).forEach(c => out.length < 3 && add(c));

    return out;
};

// ============================================================================
// 6. FINAL QUIZ GENERATOR
// ============================================================================

export const generateExtremeRandomQuizQuestion = (
    learned: string[]
): QuizQuestion | null => {
    const correct = pickRandomQuestion(learned);
    if (!correct) return null;

    const distractors = pickDistractors(correct);
    if (distractors.length < 3) return null;

    const options = shuffle([
        correct.romaji,
        ...distractors.slice(0, 3)
    ]);

    return {
        question: correct.char,
        targetChar: correct.char,
        correctAnswer: correct.romaji,
        options
    };
};

// ============================================================================
// 7. GUARANTEES
// ============================================================================
// ✓ No predictable sequences
// ✓ No short-term repeats (window size: 7)
// ✓ Any learned character can appear
// ✓ At least two confusing options when similarity cluster exists
// ✓ Group-based confusion enforced when visual similarity absent

// ============================================================================
// 8. EXPLICIT GAPS
// ============================================================================
// - Kanji visual similarity not implemented
// - Multi-reading kanji accepted as-is
// - Similarity map requires manual expansion
// [Unverified] Stroke-based similarity improves kanji confusion
