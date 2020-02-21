import { useWindowSize } from '@src/components/libs/useWindowSize';
import { extName } from '@src/components/libs/utils';
import { editor } from '@src/stores/editor';
import { observer, useObservable } from 'mobx-react-lite';
import React, { useEffect, useRef } from 'react';
import MonacoEditor from 'react-monaco-editor';

export default observer(() => {
    const meta = useObservable({
        code: undefined as (string | undefined),
        language: "javascript"
    })

    const ref = useRef(null as any);
    const size = useWindowSize(ref);
    useEffect(() => {
        if (editor.source) {
            if (extName(editor.file?.relativePath || '') === 'tsx') {
                meta.language = 'typescript';
            } else {
                meta.language = 'javascript';
            }
            meta.code = editor.source.getFullText();
        }
    }, [editor.source]);

    const visible = meta.code !== undefined
        && size.height > 0
        && size.width > 0;

    return <div ref={ref} style={{ flex: 1, position: 'relative' }}>
        <div className="absolute-full">
            {visible && <MonacoEditor
                width={size.width}
                height={size.height}
                language={meta.language}
                theme="vs-dark"
                value={meta.code}
                editorWillMount={(monaco) => {
                    const ts = monaco.languages.typescript.typescriptDefaults;
                    ts.setCompilerOptions({
                        target: monaco.languages.typescript.ScriptTarget.ES2016,
                        allowNonTsExtensions: true,
                        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                        module: monaco.languages.typescript.ModuleKind.CommonJS,
                        noEmit: true,
                        typeRoots: ["node_modules/@types"],
                        jsx: monaco.languages.typescript.JsxEmit.React,
                        jsxFactory: 'JSXAlone.createElement',
                    });
                    ts.setDiagnosticsOptions({
                        noSemanticValidation: true,
                        noSyntaxValidation: true,
                    });
                }}
            />
            }
        </div>
    </div>;
})