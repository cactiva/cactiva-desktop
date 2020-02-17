import * as _ from "lodash";
import { SourceFile, SyntaxKind } from "ts-morph";
import { defaultExportShallow } from "./defaultExport";
import { parseJsx } from "./parseJsx";
export const getHooks = (sf: SourceFile) => {
  const de = defaultExportShallow(sf);
  const stmts = _.get(de, "compilerNode.statements", []);
  return stmts.map((s: any) => {
    if (s.kind === SyntaxKind.ExpressionStatement) {
      return parseJsx(s);
    } else if (s.kind === SyntaxKind.VariableStatement) {
      return parseJsx(_.get(s, "declarationList.declarations.0", {}));
    }
  });
};
