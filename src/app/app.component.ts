import { AfterViewChecked, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CoreComponent } from './core/core.component';
import { KontentService } from './services/kontent.service';
import { map } from 'rxjs';
import { FormControl } from '@angular/forms';

export interface IPin {
    top: number;
    left: number;
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent extends CoreComponent implements OnInit, AfterViewChecked {
    // base
    public loading: boolean = false;
    public errorMessage?: string;
    public infoMessage?: string;
    public readonly showPinText: boolean = false;

    // state
    public disabled: boolean = false;

    //  asset
    public assetUrl?: string;

    // pins
    public get pins(): IPin[] {
        if (this.topControl.value && this.leftControl) {
            return [
                {
                    left: this.leftControl.value,
                    top: this.topControl.value
                }
            ];
        }

        return [];
    }

    public assetTextControl: FormControl = new FormControl();
    public topControl: FormControl = new FormControl(50);
    public leftControl: FormControl = new FormControl(50);

    constructor(private kontentService: KontentService, cdr: ChangeDetectorRef) {
        super(cdr);
    }

    ngOnInit(): void {
        this.subscribeToFormControlChanges();

        if (this.isKontentContext()) {
            this.kontentService.initCustomElement(
                (data) => {
                    this.disabled = data.isDisabled;

                    this.assetTextControl.setValue(data.value);
                },
                (error) => {
                    console.error(error);
                    this.errorMessage = `Could not initialize custom element. Custom elements can only be embedded in an iframe`;
                    super.detectChanges();
                }
            );
        } else {
            this.assetTextControl.setValue(environment.kontent.assetId);
        }
    }

    ngAfterViewChecked(): void {
        // update size of Kontent UI
        if (this.isKontentContext()) {
            // this is required because otherwise the offsetHeight can return 0 in some circumstances
            // https://stackoverflow.com/questions/294250/how-do-i-retrieve-an-html-elements-actual-width-and-height
            setTimeout(() => {
                const htmlElement = document.getElementById('htmlElem');
                if (htmlElement) {
                    const height = htmlElement.offsetHeight;
                    this.kontentService.updateSizeToMatchHtml(height);
                }
            }, 50);
        }
    }

    clearAsset(): void {
        this.assetTextControl.setValue(null);
        this.assetUrl = undefined;
    }

    clearTop(): void {
        this.topControl.setValue(null);
    }

    clearLeft(): void {
        this.leftControl.setValue(null);
    }

    handleSelectAsset(): void {
        const obs = this.kontentService.selectAsset();

        if (obs) {
            super.subscribeToObservable(
                obs.pipe(
                    map((assetId) => {
                        if (assetId) {
                            this.assetTextControl.setValue(assetId);
                            super.markForCheck();
                        }
                    })
                )
            );
        }
    }

    private subscribeToFormControlChanges(): void {
        super.subscribeToObservable(
            this.topControl.valueChanges.pipe(
                map((value) => {
                    super.markForCheck();
                })
            )
        );

        super.subscribeToObservable(
            this.leftControl.valueChanges.pipe(
                map((value) => {
                    super.markForCheck();
                })
            )
        );

        super.subscribeToObservable(
            this.assetTextControl.valueChanges.pipe(
                map((value) => {
                    this.assetUrl = undefined;
                    this.kontentService.setValue(value ?? null);

                    if (value) {
                        this.initAssetDetails(value);
                    }
                    super.markForCheck();
                })
            )
        );
    }

    private initAssetDetails(assetId: string): void {
        const obs = this.kontentService.getAssetDetails(assetId);

        if (obs) {
            super.subscribeToObservable(
                obs.pipe(
                    map((asset) => {
                        if (asset) {
                            this.assetUrl = asset.url;
                            super.markForCheck();
                        }
                    })
                )
            );
        }
    }

    private isKontentContext(): boolean {
        return environment.production;
    }
}
