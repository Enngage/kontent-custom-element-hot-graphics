import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { AppComponent } from './app.component';
import { AppFlexModule } from './flex';
import { LineClampDirective } from './core/line-clamp.directive';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
    declarations: [AppComponent, LineClampDirective],
    imports: [
        BrowserModule,
        AppFlexModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        MatIconModule,
        MatButtonModule,
        DragDropModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {}
