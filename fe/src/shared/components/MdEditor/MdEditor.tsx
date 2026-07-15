import {LinkOutlined} from '@ant-design/icons';
import {
    BoldItalicUnderlineToggles,
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
import {Button, Flex} from 'antd';
import block from 'bem-cn-lite';
import {ForwardedRef, memo} from 'react';

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
            <BoldItalicUnderlineToggles />
            <StrikeThroughSupSubToggles />
            <HighlightToggle />
            <ListsToggle />
            <Button
                type='text'
                size='small'
                aria-label='Link'
                title='Link'
                icon={<LinkOutlined />}
            />
            <CreateLink />
            <InsertImage />
            <InsertCodeBlock />
            <InsertThematicBreak />
        </Flex>
    );
});
