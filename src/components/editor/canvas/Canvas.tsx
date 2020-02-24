import React from 'react';
import { observer } from 'mobx-react-lite';
import { Node } from 'ts-morph';
import SingleTag from './SingleTag';

import "./Canvas.scss";

export default observer(({ node }: { node: Node }) => {
    return <div>
        <SingleTag node={node} onClick={(n) => {
            console.log(n);
        }} />
    </div>;
})