import * as _ from "lodash";
import { SyntaxKind } from "ts-morph";
import { kindNames } from "./kindNames";

export const getEntryPoint = (node: any): any => {
    if (node && node.compilerNode) {
        node = node.compilerNode;
    }

    if (!node) {
        return node;
    }
    if (node.kind === SyntaxKind.SyntaxList) {
        return getEntryPoint(_.get(node, "_children.0"));
    }
    if (node.kind === SyntaxKind.ExpressionStatement) {
        return getEntryPoint(_.get(node, "expression"));
    }
    if (node.kind === SyntaxKind.ParenthesizedExpression) {
        return getEntryPoint(_.get(node, "expression"));
    }
    if (node.kind === SyntaxKind.Block) {
        return getEntryPoint(_.get(node, "statements.0"));
    }
    return node;
};

export const parseJsx = (node: any, showKindName: boolean = false): any => {
    if (!node) return null;

    if (node.compilerNode) {
        node = node.compilerNode;
    }

    let kind = _.get(node, "kind");
    if (!kind && node && node.getKind) {
        kind = node.getKind();
    }
    const kindName = showKindName ? kindNames[kind] : kind;
    if (node.expression === undefined && !!node.getExpression) {
        node.expression = node.getExpression();
    }
    if (node.parameters === undefined && !!node.getParameters) {
        node.parameters = node.getParameters();
    }

    switch (kind) {
        case SyntaxKind.ArrayLiteralExpression:
            return {
                kind: kindName,
                value: node.elements.map((e: any) => parseJsx(e))
            };
        case SyntaxKind.AwaitExpression:
            return {
                kind: kindName,
                value: parseJsx(node.expression)
            };
        case SyntaxKind.VariableDeclaration:
            return {
                kind: kindName,
                name: node.name.escapedText,
                value: parseJsx(node.initializer)
            };
        case SyntaxKind.BinaryExpression:
            return {
                kind: kindName,
                left: parseJsx(node.left, showKindName),
                operator: showKindName
                    ? kindNames[node.operatorToken.kind]
                    : node.operatorToken.kind,
                right: parseJsx(node.right, showKindName)
            };

        case SyntaxKind.VariableStatement:
            return (() => {
                const result: any = [];
                node.declarationList.declarations.forEach((p: any) => {
                    const name = p.name.escapedText || p.name.text;
                    result.push({
                        name,
                        kind: p.kind,
                        flags: node.declarationList.flags - node.flags,
                        value: parseJsx(p.initializer, showKindName)
                    });
                });

                return { kind: kindName, value: result };
            })();
        case SyntaxKind.ExpressionStatement:
            return {
                kind: kindName,
                value: parseJsx(node.expression, showKindName)
            };
        case SyntaxKind.ElementAccessExpression:
            return {
                kind: kindName,
                exp: parseJsx(node.expression, showKindName),
                argExp: parseJsx(node.argumentExpression, showKindName)
            };
        case SyntaxKind.ConditionalExpression:
            return {
                kind: kindName,
                condition: parseJsx(node.condition, showKindName),
                whenTrue: parseJsx(node.whenTrue, showKindName),
                whenFalse: parseJsx(node.whenFalse, showKindName)
            };
        case SyntaxKind.CallExpression:
            return {
                kind: kindName,
                expression: node.expression.getText(),
                arguments: node.arguments.map((i: any) => parseJsx(i, showKindName))
            };
        case SyntaxKind.ReturnStatement:
        case SyntaxKind.JsxExpression:
        case SyntaxKind.AsExpression:
        case SyntaxKind.ParenthesizedExpression:
            if (!!node.expression) {
                return {
                    kind: kindName,
                    value: parseJsx(node.expression, showKindName)
                };
            }
        case SyntaxKind.ArrowFunction:
            return (() => {
                const params = (node.parameters || []).map((e: any) => {
                    return e.getText();
                });
                const body: any = [];
                if (node.body) {
                    if (node.body.statements) {
                        node.body.statements.map((s: any) => {
                            body.push(parseJsx(s, showKindName));
                        });
                    } else {
                        body.push(parseJsx(node.body, showKindName));
                    }
                }
                return {
                    kind: kindName,
                    params,
                    body,
                    modifiers: (node.modifiers || []).map((e: any) => e.kind)
                };
            })();
        case SyntaxKind.ObjectLiteralExpression:
            return (() => {
                const result: any = {};
                node.properties.forEach((p: any) => {
                    if (p.name) {
                        const name = p.name.escapedText || p.name.text;
                        result[name] = parseJsx(p.initializer, showKindName);
                    } else {
                        if (p.kind === SyntaxKind.SpreadAssignment) {
                            let spreadKey = 0;
                            while (result[`_spread_${spreadKey}`]) {
                                spreadKey++;
                            }
                            result[`_spread_${spreadKey}`] = parseJsx(p.expression);
                        }
                    }
                });

                return { kind: kindName, value: result };
            })();
        case SyntaxKind.JsxSelfClosingElement:
            return (() => {
                const jsxElement: any = node.compilerNode ? node.compilerNode : node;
                let name = "";
                const props: any = {};

                const je = jsxElement as any;
                name = je.tagName.escapedText;
                je.attributes.properties.forEach((p: any) => {
                    if (p.name && p.initializer) {
                        if (!p.initializer.expression && p.initializer.text) {
                            props[p.name.escapedText] = {
                                kind: SyntaxKind.StringLiteral,
                                value: `"${p.initializer.text}"`
                            };
                        } else {
                            props[p.name.escapedText] = parseJsx(
                                p.initializer.expression,
                                showKindName
                            );
                        }
                    } else {
                        props[p.name.escapedText] = { kind: SyntaxKind.TrueKeyword };
                    }
                });

                if (props.children) {
                    const children = [];
                    if (Array.isArray(props.children)) {
                        props.children.forEach((c: any) => children.push(c));
                    } else {
                        const c = props.children;
                        if (c.kind === SyntaxKind.StringLiteral) {
                            children.push({
                                ...c,
                                kind: SyntaxKind.JsxText,
                                value: c.value.substr(1, c.value.length - 2)
                            });
                        } else {
                            children.push(c);
                        }
                    }
                    delete props.children;
                    return {
                        kind: SyntaxKind.JsxElement,
                        name,
                        props,
                        children
                    };
                }

                return {
                    kind: kindName,
                    name,
                    props
                };
            })();
        case SyntaxKind.JsxFragment:
        case SyntaxKind.JsxElement:
            return (() => {
                let name = "";
                const props: any = {};

                name = _.get(node, "openingElement.tagName.escapedText");
                const properties = _.get(
                    node,
                    "openingElement.attributes.properties",
                    []
                );
                properties.forEach((p: any) => {
                    if (p.name && p.initializer) {
                        if (!p.initializer.expression && p.initializer.text) {
                            props[p.name.escapedText] = {
                                kind: SyntaxKind.StringLiteral,
                                value: `"${p.initializer.text}"`
                            };
                        } else {
                            props[p.name.escapedText] = parseJsx(
                                p.initializer.expression,
                                showKindName
                            );
                        }
                    } else {
                        props[p.name.escapedText] = { kind: SyntaxKind.TrueKeyword };
                    }
                });

                const children: any = [];
                node.children.forEach((c: any) => {
                    const parsedChildren = parseJsx(c, showKindName);

                    if (parsedChildren !== undefined) {
                        children.push(parsedChildren);
                    }
                });

                if (props.children) {
                    if (Array.isArray(props.children)) {
                        props.children.forEach((c: any) => children.push(c));
                    } else {
                        children.push(props.children);
                    }
                    delete props.children;
                }

                return {
                    kind: kindName,
                    name,
                    props,
                    children
                };
            })();
    }

    if (node.containsOnlyTriviaWhiteSpaces) return undefined;
    if (node.getText) return { kind: kindName, value: node.getText().trim() };
    if (node.text) return { kind: kindName, value: node.text.trim() };
    if (node.escapedText)
        return { kind: kindName, value: node.escapedText.trim() };
};
