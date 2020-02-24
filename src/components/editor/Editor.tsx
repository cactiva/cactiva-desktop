import Splitter from 'm-react-splitters';
import 'm-react-splitters/lib/splitters.css';
import { observer } from 'mobx-react-lite';
import React from 'react';
import './Editor.scss';
import FileTree from './filetree/FileTree';
import ComponentList from './pane/ComponentList';
import { editor } from '@src/stores/editor';
import Canvas from './canvas/Canvas';

export default observer(() => {
    return <div className='editor'>
        <Splitter
            position="vertical"
            primaryPaneMinWidth="200px"
            primaryPaneWidth="250px"
            postPoned={false}
        >
            <FileTree />
            <div style={{ padding: 5 }}>
                {editor.breadcrumbs.length > 0
                    ? <Canvas node={editor.breadcrumbs[editor.breadcrumbs.length - 1]} />
                    : <ComponentList />}
            </div>
        </Splitter>
    </div>;
});