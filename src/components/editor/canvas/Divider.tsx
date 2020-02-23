import React from 'react';
import { observer } from 'mobx-react-lite';
import { Node } from 'ts-morph';
import _ from 'lodash';

export default observer((props: {
    position: 'before' | 'after' | 'first-children' | 'last-children',
    node?: Node,
    index: number
}) => {
    const layout = _.get(props, 'layout', 'vertical');
    return <div className={`divider`}></div>;
})