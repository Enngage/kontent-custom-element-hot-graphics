import {
    AfterViewChecked,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    ElementRef,
    OnInit,
    ViewChild
} from '@angular/core';
import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CoreComponent } from './core/core.component';
import { KontentService } from './services/kontent.service';
import { map } from 'rxjs';
import { UntypedFormControl } from '@angular/forms';
import { CdkDragEnd } from '@angular/cdk/drag-drop';

export interface IPin {
    x: number;
    y: number;
    text: string;
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
    public readonly showPinText: boolean = true;

    // state
    public disabled: boolean = false;

    //  asset
    public assetUrl?: string;

    // pins
    public pins: IPin[] = [];

    public assetTextControl: UntypedFormControl = new UntypedFormControl();

    @ViewChild('pinImageElement') pinImageElement?: ElementRef;

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
            this.assetTextControl.setValue('');
            this.assetUrl = environment.kontent.defaultImageUrl;
            this.pins.push({
                y: 50,
                x: 50,
                text: 'Placeholder text'
            });
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

    addNewPin(): void {
        this.pins.push({
            y: 50,
            x: 50,
            text: 'n/a'
        });
    }

    deletePin(index: number): void {
        this.pins.splice(index, 1);
    }

    dragEnded(event: CdkDragEnd, pin: IPin): void {
        if (this.pinImageElement) {
            const percentage = this.calculatePercentage(event, this.pinImageElement);
            const freeDragPosition = event.source.getFreeDragPosition();
            pin.x = percentage.x;
            pin.y = percentage.y;

            console.log('percentage', percentage);
            console.log(event);
        }
    }

    clearAsset(): void {
        this.assetTextControl.setValue(null);
        this.assetUrl = undefined;
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

    private calculatePercentage(event: CdkDragEnd, pinImage: ElementRef): { x: number; y: number } {
        const heightOfPin: number = event.source.element.nativeElement.offsetHeight;
        const widthOfPin: number = event.source.element.nativeElement.offsetWidth;

        const width = pinImage.nativeElement.offsetWidth + (widthOfPin / 2);
        const height = pinImage.nativeElement.offsetHeight + (heightOfPin / 2);

        const freeDragPosition = event.source.getFreeDragPosition();
        console.log('Free drag', freeDragPosition);

        console.log('Height of pin:', heightOfPin);
        console.log('Width of pin:', widthOfPin);

        console.log(`Width: ${width}`);
        console.log(`Height: ${height}`);

        console.log(`Drop point X: ${event.dropPoint.x}`);
        console.log(`Drop point Y: ${event.dropPoint.y}`);

        // prevent overflow from drag container
        const rawX = freeDragPosition.x;
        const rawY = freeDragPosition.y;

        console.log(`Raw X: ${rawX}`);
        console.log(`Raw Y: ${rawY}`);

        let calculatedX: number;
        let calculatedY: number;

        if (rawX > width) {
            calculatedX = width - widthOfPin;
        } else if (rawX < 0) {
            calculatedX = 0;
        } else {
            calculatedX = rawX - (widthOfPin / 2);
        }

        if (rawY > height) {
            calculatedY = height - heightOfPin;
        } else if (rawY < 0) {
            calculatedY = 0;
        } else {
            calculatedY = rawY;
        }

        console.log('calculated x', calculatedX);
        console.log('calculated y', calculatedY);

        return {
            //x: Math.round(calculatedX / width * 100),
            // y: Math.round(calculatedY / height * 100),
            x: (calculatedX / width) * 100,
            y: (calculatedY / height) * 100
        };
    }
}
