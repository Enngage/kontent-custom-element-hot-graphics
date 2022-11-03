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
import { map, Observable, of, switchMap } from 'rxjs';
import { CdkDragEnd, Point } from '@angular/cdk/drag-drop';

interface IElementStoredPin {
    x: number;
    y: number;
    text: string;
    imageWidth: number;
    imageHeight: number;
}

interface IElementStoredValue {
    // asset
    assetUrl: string;
    assetId: string;

    // pins
    pins: IElementStoredPin[];
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

    // data
    public assetUrl?: string;
    public assetId?: string;
    public pins: IElementStoredPin[] = [];

    // state
    public disabled: boolean = false;
    private initPins: boolean = false;

    @ViewChild('imageElem') imageElementRef?: ElementRef;

    constructor(private kontentService: KontentService, cdr: ChangeDetectorRef) {
        super(cdr);
    }

    ngOnInit(): void {
        if (this.isKontentContext()) {
            this.kontentService.initCustomElement(
                (data) => {
                    this.disabled = data.isDisabled;

                    if (data.value) {
                        const storedData: IElementStoredValue = JSON.parse(data.value);

                        this.assetId = storedData.assetId;
                        this.assetUrl = storedData.assetUrl;
                    }
                },
                (error) => {
                    console.error(error);
                    this.errorMessage = `Could not initialize custom element. Custom elements can only be embedded in an iframe`;
                    super.detectChanges();
                }
            );
        } else {
            this.assetId = 'n/a';
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
            const imageWidth = this.imageElementRef.nativeElement.offsetWidth;
            const imageHeight = this.imageElementRef.nativeElement.offsetHeight;

            const x = this.pinWidth / 2;
            const y = this.pinWidth / 2;

            this.pins.push({
                y: y,
                x: x,
                text: 'n/a',            
                imageWidth: imageWidth,
                imageHeight: imageHeight
            });
        }
    }

    deletePin(index: number): void {
        this.pins.splice(index, 1);
    }

    dragEnded(event: CdkDragEnd, pin: IElementStoredPin): void {
        if (this.imageElementRef) {
            const percentage = this.calculatePinCoordinatesAfterDrop(event);

            pin.x = percentage.x;
            pin.y = percentage.y;

            pin.imageWidth = this.imageElementRef.nativeElement.offsetWidth;
            pin.imageHeight = this.imageElementRef.nativeElement.offsetHeight;
        }
    }

    clearAsset(): void {
        this.assetId = undefined;
        this.assetUrl = undefined;
    }

    handleSelectAsset(): void {
        const obs = this.kontentService.selectAsset();

        if (obs) {
            super.subscribeToObservable(
                obs.pipe(
                    switchMap((assetId) => {
                        if (assetId) {
                            this.assetId = assetId;

                            return this.initAssetDetails(assetId);
                        }

                        return of(undefined);
                    }),
                    map(() => {
                        super.markForCheck();
                    })
                )
            );
        }
    }

    calculateOffsetForPin(pin: IElementStoredPin, imageRef: HTMLImageElement): { top: number; left: number } {
        return {
            top: (imageRef.offsetHeight * pin.y) / pin.imageHeight,
            left: (imageRef.offsetWidth * pin.x) / pin.imageWidth
        };
    }

    roundCoordinate(coordinate: number): string {
        return coordinate.toFixed(2);
    }

    calculateFreeDragPoint(pin: IElementStoredPin, imageRef: HTMLImageElement): Point {
        const point: Point = {
            y: (imageRef.offsetHeight * pin.y) / pin.imageHeight - this.pinHeight / 2,
            x: (imageRef.offsetWidth * pin.x) / pin.imageWidth - this.pinWidth / 2
        };

        return point;
    }

    private getValueToStoreInCustomElement(): string | null {
        if (this.assetId && this.assetUrl) {
            const valueToStore: IElementStoredValue = {
                assetId: this.assetId,
                assetUrl: this.assetUrl,
                pins: []
            };
            return JSON.stringify(valueToStore);
        }

        return null;
    }

    private initAssetDetails(assetId: string): Observable<void> {
        const obs = this.kontentService.getAssetDetails(assetId);

        if (obs) {
            super.subscribeToObservable(
                obs.pipe(
                    map((asset) => {
                        if (asset) {
                            this.assetUrl = asset.url;

                            // store data
                            this.storeCurrentValues();

                            super.markForCheck();
                        }
                    })
                )
            );
        }

        return of(undefined);
    }

    private storeCurrentValues(): void {
        this.kontentService.setValue(this.getValueToStoreInCustomElement());
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
