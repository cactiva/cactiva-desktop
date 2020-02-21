import React from 'react';
import { observer } from 'mobx-react-lite';
import './Editor.scss';
import FileTree from './filetree/FileTree';
import Splitter from 'm-react-splitters';
import 'm-react-splitters/lib/splitters.css';
import Canvas from './canvas/Canvas';
import ComponentList from './canvas/ComponentList';

export default observer(() => {
    return <div className='editor'>
        <Splitter
            position="vertical"
            primaryPaneMinWidth="200px"
            primaryPaneWidth="250px"
            postPoned={false}
        >
            <FileTree />
            <ComponentList />
        </Splitter>
    </div>;
});