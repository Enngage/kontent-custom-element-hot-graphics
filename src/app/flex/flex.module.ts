import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
    FlexColumnAlignDirective,
    FlexColumnDirective,
    FlexFillDirective,
    FlexRowAlignDirective,
    FlexRowDirective,
    FlexRowGapDirective,
    FlexSizeDirective
} from './flex.directives';

@NgModule({
    imports: [CommonModule],
    declarations: [
        FlexRowDirective,
        FlexColumnDirective,
        FlexFillDirective,
        FlexSizeDirective,
        FlexRowAlignDirective,
        FlexRowGapDirective,
        FlexColumnAlignDirective
    ],
    exports: [
        FlexRowDirective,
        FlexColumnDirective,
        FlexFillDirective,
        FlexSizeDirective,
        FlexRowAlignDirective,
        FlexRowGapDirective,
        FlexColumnAlignDirective
    ]
})
export class AppFlexModule {}
