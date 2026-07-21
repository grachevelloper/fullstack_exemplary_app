import {Flex, Input} from 'antd';
import {TextAreaRef} from 'antd/es/input/TextArea';
import {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';

import {ButtonAccept, ButtonDeny} from '../../../../components/actions';

interface ReplyFormProps {
    depth: number;
    onComplete: (content: string, isResponse?: boolean) => void;
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

    return (
        <Flex
            justify='start'
            vertical
            align='start'
            style={{
                paddingLeft: `${20 * depth}px`,
                width: '100%',
                marginTop: 8,
            }}
        >
            <Input.TextArea
                placeholder={t('comments.placeholder')}
                value={content}
                data-marker='comment-input'
                onChange={(e) => setContent(e.target.value)}
                autoSize={{minRows: 3}}
                style={{width: '100%'}}
                ref={textAreaRef}
            />
            <Flex
                justify='flex-end'
                gap={4}
                style={{width: '100%', marginTop: 8}}
            >
                {onCancel && (
                    <ButtonDeny
                        text={t('cancel')}
                        onClick={onCancel}
                        size='middle'
                    />
                )}
                <ButtonAccept
                    text={prevContent ? t('edit') : t('create')}
                    onClick={() =>
                        onComplete(content, Boolean(prevContent) === false)
                    }
                    disabled={!content.trim()}
                    data-marker='comment-submit-button'
                    loading={isCompletePending}
                    size='middle'
                />
            </Flex>
        </Flex>
    );
};
