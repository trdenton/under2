import { Component, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {

  public mapViewer: Cesium.Viewer;

  public geoJsonData: Cesium.GeoJsonDataSource;

  private container: string;

  constructor(public navCtrl: NavController) {
    this.container = "mapContainer";

  }

  public ngOnInit() {
    const imageryProv: any = new Cesium.ArcGisMapServerImageryProvider({
      url:
        "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"
    });
    this.mapViewer = new Cesium.Viewer(this.container);
    Cesium.GeoJsonDataSource.load('../../assets/data/sample.geojson', {
      stroke: Cesium.Color.HOTPINK,
      fill: Cesium.Color.PINK,
      strokeWidth: 3,
      markerSymbol: '?'
    })
      .then(res => {
        this.geoJsonData = res;

        const mappedEntities = res.entities.values.map(ent => {
          const testEntity: Cesium.Entity = this.mapViewer.entities.add(ent);
          this.mapViewer.zoomTo(testEntity);
          return testEntity;
        })

        const index = this.getIndex(res.entities.values);
        const normIndex = this.normaliseValues(index);

        mappedEntities.forEach((ent, i) => {
          this.colorByScale(ent, normIndex[i]);
        })

        
        // TODO: Do stuff with data before adding to map

        this.mapViewer.dataSources.add(this.geoJsonData);
      })
  }

  public getIndex(entities: Cesium.Entity[]) {
    const timeNow = Cesium.JulianDate.now();
    return entities.map((entity) => {
      const properties = entity.properties.getValue(Cesium.JulianDate.now());
      return properties.total_assessed_value / properties.assessed_land_area;
    });
  }

  public normaliseValues(values: number[]) {
    const max = Math.max(...values);
    return values.map(val => {
      return val / max;
    });
  }

  public colorByScale(entity: Cesium.Entity, scalar: number) {
    let color: Cesium.Color;
    const cssColor = this.perc2color(scalar);
    color = Cesium.Color.fromCssColorString(cssColor);
    entity.polygon.material = color;
  }

  public perc2color(perc) {
    perc = perc * 100;
    var r, g, b = 0;
    if(perc < 50) {
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
  

}
