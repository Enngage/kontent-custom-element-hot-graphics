import { Directive, ElementRef, Input, OnChanges, OnInit, Renderer2, SimpleChanges } from '@angular/core';

@Directive({
    selector: '[libLineClamp]'
})
export class LineClampDirective implements OnChanges, OnInit {
    private readonly defaultClampLines: number = 1;

    @Input() clampLines?: number;

    constructor(private renderer: Renderer2, private hostElement: ElementRef) {}

    ngOnInit(): void {
        this.setClampStyles();
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.setClampStyles();
    }

    setClampStyles(): void {
        // webkit line clamp https://stackoverflow.com/questions/3404508/cross-browser-multi-line-text-overflow-with-ellipsis-appended-within-a-fixed-wid
        if (this.hostElement.nativeElement) {
            this.renderer.setStyle(this.hostElement.nativeElement, '-webkit-line-clamp', this.clampLines ?? this.defaultClampLines);
            this.renderer.setStyle(this.hostElement.nativeElement, 'display', '-webkit-box');
            this.renderer.setStyle(this.hostElement.nativeElement, '-webkit-box-orient', 'vertical');
            this.renderer.setStyle(this.hostElement.nativeElement, 'overflow', 'hidden');
            this.renderer.setStyle(this.hostElement.nativeElement, 'word-break', 'break-word');
        }
    }
}
