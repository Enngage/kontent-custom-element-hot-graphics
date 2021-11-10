import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

declare const CustomElement: any;

export interface ICustomElementContext {
    item: {
        codename: string;
        id: string;
        name: string;
    };
    projectId: string;
    variant: {
        id: string;
        codename: string;
    };
}

interface IElementInit {
    isDisabled: boolean;
    value?: string;
    projectId?: string;
    previewApiKey?: string;
    context: ICustomElementContext;
    getElementValue: (elementCodename: string) => string | undefined;
}

@Injectable({ providedIn: 'root' })
export class KontentService {
    public disabledChanged = new Subject<boolean>();
    private initialized: boolean = false;

    constructor() {}

    initCustomElement(onInit: (data: IElementInit) => void, onError: (error: any) => void): void {
        try {
            CustomElement.init((element: any, context: ICustomElementContext) => {
                CustomElement.onDisabledChanged((disabled: boolean) => {
                    this.disabledChanged.next(disabled);
                });

                console.log('element', element);
                console.log(context);

                onInit({
                    context: context,
                    value: element.value,
                    isDisabled: element.disabled,
                    projectId: element.config.projectId,
                    previewApiKey: element.config.previewApiKey,
                    getElementValue: (elementCodename) => CustomElement.getElementValue(elementCodename)
                });

                this.initialized = true;
            });
        } catch (error) {
            onError(error);
        }
    }

    updateSizeToMatchHtml(height: number): void {
        if (this.initialized) {
            CustomElement.setHeight(height);
        }
    }
}
