// TODO 快捷操作栏, 包括选择父亲节点、删除, 复制, 移动
import { MoveableManagerInterface, Renderer } from 'moveable';

import { AbleActionEventType } from './const';

export function moveableMenu(handler: (type: AbleActionEventType) => void) {
    const css = `.moveable-button {
        width: 20px;
        height: 20px;
        background: #E6A817;
        border-radius: 4px;
        appearance: none;
        border: 0;
        color: white;
        font-size: 12px;
        font-weight: bold;
        margin-left: 2px;
        position: relative;
      }
      .moveable-remove-button:before, .moveable-remove-button:after {
        content: "";
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%) rotate(45deg);
        width: 14px;
        height: 2px;
        background: #fff;
        border-radius: 1px;
        cursor: pointer;
      }
      .moveable-remove-button:after {
        transform: translate(-50%, -50%) rotate(-45deg);
      }
      
      .moveable-select-parent-arrow-top-icon {
        transform: rotateZ(-45deg);
        width: 4px;
        height: 4px;
        border-color: #fff;
        border-width: 2px 2px 0 0;
        border-style: solid;
        position: absolute;
        left: 4px;
        top: 4px;
      }
      
      .moveable-select-parent-arrow-body-icon {
        width: 7px;
        height: 11px;
        border-color: #fff;
        border-width: 0 0 2px 2px;
        border-style: solid;
        margin-left: 6px;
      }
      
      .moveable-drag-area-button {
        cursor: move;
      }
      
      .moveable-drag-area-button .moveable-select-parent-arrow-top-icon {
        width: 2px;
        height: 2px;
      }
      
      .moveable-drag-area-button .moveable-select-parent-arrow-top-icon-top {
        transform: rotateZ(-45deg) translateX(-50%);
        left: 50%;
        top: 3px;
        transform-origin: left;
      }
      
      .moveable-drag-area-button .moveable-select-parent-arrow-top-icon-bottom {
        transform: rotateZ(135deg) translateX(-50%);
        transform-origin: left;
        left: 50%;
        top: auto;
        bottom: 3px;
      }
      
      .moveable-drag-area-button .moveable-select-parent-arrow-top-icon-right {
        transform: rotateZ(45deg)  translateY(-50%);
        transform-origin: top;
        right: 3px;
        left: auto;
        top: 50%;
      }
      
      .moveable-drag-area-button .moveable-select-parent-arrow-top-icon-left {
        transform: rotateZ(235deg) translateY(-50%);
        transform-origin: top;
        left: 3px;
        top: 50%;
      }
      
      .moveable-drag-area-button .moveable-select-parent-arrow-body-icon-horizontal {
        width: 2px;
        height: 11px;
        background-color: #fff;
        position: absolute;
        transform: translateX(-50%);
        left: 50%;
        top: 4px;
      }
      
      .moveable-drag-area-button .moveable-select-parent-arrow-body-icon-vertical {
        width: 11px;
        height: 2px;
        background-color: #fff;
        position: absolute;
        transform: translateY(-50%);
        left: 4px;
        top: 50%;;
      }
    `;
    return {
        name: 'actions',
        props: [],
        events: [],
        render(moveable: MoveableManagerInterface<any, any>, React: Renderer) {
            const rect = moveable.getRect();
            const { pos2, } = moveable.state;

            // use css for able
            const editableViewer = moveable.useCSS(
                'div',
                `
                    {
                        position: absolute;
                        left: 0px;
                        top: 0px;
                        will-change: transform;
                        transform-origin: 60px 28px;
                        display: flex;
                    }
                    ${css}    
                `
            );
            // Add key (required)
            // Add class prefix moveable-(required)
            return React.createElement(
                editableViewer,
                {
                    className: 'moveable-editable',
                    style: {
                        transform: `translate(${pos2[0] - 60}px, ${
                            pos2[1] - 28
                        }px) rotate(${rect.rotation}deg)`,
                    },
                },
                [
                    React.createElement(
                        'button',
                        {
                            className: 'moveable-button',
                            title: '选中父组件',
                            onClick: () => {
                                handler(AbleActionEventType.SELECT_PARENT);
                            },
                        },
                        React.createElement('div', {
                            className: 'moveable-select-parent-arrow-top-icon',
                        }),
                        React.createElement('div', {
                            className: 'moveable-select-parent-arrow-body-icon',
                        })
                    ),
                    React.createElement('button', {
                        className: 'moveable-button moveable-remove-button',
                        title: '删除',
                        onClick: () => {
                            handler(AbleActionEventType.REMOVE);
                        },
                    }),
                    React.createElement(
                        'button',
                        {
                            className:
								'moveable-button moveable-drag-area-button',
                            title: '拖动',
                        },
                        React.createElement('div', {
                            className:
								'moveable-select-parent-arrow-top-icon moveable-select-parent-arrow-top-icon-top',
                        }),
                        React.createElement('div', {
                            className:
								'moveable-select-parent-arrow-top-icon moveable-select-parent-arrow-top-icon-bottom',
                        }),
                        React.createElement('div', {
                            className:
								'moveable-select-parent-arrow-top-icon moveable-select-parent-arrow-top-icon-left',
                        }),
                        React.createElement('div', {
                            className:
								' moveable-select-parent-arrow-top-icon moveable-select-parent-arrow-top-icon-right',
                        }),
                        React.createElement('div', {
                            className:
								'moveable-select-parent-arrow-body-icon-horizontal',
                        }),
                        React.createElement('div', {
                            className:
								'moveable-select-parent-arrow-body-icon-vertical',
                        })
                    )
                ]
            );
        },
    };
}
