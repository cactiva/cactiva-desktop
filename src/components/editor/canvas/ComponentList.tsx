import { walk } from '@src/components/libs/morph/walk';
import { editor } from '@src/stores/editor';
import { observer, useObservable } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { JsxElement, JsxExpression, JsxFragment, JsxSelfClosingElement, JsxText, Node } from 'ts-morph';
import formatCode from '@src/components/libs/morph/formatCode';

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
    return <div>
        {meta.list.map((e, idx) => {
            if (!!e && !e.wasForgotten()) return <pre key={idx}>{formatCode(e.getText())}</pre>
        })}
    </div>;
})
