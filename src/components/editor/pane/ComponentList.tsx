import { walk } from '@src/components/libs/morph/walk';
import { editor } from '@src/stores/editor';
import { observer, useObservable } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { JsxElement, JsxExpression, JsxFragment, JsxSelfClosingElement, JsxText, Node } from 'ts-morph';
import formatCode from '@src/components/libs/morph/formatCode';
import { DefaultButton } from 'office-ui-fabric-react';

export default observer(() => {
    const meta = useObservable({
        list: [] as Node[],
    })
    useEffect(() => {
        if (editor.source) {
            meta.list = [];
            walk(editor.source, (node: Node) => {
                if (node instanceof JsxSelfClosingElement ||
                    node instanceof JsxExpression ||
                    node instanceof JsxElement ||
                    node instanceof JsxFragment ||
                    node instanceof JsxText) {
                    meta.list.push(node);
                    return false;
                }
                return true;
            })
        }
    }, [editor.source]);
    const select = (node: Node) => {
        editor.breadcrumbs = [];
        editor.breadcrumbs.push(node);
    }
    return <div>
        {meta.list.map((node, idx) => {
            if (!!node && !node.wasForgotten()) {
                if (node instanceof JsxElement) {
                    return <DefaultButton onClick={() => select(node)}
                        key={idx}>{node.getOpeningElement().getTagNameNode().getText()}</DefaultButton>
                } else if (node instanceof JsxSelfClosingElement) {
                    return <DefaultButton onClick={() => select(node)}
                        key={idx}>{node.getTagNameNode().getText()}</DefaultButton>
                } else if (node instanceof JsxFragment) {
                    return <DefaultButton onClick={() => select(node)}
                        key={idx}>{'JsxFragment'}</DefaultButton>
                }
                return <pre key={idx}>{formatCode(node.getText())}</pre>
            }
        })}
    </div>;
})
