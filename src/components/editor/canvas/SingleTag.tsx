import React from 'react';
import { observer } from 'mobx-react-lite';
import { Node, JsxFragment, JsxSelfClosingElement, JsxElement, JsxExpression, JsxText } from 'ts-morph';
import Divider from './Divider';
import { walk } from '@src/components/libs/morph/walk';

const SingleTag = observer(({ node }: { node: Node }) => {
    if (node.wasForgotten()) return null;

    let n = null;
    let tagName = "";
    switch (true) {
        case node instanceof JsxFragment:
            n = (node as JsxFragment);
            tagName = "React.Fragment";
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
            let jsx = (null as unknown) as Node;
            walk(e, (node: Node) => {
                if (node instanceof JsxSelfClosingElement ||
                    node instanceof JsxElement ||
                    node instanceof JsxFragment) {
                    jsx = node;
                    return false;
                }
                return true;
            });
            if (jsx) {
                return <React.Fragment key={idx}><SingleTag node={jsx} />
                    <pre style={{ fontSize: '9px' }}>{jsx.getText()}</pre>
                </React.Fragment>
            } 
        }
    });

    console.log(children, nodeArray);

    return <div className="singletag vertical">
        <span className="tagname">{tagName}</span>
        <div className="children">
            <Divider position="before" node={nodeArray[0] as Node} index={0} />
            {children}
        </div>
    </div>;
})

export default SingleTag;