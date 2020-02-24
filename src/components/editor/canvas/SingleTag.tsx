import React from 'react';
import { observer } from 'mobx-react-lite';
import { Node, JsxFragment, JsxSelfClosingElement, JsxElement, JsxExpression, JsxText } from 'ts-morph';
import Divider from './Divider';
import { walk } from '@src/components/libs/morph/walk';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const SingleTag = observer(({ node, style }: { node: Node, style?: any }) => {
    if (node.wasForgotten()) return null;

    let n = null;
    let tagName = "";
    switch (true) {
        case node instanceof JsxFragment:
            n = (node as JsxFragment);
            tagName = "JsxFragment";
            break;
        case node instanceof JsxSelfClosingElement:
            n = (node as JsxSelfClosingElement);
            tagName = n.getTagNameNode().getText();
            break;
        case node instanceof JsxElement:
            n = node as JsxElement;
            tagName = n.getOpeningElement().getTagNameNode().getText();
            break;
    }

    const nodeArray = node.forEachChildAsArray();
    if (node instanceof JsxElement) {
        nodeArray.shift();
        nodeArray.pop();
    }
    const children = nodeArray.map((e, idx) => {
        if (e instanceof JsxFragment ||
            e instanceof JsxSelfClosingElement ||
            e instanceof JsxElement) {
            return <React.Fragment key={idx}>
                <SingleTag node={e} />
                <Divider position="after" node={e as Node} index={idx} />
            </React.Fragment>
        } else if (e instanceof JsxExpression) {
            let jsx = ([] as unknown) as Node[];
            walk(e, (c: Node) => {
                if (c instanceof JsxSelfClosingElement ||
                    c instanceof JsxElement ||
                    c instanceof JsxFragment) {
                    jsx.push(c);
                    return false;
                }
                return true;
            });
            if (jsx.length > 0) {
                return <React.Fragment key={idx}>
                    <div style={{ border: '1px dashed red' }} key={idx}>
                        {jsx.map((j, jix) => (<SingleTag node={j} key={jix} style={{
                            border: 0,
                            borderTop: jix > 0 ? '1px dashed red' : 0
                        }} />))}
                    </div>
                    <Divider position="after" node={e as Node} index={idx} />
                </React.Fragment>
            } else {
                return <SyntaxHighlighter className="code-preview" key={idx} language="javascript" style={docco}>
                    {e.getText()}
                </SyntaxHighlighter>
            }
        }
    });

    return <div className="singletag vertical" style={style}>
        <span className="tagname">{tagName}</span>
        <div className="children">
            <Divider position="before" node={nodeArray[0] as Node} index={0} />
            {children}
        </div>
    </div>;
})

export default SingleTag;