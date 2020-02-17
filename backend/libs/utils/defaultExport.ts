import { SourceFile, SyntaxKind } from "ts-morph";
export const defaultExport = (sf: SourceFile) => {
  if (!sf) return null;
  const expt = sf.getFirstChildByKind(SyntaxKind.ExportAssignment);
  try {
    if (expt) {
      let array: any = null;

      try {
        array = expt
          .getFirstChildByKindOrThrow(SyntaxKind.ArrowFunction)
          .getFirstChildByKindOrThrow(SyntaxKind.Block)
          .getFirstChildByKindOrThrow(SyntaxKind.ReturnStatement);
      } catch (e) {
        array = expt
          .getFirstChildByKindOrThrow(SyntaxKind.CallExpression)
          .getFirstChildByKindOrThrow(SyntaxKind.ArrowFunction)
          .getFirstChildByKindOrThrow(SyntaxKind.Block)
          .getFirstChildByKindOrThrow(SyntaxKind.ReturnStatement);
      }

      if (array === null) {
        console.log(expt);
        return null;
      }
      return array.getExpression();
    }
  } catch (e) {}

  return null;
};

export const defaultExportShallow = (sf: SourceFile) => {
  if (!sf) return null;
  const expt = sf.getFirstChildByKind(SyntaxKind.ExportAssignment);
  if (expt) {
    let array: any = null;

    try {
      array = expt
        .getFirstChildByKindOrThrow(SyntaxKind.ArrowFunction)
        .getFirstChildByKindOrThrow(SyntaxKind.Block);
    } catch (e) {
      array = expt
        .getFirstChildByKindOrThrow(SyntaxKind.CallExpression)
        .getFirstChildByKindOrThrow(SyntaxKind.ArrowFunction)
        .getFirstChildByKindOrThrow(SyntaxKind.Block);
    }

    if (array === null) return null;

    return array;
  }

  return null;
};
