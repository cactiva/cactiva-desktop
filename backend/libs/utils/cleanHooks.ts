import { SourceFile, SyntaxKind } from "ts-morph";
import { defaultExportShallow } from "./defaultExport";

export const cleanHooks = (sf: SourceFile) => {
  const de = defaultExportShallow(sf).getParent();
  const stmts = de.getStatements();
  return stmts.map((s: any, idx: number) => {
    if (!s) return;
    const kind = s.getKind();
    if (kind === SyntaxKind.ExpressionStatement) {
      if (s.getText().indexOf("use") === 0) {
        s.remove();
      }
    } else if (kind === SyntaxKind.VariableStatement) {
      s.remove();
    }
  });
};
