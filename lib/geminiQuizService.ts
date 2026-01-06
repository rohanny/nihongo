import { QuizQuestion, Kana } from '../types';
import { ALL_CHARACTERS } from '../constants';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

/**
 * Generates a quiz question using Google's Gemini API
 * 
 * The quiz structure:
 * - Question: Display a Japanese character (hiragana/katakana/kanji)
 * - Options: 4 romaji options (1 correct + 3 distractors)
 * - Distractors should be:
 *   1. Visually similar characters (same stroke patterns, hooks, loops)
 *   2. Characters from the same phonetic group (e.g., all from 'ka' row)
 *   3. Characters that are commonly confused by learners
 * 
 * The AI should prioritize creating challenging, educational questions that:
 * - Force shape-level recognition rather than elimination by consonant group
 * - Include at least 2 visually confusing options when possible
 * - Avoid predictable patterns
 * - Match real JLPT error patterns
 */
export const generateBatchGeminiQuizQuestions = async (
    learned: string[],
    count: number = 5
): Promise<QuizQuestion[] | null> => {
    if (!GEMINI_API_KEY) {
        console.error('Gemini API key not configured');
        return null;
    }

    if (learned.length < 4) {
        return null;
    }

    // Get the actual character objects from learned IDs
    const learnedCharacters = learned
        .map(id => {
            const [type, romaji] = id.split('-');
            return ALL_CHARACTERS.find(c => c.type === type && c.romaji === romaji);
        })
        .filter(Boolean) as Kana[];

    if (learnedCharacters.length < 4) {
        return null;
    }

    // Build the prompt with context about learned characters
    const prompt = buildBatchQuizPrompt(learnedCharacters, count);

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.9,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048, // Increased for batch
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.statusText}`);
        }

        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
            throw new Error('No response from Gemini API');
        }

        // Parse the JSON response from Gemini
        const quizData = parseGeminiResponse(generatedText);

        if (!Array.isArray(quizData)) {
            console.error('Gemini did not return an array');
            return null;
        }

        // Validate the quiz data
        const validQuestions = quizData
            .map(q => validateAndFormatQuiz(q, learnedCharacters))
            .filter(Boolean) as QuizQuestion[];

        return validQuestions.length > 0 ? validQuestions : null;

    } catch (error) {
        console.error('Error generating Gemini quiz batch:', error);
        return null;
    }
};

// Keep single generation for backward compatibility if needed, but implementation redirects to batch of 1
export const generateGeminiQuizQuestion = async (
    learned: string[]
): Promise<QuizQuestion | null> => {
    const batch = await generateBatchGeminiQuizQuestions(learned, 1);
    return batch ? batch[0] : null;
};

function buildBatchQuizPrompt(learnedCharacters: Kana[], count: number): string {
    // Group characters by type for context
    const characterList = learnedCharacters
        .map(c => `${c.char} (${c.romaji}) [${c.type}, group: ${c.group}]`)
        .join(', ');

    return `You are a Japanese language quiz generator. Generate ${count} challenging quiz questions.

            LEARNED CHARACTERS (${learnedCharacters.length} total):
            ${characterList}

            QUIZ STRUCTURE REQUIREMENTS (Generate a JSON Array of these objects):
            [
                {
                "question": "<Japanese character to display>",
                "targetChar": "<same as question>",
                "correctAnswer": "<romaji reading>",
                "options": ["<romaji1>", "<romaji2>", "<romaji3>", "<romaji4>"]
                },
                ...
            ]

            DISTRACTOR SELECTION RULES (PRIORITY ORDER):
            1. VISUAL SIMILARITY (Highest Priority)
            - Characters with similar stroke patterns, hooks, loops, direction
            - Examples: ろ/る/ら (ro/ru/ra), し/つ/そ (shi/tsu/so), ん/り (n/ri)
            - Include AT LEAST 2 visually similar distractors when possible

            2. SAME PHONETIC GROUP
            - Characters from the same row (e.g., all from 'ka' row: か/き/く/け/こ)
            
            3. COMMON CONFUSIONS
            - Characters that beginners frequently mix up
            - Match real JLPT error patterns

            REQUIREMENTS for EACH question:
            - Pick ONE random character from the learned list as the correct answer
            - Generate exactly 3 distractors (all must be from the learned list)
            - All 4 options must be unique romaji readings
            - Shuffle the options array (correct answer can be at any position)
            - Make it challenging but fair
            - Prioritize visual confusion over phonetic similarity
            - IMPORTANT: vary the target characters across the ${count} questions if possible.

            OUTPUT FORMAT:
            Return ONLY valid JSON Array matching the structure above. No markdown, no explanation, just raw JSON.`;
}

function parseGeminiResponse(text: string): any {
    try {
        // Remove markdown code blocks if present
        let cleaned = text.trim();
        if (cleaned.startsWith('```json')) {
            cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/```\n?/g, '');
        }

        return JSON.parse(cleaned);
    } catch (error) {
        console.error('Failed to parse Gemini response:', error);
        console.error('Raw response:', text);
        return null;
    }
}

function validateAndFormatQuiz(
    quizData: any,
    learnedCharacters: Kana[]
): QuizQuestion | null {
    // Validate structure
    if (!quizData.question || !quizData.correctAnswer || !Array.isArray(quizData.options)) {
        console.error('Invalid quiz structure from Gemini', quizData);
        return null;
    }

    // Validate options array
    if (quizData.options.length !== 4) {
        console.error('Invalid number of options from Gemini');
        return null;
    }

    // Validate that correct answer is in options
    if (!quizData.options.includes(quizData.correctAnswer)) {
        console.error('Correct answer not in options');
        return null;
    }

    // Validate that all options are from learned characters
    const learnedRomaji = new Set(learnedCharacters.map(c => c.romaji));
    const allValid = quizData.options.every((opt: string) => learnedRomaji.has(opt));

    if (!allValid) {
        console.error('Some options are not from learned characters');
        return null;
    }

    return {
        question: quizData.question,
        targetChar: quizData.targetChar || quizData.question,
        correctAnswer: quizData.correctAnswer,
        options: quizData.options
    };
}
