import { Injectable } from '@angular/core';
import { from, map, Observable, Subject } from 'rxjs';

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
    context: ICustomElementContext;
    getElementValue: (elementCodename: string) => string | undefined;
}

interface AssetReference {
    id: string;
}

export interface IAsset {
    id: string;
    url: string;
    size: number;
    name: string;
    fileName: string;
}

@Injectable({ providedIn: 'root' })
export class KontentService {
    public disabledChanged = new Subject<boolean>();
    private initialized: boolean = false;

    constructor() {}

    initCustomElement(onInit: (data: IElementInit) => void, onError: (error: any) => void): void {
        try {
            CustomElement.init((element: any, context: ICustomElementContext) => {
                this.initialized = true;

                CustomElement.onDisabledChanged((disabled: boolean) => {
                    this.disabledChanged.next(disabled);
                });

                onInit({
                    context: context,
                    value: element.value,
                    isDisabled: element.disabled,
                    getElementValue: (elementCodename) => CustomElement.getElementValue(elementCodename)
                });
            });
        } catch (error) {
            onError(error);
        }
    }

    setValue(value: string | null): void {
        if (this.initialized) {
            CustomElement.setValue(value);
        }
    }

    updateSizeToMatchHtml(height: number): void {
        if (this.initialized) {
            CustomElement.setHeight(height);
        }
    }

    getAssetDetails(assetId: string): Observable<IAsset | null> | null {
        if (this.initialized) {
            const selectAssetPromise = CustomElement.getAssetDetails([assetId]) as Promise<IAsset[] | null>;

            if (selectAssetPromise) {
                return from(selectAssetPromise).pipe(
                    map((result) => {
                        if (result && result.length) {
                            return result[0];
                        }

                        return null;
                    })
                );
            }
        }

        return null;
    }

    selectAsset(): Observable<string | null> | null {
        if (this.initialized) {
            const selectAssetPromise = CustomElement.selectAssets({
                allowMultiple: false,
                fileType: 'images'
            }) as Promise<AssetReference[] | null>;

            if (selectAssetPromise) {
                return from(selectAssetPromise).pipe(
                    map((result) => {
                        if (result && result.length) {
                            return result[0].id;
                        }

                        return null;
                    })
                );
            }
        }

        return null;
    }
}
