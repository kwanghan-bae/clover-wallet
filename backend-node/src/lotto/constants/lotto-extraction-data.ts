export enum ExtractionMethod {
    RANDOM = 'RANDOM',
    DREAM = 'DREAM',
    SAJU = 'SAJU',
    STATISTICS_HOT = 'STATISTICS_HOT',
    STATISTICS_COLD = 'STATISTICS_COLD',
    HOROSCOPE = 'HOROSCOPE',
    PERSONAL_SIGNIFICANCE = 'PERSONAL_SIGNIFICANCE',
    NATURE_PATTERNS = 'NATURE_PATTERNS',
    ANCIENT_DIVINATION = 'ANCIENT_DIVINATION',
    COLORS_SOUNDS = 'COLORS_SOUNDS',
    ANIMAL_OMENS = 'ANIMAL_OMENS'
}

export enum ZodiacSign {
    ARIES = 'ARIES', TAURUS = 'TAURUS', GEMINI = 'GEMINI', CANCER = 'CANCER',
    LEO = 'LEO', VIRGO = 'VIRGO', LIBRA = 'LIBRA', SCORPIO = 'SCORPIO',
    SAGITTARIUS = 'SAGITTARIUS', CAPRICORN = 'CAPRICORN', AQUARIUS = 'AQUARIUS', PISCES = 'PISCES'
}

export const LottoExtractionData = {
    dreamNumberMap: {
        "돼지": [8, 18, 28],
        "조상": [14, 15, 25],
        "용": [1, 5, 12],
        "물": [1, 6, 16],
        "불": [3, 8, 13],
    } as Record<string, number[]>,

    fibonacciNumbers: [1, 2, 3, 5, 8, 13, 21, 34],

    horoscopeNumberMap: {
        [ZodiacSign.ARIES]: [6, 17, 25, 34, 41],
        [ZodiacSign.TAURUS]: [5, 15, 23, 33, 45],
        [ZodiacSign.GEMINI]: [1, 10, 19, 28, 37],
        [ZodiacSign.CANCER]: [2, 7, 11, 20, 29],
        [ZodiacSign.LEO]: [1, 9, 18, 27, 36],
        [ZodiacSign.VIRGO]: [4, 14, 24, 33, 43],
        [ZodiacSign.LIBRA]: [6, 16, 25, 35, 44],
        [ZodiacSign.SCORPIO]: [8, 13, 21, 30, 38],
        [ZodiacSign.SAGITTARIUS]: [3, 12, 21, 30, 39],
        [ZodiacSign.CAPRICORN]: [4, 8, 17, 26, 34],
        [ZodiacSign.AQUARIUS]: [7, 11, 22, 31, 40],
        [ZodiacSign.PISCES]: [2, 9, 18, 27, 35],
    } as Record<ZodiacSign, number[]>,

    naturePatternsMap: {
        "봄": [3, 4, 5],
        "여름": [6, 7, 8],
        "가을": [9, 10, 11],
        "겨울": [12, 1, 2]
    } as Record<string, number[]>,

    ancientDivinationMap: {
        "주역": [1, 6, 8, 11, 24, 30],
        "룬": [3, 9, 13, 21, 27, 40]
    } as Record<string, number[]>,

    colorsSoundsMap: {
        "빨강": [1, 10, 19, 28, 37],
        "초록": [4, 13, 22, 31, 40],
        "금색": [7, 16, 25, 34, 43]
    } as Record<string, number[]>,

    animalOmensMap: {
        "까치": [7, 17, 27],
        "검은고양이": [13, 26, 39],
        "뱀": [4, 14, 24]
    } as Record<string, number[]>
};
