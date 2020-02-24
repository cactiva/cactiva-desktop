import Splitter from "m-react-splitters";
import "m-react-splitters/lib/splitters.css";
import { observer } from "mobx-react-lite";
import React from "react";
import "./Editor.scss";
import FileTree from "./filetree/FileTree";
import ComponentList from "./pane/ComponentList";
import { editor } from "@src/stores/editor";
import Canvas from "./canvas/Canvas";
import { Mosaic, MosaicWindow } from "react-mosaic-component";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "react-mosaic-component/react-mosaic-component.css";
import { Breadcrumb } from "office-ui-fabric-react";

const ELEMENT_MAP: { [viewId: string]: JSX.Element } = {
  FileTree: <FileTree />,
  Canvas: <ComponentList />,
  BreadCrumb: (
    <Canvas node={editor.breadcrumbs[editor.breadcrumbs.length - 1]} />
  )
};

export default observer(() => {
  return (
    <div className="editor">
      {/* <Splitter
            position="vertical"
            primaryPaneMinWidth="200px"
            primaryPaneWidth="250px"
            postPoned={false}
        >
            <FileTree />
            {editor.breadcrumbs.length > 0
                ? <Canvas node={editor.breadcrumbs[editor.breadcrumbs.length - 1]} />
                : <ComponentList />}
        </Splitter> */}
      <div className="editor-header">Header</div>
      <Mosaic<string>
        renderTile={(id, path) => (
          <MosaicWindow<string>
            className={id === "BreadCrumb" ? "mosaic-hidden-tollbar" : ""}
            path={path}
            title={id}
            draggable={false}
            renderToolbar={props => {
              const { title } = props;
              const titleString = title === "FileTree" ? "File Tree" : title;
              return <div className={"mosaic-custom-title"}>{titleString}</div>;
            }}
          >
            {ELEMENT_MAP[id]}
          </MosaicWindow>
        )}
        initialValue={{
          direction: "row",
          first: "FileTree",
          splitPercentage: 20,
          second: {
            direction: "column",
            first: "Canvas",
            second: "BreadCrumb",
            splitPercentage: 95
          }
        }}
      />
    </div>
  );
});
