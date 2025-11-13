// interface RankableItem {
//     [key: string]: any;
//     finish?: string;
// }

// export function assignFinish<T extends RankableItem>(
//     objArr: T[], 
//     keyToRank: keyof T, 
//     sortDescending: boolean, 
//     finishes: string[]
// ): T[] {
//     const returnArr: T[] = [];
//     const sortedObjArr = objArr.sort((a, b) => {
//         const aVal = a[keyToRank] as number;
//         const bVal = b[keyToRank] as number;
//         return sortDescending ? bVal - aVal : aVal - bVal;
//     });
    
//     sortedObjArr.forEach((el, index) => {
//         if (index === 0) {
//             el.finish = finishes.shift();
//         }
//         if (index > 0) {
//             if (el[keyToRank] === sortedObjArr[index - 1][keyToRank] && sortedObjArr[index - 1].finish) {
//                 el.finish = sortedObjArr[index - 1].finish;
//                 if (finishes.length) finishes.shift();
//             } else {
//                 if (finishes.length) el.finish = finishes.shift();
//             }
//         }
//         returnArr.push(el);
//     });
    
//     return returnArr;
// }

interface PointableItem {
    [key: string]: any;
    points?: number;
}

export function assignPoints<T extends PointableItem>(
    objArr: T[],
    keyToRank: keyof T,
    sortDescending: boolean,
    pointsToAssign: number[]
): T[] {
    const returnArr: T[] = [];
    const sortedObjArr = objArr.sort((a, b) => {
        const aVal = a[keyToRank] as number;
        const bVal = b[keyToRank] as number;
        return sortDescending ? bVal - aVal : aVal - bVal;
    });

    let pointIndex = 0;

    for (let i = 0; i < sortedObjArr.length; i++) {
        const el = sortedObjArr[i];
        
        // Check if there's a tie
        if (i > 0 && el[keyToRank] === sortedObjArr[i - 1][keyToRank]) {
            // Same value as previous, share the same points
            el.points = sortedObjArr[i - 1].points;
        } else {
            // New value - find all items with this value to calculate shared points
            let tieCount = 1;
            for (let j = i + 1; j < sortedObjArr.length; j++) {
                if (sortedObjArr[j][keyToRank] === el[keyToRank]) {
                    tieCount++;
                } else {
                    break;
                }
            }

            // Calculate shared points for tied items
            if (tieCount > 1 && pointIndex + tieCount <= pointsToAssign.length) {
                // Sum up points for tied positions
                let totalPoints = 0;
                for (let k = 0; k < tieCount; k++) {
                    totalPoints += pointsToAssign[pointIndex + k];
                }
                // Divide equally
                el.points = totalPoints / tieCount;
                pointIndex += tieCount;
            } else if (pointIndex < pointsToAssign.length) {
                // No tie, assign normal points
                el.points = pointsToAssign[pointIndex];
                pointIndex++;
            }
        }

        returnArr.push(el);
    }

    return returnArr;
}


