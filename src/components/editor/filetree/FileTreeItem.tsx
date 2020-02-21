import { confirm } from '@src/components/dialogs/Confirm';
import { prompt } from '@src/components/dialogs/Prompt';
import { api } from '@src/components/libs/api';
import { extName } from '@src/components/libs/utils';
import { editor } from '@src/stores/editor';
import { IProjectTree, project } from '@src/stores/project';
import { Project } from 'ts-morph';
import _ from 'lodash';
import { observable, toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { ContextualMenu, IContextualMenuItem } from 'office-ui-fabric-react';
import nodepath from 'path';
import React from 'react';
import FileTreeItemLabel from './FileTreeItemLabel';
import FileTreeItems from './FileTreeItems';
export interface IFileTreeItem {
    item: IProjectTree
    parent: IProjectTree
    level: number
    expanded?: string[]
}

export const metaTreeItem = observable({
    path: '',
    lastItem: null as (IProjectTree | undefined | null),
    lastParent: null as (IProjectTree | undefined | null),
    item: null as (IProjectTree | null),
    parent: null as (IProjectTree | null),
    top: 0,
    left: 0,
    anchor: null as any,
    copiedItem: null as (IProjectTree | undefined | null),
})

export default observer(({ item, parent, level, expanded }: IFileTreeItem) => {
    const currentPath = editor.file?.relativePath;
    const isExpanded = (expanded || []).indexOf(item.relativePath) >= 0;
    return <>
        <FileTreeItemLabel
            item={item}
            parent={parent}
            level={level}
            isExpanded={isExpanded}
            active={currentPath === item.relativePath}
            focus={metaTreeItem.path === item.relativePath}
            onRename={(e) => {
                item.name = e + '.' + extName(item.name);
            }}
            onContextMenu={(e) => {
                metaTreeItem.top = e.clientY;
                metaTreeItem.left = e.clientX;
                metaTreeItem.item = item;
                metaTreeItem.parent = parent;
                metaTreeItem.path = item.relativePath;

                const paste = _.find(menuItems, { key: 'paste' })
                if (paste) {
                    paste.disabled = !metaTreeItem.copiedItem;
                }

                e.stopPropagation();
                e.preventDefault();
            }}
            onClick={async () => {
                if (item.type === 'dir') {
                    if (expanded !== undefined) {
                        const idx = expanded.indexOf(item.relativePath);
                        if (idx >= 0) {
                            expanded.splice(idx, 1);
                        } else {
                            expanded.push(item.relativePath);
                        }
                    }
                } else {
                    editor.file = item;
                    const res = await api('source/open', item.relativePath);
                    project.current?.morph.createSourceFile(item.relativePath, res, {
                        overwrite: true
                    });
                    editor.source = project.current?.morph.getSourceFile(item.relativePath);
                }
            }} />

        {metaTreeItem.path === item.relativePath && <>
            <ContextualMenu
                onDismiss={() => {
                    metaTreeItem.lastItem = metaTreeItem.item;
                    metaTreeItem.lastParent = metaTreeItem.parent;
                    metaTreeItem.item = null;
                    metaTreeItem.parent = null;
                    metaTreeItem.path = '';
                }}
                target={metaTreeItem.anchor?.current}
                items={menuItems} />
        </>}

        {isExpanded &&
            <FileTreeItems expanded={expanded} tree={item} level={level + 1} />}
    </>;
});

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
                    const lp = (metaTreeItem.lastItem.relativePath).split('/')
                    const dir = lp.splice(1);
                    if (metaTreeItem.lastItem.type === 'file') {
                        dir.pop();
                    }
                    const path = nodepath.join(project.current?.srcFullPath || '', ...dir, newname + ".tsx");
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
    },
    {
        key: 'newFolder',
        text: 'New Folder',
        onClick: () => {
            (async () => {
                const newname = await prompt("New Folder", {
                    subtitle: 'Please type the folder name:',
                    placeholder: 'folder',
                    onChange: (text: string) => {
                        return _.lowerCase(text).replace(/[^0-9a-zA-Z-_]/g, "")
                    }
                });
                if (newname && metaTreeItem.lastItem) {
                    const lp = (metaTreeItem.lastItem.relativePath).split('/')
                    const dir = lp.splice(1);
                    if (metaTreeItem.lastItem.type === 'file') {
                        dir.pop();
                    }
                    const path = nodepath.join('.', project.current?.src || '', ...dir, newname);
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
    {
        key: 'rename',
        text: 'Rename',
        onClick: () => {
            (async () => {
                const item = metaTreeItem.item;
                if (item) {
                    const type = item.type === 'file' ? 'component' : 'folder';
                    const newPath = metaTreeItem.parent?.relativePath || '';
                    const newname = await prompt(`Rename ${_.startCase(type)}`, {
                        subtitle: `Please type the ${type} name:`,
                        placeholder: type,
                        default: item.name,
                        onChange: (text: string) => {
                            if (item.type === 'file') {
                                return _.startCase(text).replace(/[^0-9a-zA-Z]/g, "")
                            } else {
                                return _.lowerCase(text).replace(/[^0-9a-zA-Z-_]/g, "")
                            }
                        }
                    });
                    if (newname) {
                        const srcPath = project.current?.src;
                        item.name = newname;
                        item.loading = true;
                        const args = {
                            old: `./${srcPath}/` + item.relativePath,
                            new: `./${srcPath}/` + (newPath ? newPath + '/' : '') + newname + (item.type === 'file' ? '.tsx' : '')
                        };
                        console.log(args);
                        await api('ctree/move', args);
                        project.current?.reload();
                    }
                }
            })()
        }
    },
    {
        key: 'delete',
        text: 'Delete',
        onClick: () => {
            (async () => {
                const item = metaTreeItem.item;
                if (item) {
                    const type = item.type === 'file' ? 'component' : 'folder';
                    const res = await confirm('Are you sure ?', {
                        subtitle: `The ${type} will be permanently deleted.`
                    })
                    if (res) {
                        const srcPath = project.current?.src;
                        if (item) {
                            item.loading = true;
                            await api('ctree/delete', {
                                path: `./${srcPath}/` + item.relativePath,
                            });
                            project.current?.reload();
                        }
                    }
                }
            })()
        }
    },
    {
        key: 'copy',
        text: 'Copy',
        onClick: () => {
            if (metaTreeItem.item?.type === 'file') {
                metaTreeItem.copiedItem = toJS(metaTreeItem.item);
            }
        }
    },
    {
        key: 'paste',
        text: 'Paste',
        onClick: () => {
            (async () => {
                const citem = metaTreeItem.copiedItem;
                const item = metaTreeItem.item;
                if (!!citem && !!item) {
                    item.loading = true;
                    const srcPath = project.current?.src;
                    const newPath = item.type === 'file' ? metaTreeItem.parent?.relativePath : item.relativePath;
                    const args = {
                        from: `./${srcPath}/` + citem.relativePath,
                        to: `./${srcPath}/` + (newPath?.substr(2) ? newPath?.substr(2) + '/' : '') + citem.name
                    };
                    await api('ctree/duplicate', args);
                    project.current?.reload();
                }
            })()
        }
    },
];
