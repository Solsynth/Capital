/**
 * Code 128B encoding for the waybill barcode on the download dialog.
 *
 * Each symbol is six elements (bar, space, bar, space, bar, space) whose widths in
 * modules add up to 11; the stop symbol is seven elements / 13 modules. Element parity
 * is continuous across symbols because every symbol starts on a bar and six elements
 * keeps bar-first alignment for the next one.
 */
const PATTERNS = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312",
  "132212", "221213", "221312", "231212", "112232", "122132", "122231", "113222",
  "123122", "123221", "223211", "221132", "221231", "213212", "223112", "312131",
  "311222", "321122", "321221", "312212", "322112", "322211", "212123", "212321",
  "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121",
  "313121", "211331", "231131", "213113", "213311", "213131", "311123", "311321",
  "331121", "312113", "312311", "332111", "314111", "221411", "431111", "111224",
  "111422", "121124", "121421", "141122", "141221", "112214", "112412", "122114",
  "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112",
  "421211", "212141", "214121", "412121", "111143", "111341", "131141", "114113",
  "114311", "411113", "411311", "113141", "114131", "311141", "411131", "211412",
  "211214", "211232",
];

const START_B = 104;
const STOP = 106;
const STOP_PATTERN = "2331112";

export interface BarcodeElement {
  /** Width in modules. */
  width: number;
  bar: boolean;
}

/**
 * Encodes text as Code 128B elements. Returns null for an empty value or any character
 * outside the set's printable ASCII range (32–126).
 */
export function code128(value: string): BarcodeElement[] | null {
  if (!value) return null;

  const values = [START_B];
  for (const character of value) {
    const code = character.codePointAt(0)!;
    if (code < 32 || code > 126) return null;
    values.push(code - 32);
  }

  let checksum = START_B;
  for (let index = 1; index < values.length; index += 1) checksum += values[index] * index;
  values.push(checksum % 103, STOP);

  return values.flatMap((value) => {
    const pattern = value === STOP ? STOP_PATTERN : PATTERNS[value];
    return [...pattern].map((digit, index) => ({ width: Number(digit), bar: index % 2 === 0 }));
  });
}
