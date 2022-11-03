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
import { CdkDragEnd, Point } from '@angular/cdk/drag-drop';

export interface IPin {
    x: number;
    y: number;
    text: string;
    imageWidth: number;
    imageHeight: number;
    freeDragPoint: Point
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent extends CoreComponent implements OnInit, AfterViewChecked {

    // default pin state
    private readonly pinHeight: number = 40;
    private readonly pinWidth: number = 40;

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

    @ViewChild('imageElem') imageElementRef?: ElementRef;

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
        if (this.imageElementRef) {
            this.pins.push({
                y: this.pinHeight/ 2,
                x: this.pinWidth / 2,
                text: 'n/a',
                freeDragPoint: this.getFreeDragPoint()
                imageWidth: this.imageElementRef.nativeElement.offsetWidth,
                imageHeight: this.imageElementRef.nativeElement.offsetHeight
            });
        }
    }

    deletePin(index: number): void {
        this.pins.splice(index, 1);
    }

    dragEnded(event: CdkDragEnd, pin: IPin): void {
        if (this.imageElementRef) {
            const percentage = this.calculatePinCoordinatesAfterDrop(event);

            pin.x = percentage.x;
            pin.y = percentage.y;

            pin.imageWidth = this.imageElementRef.nativeElement.offsetWidth;
            pin.imageHeight = this.imageElementRef.nativeElement.offsetHeight;
        }
    }

    getFreeDragPoint(pin: IPin, imageRef: HTMLImageElement, pinRef: HTMLDivElement): Point {
        const heightOfPin: number = pinRef.offsetHeight;
        const widthOfPin: number = pinRef.offsetWidth;

        const point: Point = {
            y: (imageRef.offsetHeight * pin.y) / pin.imageHeight - heightOfPin / 2,
            x: (imageRef.offsetWidth * pin.x) / pin.imageWidth - widthOfPin / 2
        };

        console.log('test 1', pin, imageRef, pinRef);

        return point;
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

    calculateOffsetForPin(pin: IPin, imageRef: HTMLImageElement): { top: number; left: number } {
        return {
            top: (imageRef.offsetHeight * pin.y) / pin.imageHeight,
            left: (imageRef.offsetWidth * pin.x) / pin.imageWidth
        };
    }

    roundCoordinate(coordinate: number): string {
        return coordinate.toFixed(2);
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

    private calculatePinCoordinatesAfterDrop(event: CdkDragEnd): { x: number; y: number } {
        const heightOfPin: number = event.source.element.nativeElement.offsetHeight;
        const widthOfPin: number = event.source.element.nativeElement.offsetWidth;

        const freeDragPosition = event.source.getFreeDragPosition();

        const rawX = Math.round(freeDragPosition.x + widthOfPin / 2);
        const rawY = Math.round(freeDragPosition.y + heightOfPin / 2);

        return {
            x: rawX,
            y: rawY
        };
    }
}
