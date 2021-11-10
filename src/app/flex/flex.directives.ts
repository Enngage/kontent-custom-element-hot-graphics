import { Directive, ElementRef, Input, OnChanges, OnInit, Renderer2, SimpleChanges } from '@angular/core';
import { FlexColumnAlign, FlexRowAlign, FlexRowGap, FlexSize } from './flex.models';

@Directive({
    selector: '[libFlexRow]'
})
export class FlexRowDirective implements OnInit, OnChanges {
    @Input('libFlexRow') wrap?: boolean | string = false;

    private previousWrap?: boolean | string;

    constructor(private renderer: Renderer2, private hostElement: ElementRef) {}

    ngOnInit(): void {
        if (this.hostElement.nativeElement) {
            this.renderer.addClass(this.hostElement.nativeElement, `w-flex-row`);
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.hostElement.nativeElement) {
            if (this.previousWrap === true) {
                this.renderer.removeClass(this.hostElement.nativeElement, `w-flex-wrap`);
            }
        }

        if (this.wrap === true) {
            this.renderer.addClass(this.hostElement.nativeElement, `w-flex-wrap`);
        }
    }
}

@Directive({
    selector: '[libFlexColumn]'
})
export class FlexColumnDirective implements OnInit {
    constructor(private renderer: Renderer2, private hostElement: ElementRef) {}

    ngOnInit(): void {
        if (this.hostElement.nativeElement) {
            this.renderer.addClass(this.hostElement.nativeElement, 'w-flex-column');
        }
    }
}

@Directive({
    selector: '[libFlexFill]'
})
export class FlexFillDirective implements OnInit {
    constructor(private renderer: Renderer2, private hostElement: ElementRef) {}

    ngOnInit(): void {
        if (this.hostElement.nativeElement) {
            this.renderer.addClass(this.hostElement.nativeElement, 'w-flex-fill');
        }
    }
}

@Directive({
    selector: '[libFlexSize]'
})
export class FlexSizeDirective implements OnInit, OnChanges {
    @Input('libFlexSize') flexSize?: FlexSize;

    private previousFlexSize?: FlexSize;

    constructor(private renderer: Renderer2, private hostElement: ElementRef) {}

    ngOnInit(): void {
        if (this.hostElement.nativeElement && this.flexSize) {
            this.renderer.addClass(this.hostElement.nativeElement, `w-flex-${this.flexSize}`);
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.previousFlexSize && this.hostElement.nativeElement) {
            this.renderer.removeClass(this.hostElement.nativeElement, `w-flex-${this.previousFlexSize}`);
        }

        this.previousFlexSize = this.flexSize;

        if (this.hostElement.nativeElement && this.flexSize) {
            this.renderer.addClass(this.hostElement.nativeElement, `w-flex-${this.flexSize}`);
        }
    }
}

@Directive({
    selector: '[libFlexRowAlign]'
})
export class FlexRowAlignDirective implements OnInit, OnChanges {
    @Input('libFlexRowAlign') flexSize?: FlexRowAlign;

    private previousAlign?: FlexRowAlign;

    constructor(private renderer: Renderer2, private hostElement: ElementRef) {}

    ngOnInit(): void {
        if (this.hostElement.nativeElement && this.flexSize) {
            this.renderer.addClass(this.hostElement.nativeElement, `w-flex-row-align-${this.flexSize}`);
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.previousAlign && this.hostElement.nativeElement) {
            this.renderer.removeClass(this.hostElement.nativeElement, `w-flex-row-align-${this.previousAlign}`);
        }

        this.previousAlign = this.flexSize;

        if (this.hostElement.nativeElement && this.flexSize) {
            this.renderer.addClass(this.hostElement.nativeElement, `w-flex-row-align-${this.flexSize}`);
        }
    }
}

@Directive({
    selector: '[libFlexColumnAlign]'
})
export class FlexColumnAlignDirective implements OnInit, OnChanges {
    @Input('libFlexColumnAlign') flexSize?: FlexColumnAlign;

    private previousAlign?: FlexColumnAlign;

    constructor(private renderer: Renderer2, private hostElement: ElementRef) {}

    ngOnInit(): void {
        if (this.hostElement.nativeElement && this.flexSize) {
            this.renderer.addClass(this.hostElement.nativeElement, `w-flex-align-${this.flexSize}`);
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.previousAlign && this.hostElement.nativeElement) {
            this.renderer.removeClass(this.hostElement.nativeElement, `w-flex-align-${this.previousAlign}`);
        }

        this.previousAlign = this.flexSize;

        if (this.hostElement.nativeElement && this.flexSize) {
            this.renderer.addClass(this.hostElement.nativeElement, `w-flex-align-${this.flexSize}`);
        }
    }
}

@Directive({
    selector: '[libFlexRowGap]'
})
export class FlexRowGapDirective implements OnInit, OnChanges {
    @Input('libFlexRowGap') flexSize?: FlexRowGap;

    private previousGap?: FlexRowGap;

    constructor(private renderer: Renderer2, private hostElement: ElementRef) {}

    ngOnInit(): void {
        if (this.hostElement.nativeElement && this.flexSize) {
            this.renderer.addClass(this.hostElement.nativeElement, `w-flex-row-gap-${this.flexSize}`);
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.previousGap && this.hostElement.nativeElement) {
            this.renderer.removeClass(this.hostElement.nativeElement, `w-flex-row-gap-${this.previousGap}`);
        }

        this.previousGap = this.flexSize;

        if (this.hostElement.nativeElement && this.flexSize) {
            this.renderer.addClass(this.hostElement.nativeElement, `w-flex-row-gap-${this.flexSize}`);
        }
    }
}
