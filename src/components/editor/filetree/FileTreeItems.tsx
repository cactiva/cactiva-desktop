import { IProjectTree } from '@src/stores/project';
import _ from 'lodash';
import { observer } from 'mobx-react-lite';
import React from 'react';
import FileTreeItem from './FileTreeItem';

interface IFileTreeItems {
    tree: IProjectTree,
    level: number,
    expanded?: string[]
}

export default observer(({ tree, level, expanded }: IFileTreeItems) => {

    if (tree && tree.children) {
        return <div className="items">
            {_.sortBy(tree.children.filter(e => e.type === 'dir').map((e, idx) => (
                <FileTreeItem
                    key={idx}
                    expanded={expanded}
                    item={e}
                    parent={tree}
                    level={level} />
            )), 'name')}
            {_.sortBy(tree.children.filter(e => e.type === 'file').map((e, idx) => (
                <FileTreeItem
                    key={idx}
                    item={e}
                    parent={tree}
                    level={level} />
            )), 'name')}
        </div>;
    }
    return null;
})