import {Flex, Input} from 'antd';
import {TextAreaRef} from 'antd/es/input/TextArea';
import block from 'bem-cn-lite';
import {type CSSProperties, useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';

import {ButtonAccept, ButtonDeny} from '../../../../components/actions';

import './CommentForm.scss';

const b = block('comment-form');

interface ReplyFormProps {
    depth: number;
    onComplete: (content: string, isResponse?: boolean) => Promise<void> | void;
    isCompletePending: boolean;
    content?: string;
    onCancel?: () => void;
}

export const CommentForm = ({
    content: prevContent,
    depth,
    onComplete,
    isCompletePending,
    onCancel,
}: ReplyFormProps) => {
    const {t} = useTranslation('common');
    const [content, setContent] = useState(prevContent || '');
    const textAreaRef = useRef<TextAreaRef>(null);
    const isEditMode = Boolean(prevContent);

    useEffect(() => {
        setContent(prevContent || '');
    }, [prevContent]);

    useEffect(() => {
        if (prevContent && textAreaRef.current) {
            //Get to textAreaProps
            const textArea = textAreaRef.current.resizableTextArea?.textArea;

            const length = prevContent.length;
            textArea?.setSelectionRange(length, length);
        }
    }, []);

    const handleComplete = async () => {
        const trimmedContent = content.trim();

        if (!trimmedContent) {
            return;
        }

        await onComplete(trimmedContent, !isEditMode);

        if (!isEditMode) {
            setContent('');
        }
    };

    return (
        <Flex
            justify='start'
            vertical
            align='start'
            className={b()}
            style={
                {
                    '--comment-depth': depth,
                } as CSSProperties
            }
        >
            <Input.TextArea
                className={b('input')}
                placeholder={t('comments.placeholder')}
                value={content}
                data-marker='comment-input'
                onChange={(e) => setContent(e.target.value)}
                autoSize={{minRows: 3}}
                ref={textAreaRef}
            />
            <Flex justify='flex-end' gap={4} className={b('actions')}>
                {onCancel && (
                    <ButtonDeny
                        text={t('cancel')}
                        onClick={onCancel}
                        size='middle'
                    />
                )}
                <ButtonAccept
                    text={isEditMode ? t('edit') : t('create')}
                    onClick={() => void handleComplete()}
                    disabled={!content.trim()}
                    data-marker='comment-submit-button'
                    loading={isCompletePending}
                    size='middle'
                />
            </Flex>
        </Flex>
    );
};
