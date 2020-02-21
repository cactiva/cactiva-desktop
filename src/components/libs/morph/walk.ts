import { Node } from 'ts-morph';

export const walk = (root: Node, f: (node: Node) => boolean) => {
    if (!!root && root.forEachChild) {
        root.forEachChild(e => {
            if (f(e)) {
                if (e && e.forEachChild) {
                    walk(e, f);
                }
            }
        });
    }
}