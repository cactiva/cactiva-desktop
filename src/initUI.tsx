import { createTheme, loadTheme, registerIcons, setIconOptions } from 'office-ui-fabric-react';
import React from 'react';
import { IoMdAdd, IoMdArrowDropdown, IoMdClose } from 'react-icons/io';


export default () => {
    loadTheme(createTheme({
        defaultFontStyle: {
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, Helvetica, Arial, sans-serif'
        },
    }));

    registerIcons({
        icons: {
            'Clear': <IoMdClose style={{ width: 16, height: 16 }} />,
            'Add': <IoMdAdd style={{ width: 16, height: 16 }} />,
            'ChevronDown': <IoMdArrowDropdown style={{ width: 16, height: 16 }} />,
        },
    });
    
    setIconOptions({
        disableWarnings: true
    });
}