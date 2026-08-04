import {
    BoldItalicUnderlineToggles,
    BlockTypeSelect,
    CreateLink,
    HighlightToggle,
    InsertCodeBlock,
    InsertImage,
    InsertThematicBreak,
    ListsToggle,
    MDXEditor,
    MDXEditorMethods,
    MDXEditorProps,
    StrikeThroughSupSubToggles,
    UndoRedo,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import {Flex} from 'antd';
import block from 'bem-cn-lite';
import {ForwardedRef, memo, useRef} from 'react';

import './MdEditor.scss';
import {readPlugins, writePlugins} from './plugins';

const b = block('md-editor');

export type EntityAttachmentType = 'article' | 'todo';

interface InitializedMDXEditorProps extends MDXEditorProps {
    ref?: ForwardedRef<MDXEditorMethods>;
    editable?: boolean;
    entityType: EntityAttachmentType;
    entityId: string;
    dataMarker?: string;
}

export function MdEditor({
    markdown,
    ref,
    editable,
    entityType,
    dataMarker,
    onChange,
    entityId,
    ...props
}: InitializedMDXEditorProps) {
    const attachmentIdsByUrl = useRef(new Map<string, string>());

    return (
        <div data-marker={dataMarker}>
            <MDXEditor
                className={b()}
                contentEditableClassName={b('markdown')}
                ref={ref}
                plugins={
                    editable
                        ? writePlugins({
                              entityId,
                              entityType,
                              attachmentIdsByUrl: attachmentIdsByUrl.current,
                              toolbar: () => <ToolbarComponent />,
                          })
                        : readPlugins
                }
                markdown={markdown || ''}
                onChange={onChange}
                {...props}
            />
        </div>
    );
}

const ToolbarComponent = memo(() => {
    return (
        <Flex gap={2} className={b('toolbar')}>
            <UndoRedo />
            <BlockTypeSelect />
            <BoldItalicUnderlineToggles />
            <StrikeThroughSupSubToggles />
            <HighlightToggle />
            <ListsToggle />
            <CreateLink />
            <InsertImage />
            <InsertCodeBlock />
            <InsertThematicBreak />
        </Flex>
    );
});
