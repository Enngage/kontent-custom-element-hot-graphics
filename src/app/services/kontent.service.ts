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
    apiKey?: string;
    overwriteExistingVariants?: boolean;
    projectId?: string;
    context: ICustomElementContext;
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

                onInit({
                    context: context,
                    value: element.value,
                    overwriteExistingVariants: element.config.overwriteExistingVariants,
                    isDisabled: element.disabled,
                    apiKey: element.config.apiKey,
                    projectId: element.config.projectId
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
