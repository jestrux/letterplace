/*
* Taken from
* https://github.com/jrusev/demos/blob/gh-pages/LetterpressJS/game/scripts/random-letters.js
*/
export const generateRandomLeters =  () => {
    var minNumberOfVowels = 5,
        maxNumberOfVowels = 6,
        lettersCount = 25,
        exactNumberOfVowels = getRandomInt(minNumberOfVowels, maxNumberOfVowels),
        vowelsCodes = getVowelsCodes(),
        randomLettersIndex,
        randomVowelsIndex,
        randomVowelCode,
        consonantCodes = getConsonantCodes(vowelsCodes),
        randomConsonantIndex,
        randomConsonantCode,
        letters = [],
        currentLetter,
        i,
        j;

    // generate vowels
    for (i = 0; i < exactNumberOfVowels; i += 1) {
        randomLettersIndex = getRandomInt(0, lettersCount - 1);
        randomVowelsIndex = getRandomInt(0, vowelsCodes.length - 1);
        randomVowelCode = vowelsCodes[randomVowelsIndex];
        while (true) {
            if (!letters[randomLettersIndex]) {
                letters[randomLettersIndex] = String.fromCharCode(randomVowelCode);
                break;
            } else {
                randomLettersIndex = getRandomInt(0, lettersCount - 1);
            }
        }
    }

    // generate consonants
    for (j = 0; j < lettersCount; j += 1) {
        if (!letters[j]) {
            randomConsonantIndex = getRandomInt(0, consonantCodes.length - 1);
            randomConsonantCode = consonantCodes[randomConsonantIndex];
            currentLetter = String.fromCharCode(randomConsonantCode);
            letters[j] = currentLetter;
        }
    }

    return letters;
}

function getRandomInt(min, max) {
    if (min === max) {
        return min;
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getVowelsCodes() {
    var vowels = [
        'A'.charCodeAt(0),
        'E'.charCodeAt(0),
        'I'.charCodeAt(0),
        'O'.charCodeAt(0),
        'U'.charCodeAt(0)
    ];

    return vowels;
}

function getConsonantCodes(vowelsCodes) {
    var startCode = 'A'.charCodeAt(0),
        endCode = 'Z'.charCodeAt(0),
        consonants = [],
        i;

    for (i = startCode; i <= endCode; i += 1) {
        if (vowelsCodes.indexOf(i) === -1) {
            consonants.push(i);
        }
    }

    return consonants;
}