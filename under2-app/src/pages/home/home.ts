import { Component, OnInit } from '@angular/core';
import { NavController, MenuController } from 'ionic-angular';
import { collectExternalReferences } from '@angular/compiler/src/output/output_ast';

import { BackgroundService } from '../../app/background.service';
import { SERVER_TRANSITION_PROVIDERS } from '@angular/platform-browser/src/browser/server-transition';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {

  public mapViewer: Cesium.Viewer;

  public geoJsonData: Cesium.GeoJsonDataSource;

  private container: string;

  private denominatorProperty = "assessed_land_area";
  private numeratorProperty = "total_assessed_value";

  private requestRadius: number;

  constructor(public navCtrl: NavController, private menu: MenuController, private bgService: BackgroundService) {
    menu.enable(true);
    this.container = "mapContainer";

    const extent = Cesium.Rectangle.fromDegrees(
      -97.13866408, 49.89561288,
      -97.1373337, 49.89476969
    );

    Cesium.Camera.DEFAULT_VIEW_RECTANGLE = extent;
    Cesium.Camera.DEFAULT_VIEW_FACTOR = 0;

    this.bgService.denominatorSource$.subscribe(denom => {
      this.denominatorProperty = denom;
      this.updateEntities();
    })

    this.bgService.numeratorSource$.subscribe(numer => {
      this.numeratorProperty = numer;
      this.updateEntities();
    })

  }

  public generateGeoJSONURL(latitude, longitude, radius) {

    var api_string = "https://data.winnipeg.ca/resource/94a6-v8ue.geojson?$where=within_circle(location," + latitude + "," + longitude + "," + this.requestRadius + ")";
    return api_string;

  }

  public updateDataFromAPI() {
    var camPos = this.mapViewer.camera.positionCartographic;
    //console.log(camPos);
    var api_string = this.generateGeoJSONURL(Cesium.Math.toDegrees(camPos.latitude), Cesium.Math.toDegrees(camPos.longitude), 100);
    console.log(api_string);
    Cesium.GeoJsonDataSource.load(api_string, {
      stroke: Cesium.Color.HOTPINK,
      fill: Cesium.Color.PINK,
      strokeWidth: 3,
      markerSymbol: '$'
    })
      .then(res => {
        this.geoJsonData = res;
        this.mapViewer.entities.removeAll();

        const mappedEntities = res.entities.values.map(ent => {
          const testEntity: Cesium.Entity = this.mapViewer.entities.add(ent);
          // this.mapViewer.zoomTo(testEntity);
          return testEntity;
        });
        this.updateEntities();

        // this.mapViewer.dataSources.add(this.geoJsonData);
        setTimeout(this.updateDataFromAPI.bind(this), 5000);

      })
  }

  private updateEntities() {
    const entities = this.mapViewer.entities.values;
    const index = this.getIndex(entities);
    const normIndex = this.normaliseValues(index);
    this.colorEntities(entities, normIndex);
  }

  private colorEntities(mappedEntities: Cesium.Entity[], normIndex: number[]) {
    mappedEntities.forEach((ent, i) => {
      const color = this.colorFromScale(ent, normIndex[i]);
      if (typeof ent.billboard !== "undefined") {
        ent.billboard.color = color;
      }
      else if (typeof ent.polygon !== "undefined") {
        ent.polygon.material = color;
      }
    });
  }

  public ngOnInit() {
    const imageryProv: any = new Cesium.ArcGisMapServerImageryProvider({
      url:
        "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"
    });


    // Create an initial camera view
    let initialPosition = Cesium.Cartesian3.fromDegrees(-97.13866408, 49.89561288, 600);
    var initialOrientation = Cesium.HeadingPitchRoll.fromDegrees(7.1077496389876024807, -31.987223091598949054, 0.025883251314954971306);
    var homeCameraView = {
      destination: initialPosition,
    };

    this.mapViewer = new Cesium.Viewer(this.container);
    this.mapViewer.scene.camera.setView(homeCameraView);
    
    this.requestRadius = this.getViewWidth();

    //var api_string = this.generateGeoJSONURL(49.89561288,-97.13866408,200);
    //var api_string = "https://data.winnipeg.ca/resource/94a6-v8ue.geojson?$where=within_circle(location," + camPos.longitude + "," + camPos.latitude + ",100)";

    this.updateDataFromAPI();

  }

  public getIndex(entities: Cesium.Entity[]) {
    const timeNow = Cesium.JulianDate.now();
    return entities.map((entity) => {
      const properties = entity.properties.getValue(Cesium.JulianDate.now());
      return properties[this.numeratorProperty] / properties[this.denominatorProperty];
    });
  }

  public normaliseValues(values: number[]) {
    values.forEach((val, i) => {
      // console.debug(`checking ${val}`);
      if (val === Infinity || isNaN(val)) {
        values[i] = 0;
        // console.debug("Changing value")
      }
    })
    // console.debug(values);
    const max = Math.max(...values);
    return values.map(val => {
      return val / max;
    });
  }

  public colorFromScale(entity: Cesium.Entity, scalar: number) {
    let color: Cesium.Color;
    const cssColor = this.perc2color(scalar);
    return Cesium.Color.fromCssColorString(cssColor);
  }

  public perc2color(perc) {
    perc = perc * 100;
    var r, g, b = 0;
    if (perc < 50) {
      r = 255;
      g = Math.round(5.1 * perc);
    }
    else {
      g = 255;
      r = Math.round(510 - 5.10 * perc);
    }
    var h = r * 0x10000 + g * 0x100 + b * 0x1;
    return '#' + ('000000' + h.toString(16)).slice(-6);
  }

  public getViewWidth() {
    const rectangle = this.mapViewer.camera.computeViewRectangle();
    console.debug(rectangle);
    const eastCoord = new Cesium.Cartographic(rectangle.east, rectangle.north);
    const westCoord = new Cesium.Cartographic(rectangle.west, rectangle.north);
    const geodesic = new Cesium.EllipsoidGeodesic(eastCoord, westCoord);
    return geodesic.surfaceDistance;
  }

}
