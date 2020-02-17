import { SourceFile } from "ts-morph";
import * as  _ from "lodash";
export const getImports = (sf: SourceFile) => {
    const imprts = sf.getImportDeclarations();
    const result = {} as any;
    _.map(imprts, (i: any) => {
        const ic = i.getImportClause();
        const ms = i.getModuleSpecifier();
        const nb = i.getNamedImports();

        const imp = {
            default: _.get(ic, "_compilerNode.name.escapedText"),
            named: _.map(nb, (n: any) => {
                return n.getText();
            }),
            from: _.get(ms, "_compilerNode.text")
        };

        for (let k in imp.named) {
            result[imp.named[k]] = { from: imp.from, type: "named" };
        }

        if (imp.default) {
            result[imp.default] = { from: imp.from, type: "default" };
        }
    });

    result['useAsyncEffect'] = {
        from: 'use-async-effect',
        type: 'default'
    }

    result['View'] = {
        from: '@src/libs',
        type: 'named'
    }

    return result;
};
