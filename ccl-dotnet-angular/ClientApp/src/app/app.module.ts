import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule } from "@angular/router";
import { ClarityModule } from "@clr/angular";
import { NgxsReduxDevtoolsPluginModule } from "@ngxs/devtools-plugin";
import { NgxsLoggerPluginModule } from "@ngxs/logger-plugin";
import { NgxsModule } from "@ngxs/store";
import { environment } from "src/environments/environment";
import { ShipState } from "src/store/ship.state";
import { AppComponent } from "./app.component";
import { CanvasComponent } from "./components/canvas/canvas.component";
import { ControlPanelComponent } from "./components/control-panel/control-panel.component";

@NgModule({
  declarations: [AppComponent, ControlPanelComponent, CanvasComponent],
  imports: [
    BrowserModule.withServerTransition({ appId: "ng-cli-universal" }),
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot([]),
    NgxsModule.forRoot([ShipState], {
      developmentMode: !environment.production
    }),
    NgxsLoggerPluginModule.forRoot({ disabled: !environment.production }),
    NgxsReduxDevtoolsPluginModule.forRoot({
      disabled: !environment.production
    }),
    ClarityModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
