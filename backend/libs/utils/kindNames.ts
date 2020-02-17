import { SyntaxKind } from 'ts-morph';

function getKindNamesForApi() {
    // some SyntaxKinds are repeated, so only use the first one
    const kindNames: { [kind: number]: string } = {};
    for (const name of Object.keys(SyntaxKind).filter(k =>
        isNaN(parseInt(k, 10))
    )) {
        const value = (SyntaxKind as any)[name] as number;
        if (kindNames[value] == null) kindNames[value] = name;
    }
    return kindNames;
}
export const kindNames = getKindNamesForApi();
