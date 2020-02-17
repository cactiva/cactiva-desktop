import { api } from '@src/components/libs/api';
import { fuzzyMatch } from '@src/components/libs/utils';
import { project } from '@src/stores/project';
import { observer, useObservable } from 'mobx-react-lite';
import { IconButton, IContextualMenuItem, SearchBox, ContextualMenu } from 'office-ui-fabric-react';
import React, { useRef, useEffect } from 'react';
import "./FileTree.scss";
import { metaTreeItem } from './FileTreeItem';
import FileTreeItems from './FileTreeItems';
import _ from 'lodash';
import { prompt } from '@src/components/dialogs/Prompt';
import { toJS } from 'mobx';
import nodepath from 'path';

export default observer(() => {
    const meta = useObservable({
        search: '',
        expanded: [],
        list: [] as any
    });
    const tree = project.current?.tree;
    const ref = useRef(null as any);
    metaTreeItem.anchor = ref;

    return <div className="filetree">
        <div ref={ref} style={{ position: 'fixed', top: metaTreeItem.top, left: metaTreeItem.left }} />
        <div className="search">
            <SearchBox
                underlined={true}
                styles={{
                    root: {
                        border: 0,
                        borderRadius: 0,
                        borderBottom: '1px solid #ccc'
                    },
                    iconContainer: {
                        display: 'none'
                    }
                }}
                value={meta.search}
                onChange={(e) => {
                    meta.search = e?.target.value || '';
                    const recurse = (list: any[]) => {
                        for (let i in list) {
                            const item: any = list[i];
                            if (item.type === "file") {
                                if (fuzzyMatch(item.name.toLowerCase(), meta.search.toLowerCase())) {
                                    meta.list.push(item);
                                }
                            } else {
                                item.type === "dir";
                            }
                            recurse(item.children);
                        }
                    };
                    if (project.current && project.current.tree.children) {
                        meta.list = [];
                        recurse(project.current.tree.children);
                    }
                }}
                placeholder="Search"
            />
            <IconButton menuProps={{
                shouldFocusOnMount: true,
                items: menuItems
            }} iconProps={{ iconName: 'Add' }} styles={{ icon: { color: 'black' } }} />
        </div>
        <div className="box"
            onContextMenu={(e) => {
                if (!metaTreeItem.path) {
                    metaTreeItem.top = e.clientY;
                    metaTreeItem.left = e.clientX;
                    metaTreeItem.path = '__ROOT__';
                    metaTreeItem.lastParent = tree;
                    metaTreeItem.lastItem = tree;
                    e.stopPropagation();
                    e.preventDefault();
                } else {
                    metaTreeItem.path = '';
                }
            }}>
            {meta.search
                ? <FileTreeItems
                    tree={{
                        name: 'search',
                        relativePath: '',
                        size: 0,
                        type: 'dir',
                        children: meta.list
                    }}
                    level={1} />
                : (tree && <FileTreeItems
                    tree={tree}
                    expanded={meta.expanded}
                    level={1} />)}
        </div>

        {metaTreeItem.path === '__ROOT__' && <>
            <ContextualMenu
                onDismiss={() => metaTreeItem.path = ''}
                target={metaTreeItem.anchor?.current}
                items={menuItems} />
        </>}
    </div>;
})


const menuItems: IContextualMenuItem[] = [
    {
        key: 'newFile',
        text: 'New File',
        onClick: () => {
            (async () => {
                const newname = await prompt("New Component", {
                    subtitle: 'Please type the component name:',
                    placeholder: 'Component',
                    onChange: (text: string) => {
                        return _.startCase(text).replace(/[^0-9a-zA-Z]/g, "")
                    }
                });
                if (newname && metaTreeItem.lastItem) {
                    const path = nodepath.join(project.current?.srcFullPath || '', newname + '.tsx')
                    const parent = metaTreeItem.lastItem.type === 'file' ? metaTreeItem.lastParent : metaTreeItem.lastItem;
                    if (parent?.children) {
                        parent.children.push({
                            name: newname,
                            type: 'file',
                            size: 0,
                            loading: true,
                            relativePath: newname
                        })
                        parent.children = _.sortBy(parent.children, 'name')
                    }
                    await api('ctree/newfile', { path });
                    project.current?.reload();
                }
            })()
        }
    }, {
        key: 'newFolder',
        text: 'New Folder',
        onClick: async () => {
            (async () => {
                const newname = await prompt("New Folder", {
                    subtitle: 'Please type folder name:',
                    placeholder: 'folder',
                    onChange: (text: string) => {
                        return _.lowerCase(text).replace(/[^0-9a-zA-Z-_]/ig, "")
                    }
                });
                if (newname && metaTreeItem.lastItem) {
                    const path = nodepath.join('.', project.current?.src || '', newname)
                    const parent = metaTreeItem.lastItem.type === 'file' ? metaTreeItem.lastParent : metaTreeItem.lastItem;
                    if (parent?.children) {
                        parent.children.push({
                            name: newname,
                            type: 'dir',
                            size: 0,
                            loading: true,
                            relativePath: newname
                        })
                        parent.children = _.sortBy(parent.children, 'name')
                    }
                    await api('ctree/newdir', { path });
                    project.current?.reload();
                }
            })()
        }
    },
];