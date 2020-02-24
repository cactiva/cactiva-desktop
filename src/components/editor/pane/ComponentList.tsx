import { walk } from "@src/components/libs/morph/walk";
import { editor } from "@src/stores/editor";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect } from "react";
import {
  JsxElement,
  JsxExpression,
  JsxFragment,
  JsxSelfClosingElement,
  JsxText,
  Node
} from "ts-morph";
import formatCode from "@src/components/libs/morph/formatCode";
import { DefaultButton } from "office-ui-fabric-react";

export default observer(() => {
    const meta = useObservable({
        loading: true,
        list: [] as Node[],
    })
    useEffect(() => {
        if (editor.source) {
            meta.loading = true;
            const list = [] as Node[];
            walk(editor.source, (node: Node) => {
                if (node instanceof JsxSelfClosingElement ||
                    node instanceof JsxExpression ||
                    node instanceof JsxElement ||
                    node instanceof JsxFragment ||
                    node instanceof JsxText) {
                    list.push(node);
                    return false;
                }
                return true;
            });

            meta.list = list;
            setTimeout(() => {
                if (meta.list.length === 1 && editor.breadcrumbs.length === 0) {
                    select(meta.list[0]);
                }
                meta.loading = false;
            })
        }
    }, [editor.source, editor.breadcrumbs.length]);

    const select = (node: Node) => {
        editor.breadcrumbs = [];
        editor.breadcrumbs.push(node);
    }

    const btnStyle = { marginBottom: 5 };

    if (meta.loading) return null;
    return <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h5>Component List: </h5>
        {meta.list.map((node, idx) => {
            if (!!node && !node.wasForgotten()) {
                if (node instanceof JsxElement) {
                    return <DefaultButton style={btnStyle} onClick={() => select(node)}
                        key={idx}>{node.getOpeningElement().getTagNameNode().getText()}</DefaultButton>
                } else if (node instanceof JsxSelfClosingElement) {
                    return <DefaultButton style={btnStyle} onClick={() => select(node)}
                        key={idx}>{node.getTagNameNode().getText()}</DefaultButton>
                } else if (node instanceof JsxFragment) {
                    return <DefaultButton style={btnStyle} onClick={() => select(node)}
                        key={idx}>{'JsxFragment'}</DefaultButton>
                }
                return <pre key={idx}>{formatCode(node.getText())}</pre>
            }
        })}
    </div>;
})
