
export const fuzzyMatch = (strA: string, strB: string, fuzziness = 1) => {
    if (strA === "" || strB === "") {
        return false;
    }

    if (strA === strB) return true;

    const { largest, smallest } = findLargestSmallest(strA, strB);
    const maxIters = largest.length - smallest.length;
    const minMatches = smallest.length - fuzziness;

    for (let i = 0; i < maxIters; i++) {
        let matches = 0;
        for (let smIdx = 0; smIdx < smallest.length; smIdx++) {
            if (smallest[smIdx] === largest[smIdx + i]) {
                matches++;
            }
        }
        if (matches > 0 && matches >= minMatches) {
            return true;
        }
    }

    return false;
};

const findLargestSmallest = (a: string, b: string) =>
    a.length > b.length
        ? {
            largest: a,
            smallest: b
        }
        : {
            largest: b,
            smallest: a
        };

export function baseName(str: string) {
    var base = new String(str).substring(str.lastIndexOf('/') + 1);
    if (base.lastIndexOf(".") != -1)
        base = base.substring(0, base.lastIndexOf("."));
    return base;
}

export function extName(filename: string) {
    if (!filename) return "";
    var ext = (/[^./\\]*$/.exec(filename) || [""])[0];
    return ext;
}

export function titleCase(str: string) {
    var splitStr = str.split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        // You do not need to check if i is larger than splitStr length, as your for does that for you
        // Assign it back to the array
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    // Directly return the joined string
    return splitStr.join(' ');
}