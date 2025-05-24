const languageMap = {
    'en': 'English',
    'vi': 'Vietnamese',
    'fr': 'French',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese',
    'es': 'Spanish',
    'de': 'German',
    'it': 'Italian',
    'ru': 'Russian',
    'pt': 'Portuguese',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'th': 'Thai',
    'id': 'Indonesian',
    'nl': 'Dutch',
    // Add more language codes and names as needed
};

/**
 * Converts a single language code (e.g., 'en', 'fr') or a comma-separated string
 * of codes (e.g., 'en, fr') to their full English name(s).
 * If a code is not found, returns the original code.
 *
 * @param {string} languageCodeOrCodes The language code or comma-separated string of codes to convert.
 * @returns {string} The full language name(s) joined by ", " or the original code/string if not found or invalid.
 */
export const formatLanguageCode = (languageCodeOrCodes) => {
    if (!languageCodeOrCodes) {
        return 'N/A'; // Or another default like ''
    }

    // Trim whitespace from the input string
    const trimmedInput = languageCodeOrCodes.trim();

    // Check if the input contains a comma, indicating multiple codes
    if (trimmedInput.includes(',')) {
        // Split the string into individual codes
        const codes = trimmedInput.split(',');

        // Map each code to its formatted name, trim whitespace, and filter out empty results
        const formattedNames = codes
            .map(code => {
                const trimmedCode = code.trim().toLowerCase();
                // Return the full name if found, otherwise return the original trimmed code
                return languageMap[trimmedCode] || code.trim();
            })
            .filter(name => name); // Remove any empty strings that might result from extra commas

        // Join the formatted names with ", "
        return formattedNames.join(', ');
    } else {
        // Handle single code case (existing logic)
        const lowerCaseCode = trimmedInput.toLowerCase();
        return languageMap[lowerCaseCode] || trimmedInput;
    }
};